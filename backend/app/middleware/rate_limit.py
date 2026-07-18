"""Tiered rate limiting middleware (H-04 fix).

Public routes (fan-facing, no auth) get stricter limits (30 req/min)
because they're the higher-abuse-risk surface with no identity check.
Authenticated/staff routes get relaxed limits (200 req/min).

In production, this should be backed by Redis for cross-instance state.
Currently uses in-memory storage with automatic TTL-based cleanup
to prevent the memory leak from the original implementation.
"""
from fastapi import Request
from fastapi.responses import JSONResponse
import time
import redis
import logging
from app.config import settings

logger = logging.getLogger(__name__)

# Public prefixes that get stricter rate limits
PUBLIC_PREFIXES = ("/v1/crowd/", "/v1/navigate/", "/v1/chat/")

# Rate limit configuration
PUBLIC_LIMIT = 30       # requests per window for public routes
STAFF_LIMIT = 200       # requests per window for authenticated routes
WINDOW_SECONDS = 60     # sliding window duration
CLEANUP_INTERVAL = 300  # prune expired entries every 5 minutes


class RateLimitMiddleware:
    def __init__(self, limit: int = 100, window: int = 60):
        # These are now fallback defaults; tiered limits are applied per-route
        self.default_limit = limit
        self.window = WINDOW_SECONDS
        self._store: dict[str, dict] = {}
        self._last_cleanup = time.time()
        
        # Initialize Redis client if configured
        self.redis_client = None
        if settings.redis_url:
            try:
                self.redis_client = redis.Redis.from_url(
                    settings.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=2
                )
                self.redis_client.ping()
                logger.info("Connected to Redis for rate limiting")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis ({str(e)}), rate limiting will fall back to in-memory store")
                self.redis_client = None

    def _cleanup_expired(self, now: float) -> None:
        """Remove entries whose windows have expired to prevent memory leak."""
        if now - self._last_cleanup < CLEANUP_INTERVAL:
            return
        expired_keys = [
            k for k, v in self._store.items()
            if now - v["start_time"] > self.window * 2
        ]
        for k in expired_keys:
            del self._store[k]
        self._last_cleanup = now

    def _get_limit_for_path(self, path: str) -> int:
        """Return the rate limit based on route tier."""
        for prefix in PUBLIC_PREFIXES:
            if path.startswith(prefix):
                return PUBLIC_LIMIT
        return STAFF_LIMIT

    async def __call__(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path
        limit = self._get_limit_for_path(path)
        current_time = time.time()

        # Composite key: IP + route tier for separate buckets
        is_public = any(path.startswith(p) for p in PUBLIC_PREFIXES)
        bucket_key = f"{client_ip}:{'pub' if is_public else 'staff'}"

        redis_success = False
        if self.redis_client:
            redis_key = f"ratelimit:{bucket_key}"
            try:
                current_count = self.redis_client.incr(redis_key)
                if current_count == 1:
                    self.redis_client.expire(redis_key, self.window)
                
                redis_success = True
                if current_count > limit:
                    ttl = self.redis_client.ttl(redis_key)
                    retry_after = ttl if ttl > 0 else self.window
                    return JSONResponse(
                        status_code=429,
                        content={"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests"}},
                        headers={
                            "Retry-After": str(retry_after),
                            "X-RateLimit-Limit": str(limit),
                        }
                    )
            except Exception as e:
                logger.warning(f"Redis rate limiting failed ({str(e)}), falling back to in-memory store")
                redis_success = False

        if not redis_success:
            # Periodic cleanup of expired entries (prevents memory leak)
            self._cleanup_expired(current_time)

            if bucket_key not in self._store:
                self._store[bucket_key] = {"count": 1, "start_time": current_time}
            else:
                record = self._store[bucket_key]
                if current_time - record["start_time"] > self.window:
                    # Reset window
                    record["count"] = 1
                    record["start_time"] = current_time
                else:
                    record["count"] += 1
                    if record["count"] > limit:
                        return JSONResponse(
                            status_code=429,
                            content={"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests"}},
                            headers={
                                "Retry-After": str(int(self.window - (current_time - record["start_time"]))),
                                "X-RateLimit-Limit": str(limit),
                            }
                        )

        response = await call_next(request)
        # Add rate limit headers to all responses
        response.headers["X-RateLimit-Limit"] = str(limit)
        return response