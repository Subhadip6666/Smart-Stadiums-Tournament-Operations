import logging
from typing import Optional
from fastapi import HTTPException
from neo4j import AsyncDriver
from neo4j.exceptions import Neo4jError, ServiceUnavailable, DriverError

from app.models.schemas import RouteResponse
from app.graph.queries import SHORTEST_PATH_QUERY, ACCESSIBLE_PATH_QUERY

logger = logging.getLogger(__name__)

class NavigationService:
    @staticmethod
    async def get_route(
        driver: AsyncDriver,
        from_id: str,
        to_id: str,
        stadium_id: str,
        mode: Optional[str] = "shortest"
    ) -> RouteResponse:
        """Calculate Dijkstra shortest path or accessible path via Neo4j.
        
        Returns 503 Service Unavailable if Neo4j database is unreachable.
        Returns 404 Not Found if no path exists between the given nodes.
        """
        query = ACCESSIBLE_PATH_QUERY if mode == "accessible" else SHORTEST_PATH_QUERY
        
        try:
            async with driver.session() as session:
                result = await session.run(query, from_id=from_id, to_id=to_id)
                record = await result.single()
                
                if not record:
                    raise HTTPException(status_code=404, detail="Route not found")
                    
                return RouteResponse(
                    route_id=f"rt-{from_id}-{to_id}",
                    mode=mode or "shortest",
                    segments=record["route"],
                    total_walk_time_s=record["total_walk_time_s"]
                )
        except (ServiceUnavailable, DriverError, Neo4jError, ConnectionError, OSError) as e:
            logger.error(f"Neo4j database connection failure during navigation: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="Navigation service temporarily unavailable due to database connectivity issue"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in navigation service: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="Navigation service temporarily unavailable due to database connectivity issue"
            )