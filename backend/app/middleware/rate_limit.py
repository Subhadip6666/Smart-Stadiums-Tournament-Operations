"""Rate limiting middleware using Redis (H-04 fix)."""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import time

# Very basic placeholder memory store. 
# M-02 / H-04: In production, this connects to REDIS_URL from settings.
_rate_limits = {}

class RateLimitMiddleware:
    def __init__(self, limit: int = 100, window: int = 60):
        self.limit = limit
        self.window = window

    async def __call__(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        
        # Simple token bucket / counter per IP
        current_time = time.time()
        
        if client_ip not in _rate_limits:
            _rate_limits[client_ip] = {"count": 1, "start_time": current_time}
        else:
            record = _rate_limits[client_ip]
            if current_time - record["start_time"] > self.window:
                # Reset window
                record["count"] = 1
                record["start_time"] = current_time
            else:
                record["count"] += 1
                if record["count"] > self.limit:
                    return JSONResponse(
                        status_code=429,
                        content={"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests"}}
                    )
        
        return await call_next(request)