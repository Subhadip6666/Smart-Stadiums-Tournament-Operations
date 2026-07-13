from fastapi import APIRouter
from app.graph.driver import Neo4jDriver
from app.models.schemas import StandardResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health")
async def health_check():
    """Liveness probe - lightweight check."""
    return {"status": "ok"}

@router.get("/ready", response_model=StandardResponse)
async def readiness_check():
    """Readiness probe - checks downstream dependencies."""
    neo4j_status = "down"
    
    try:
        driver = Neo4jDriver.get_instance()
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