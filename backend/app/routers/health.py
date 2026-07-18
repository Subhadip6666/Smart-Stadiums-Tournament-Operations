from fastapi import APIRouter, Depends
from neo4j import AsyncDriver
from app.dependencies import get_neo4j_driver
from app.models.schemas import StandardResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health")
async def health_check():
    """Liveness probe - lightweight check."""
    return {"status": "ok"}

@router.get("/ready", response_model=StandardResponse)
async def readiness_check(driver: AsyncDriver = Depends(get_neo4j_driver)):
    """Readiness probe - checks downstream dependencies."""
    neo4j_status = "down"
    
    try:
        # Verify connection
        await driver.verify_connectivity()
        neo4j_status = "up"
    except Exception as e:
        logger.error(f"Readiness check failed (Neo4j): {str(e)}")
        
    status = "ready" if neo4j_status == "up" else "unready"
    
    return StandardResponse(
        data={
            "status": status,
            "dependencies": {
                "neo4j": neo4j_status
            }
        }
    )