from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import uuid
import logging
from app.routers import navigation, crowd, chat, incidents, health, auth
from app.config import settings

from contextlib import asynccontextmanager
from app.utils.logging import setup_logging
from app.graph.driver import Neo4jDriver
import structlog

# Setup structured JSON logging
setup_logging()
logger = structlog.get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # M-03 fix: Close Neo4j connections cleanly on shutdown
    await Neo4jDriver.close_instance()


app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description="StadiumAI NOC API",
    lifespan=lifespan
)

# H-01 fix: Restrict CORS origins based on config
allowed_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

from app.middleware.rate_limit import RateLimitMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.middleware("http")(RateLimitMiddleware(limit=100, window=60).__call__)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# H-02 fix: Stop leaking str(exc) to client. Return generic message.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_id = str(uuid.uuid4())
    # Log the full exception server-side
    logger.exception(f"Unhandled exception (Error ID: {error_id}): {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR", 
                "message": "An internal error occurred.", 
                "reference_id": error_id
            }
        }
    )

app.include_router(health.router, tags=["System"])
app.include_router(navigation.router, prefix="/v1/navigate", tags=["Navigation"])
app.include_router(crowd.router, prefix="/v1/crowd", tags=["Crowd"])
app.include_router(chat.router, prefix="/v1/chat", tags=["Chat"])
app.include_router(incidents.router, prefix="/v1/incidents", tags=["Incidents"])
app.include_router(auth.router, prefix="/v1/auth", tags=["Auth"])

# Lifespan/Shutdown logic for Neo4j (M-03 fix) will be added here via lifespan context manager later.
