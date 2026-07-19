import logging
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
from neo4j import AsyncDriver
from neo4j.exceptions import Neo4jError, ServiceUnavailable, DriverError

from app.models.schemas import RouteResponse
from app.graph.queries import SHORTEST_PATH_QUERY, ACCESSIBLE_PATH_QUERY, ECO_TRANSIT_PATH_QUERY

logger = logging.getLogger(__name__)

class NavigationService:
    """Service layer managing stadium wayfinding and Dijkstra pathfinding operations."""

    @staticmethod
    async def get_route(
        driver: AsyncDriver,
        from_id: str,
        to_id: str,
        stadium_id: str,
        mode: Optional[str] = "shortest"
    ) -> RouteResponse:
        """Calculate optimal stadium navigation route using Dijkstra algorithm over Neo4j.

        Args:
            driver (AsyncDriver): Active Neo4j asynchronous driver instance.
            from_id (str): Origin node or gate identifier (e.g., 'GATE-A').
            to_id (str): Destination seat or zone identifier (e.g., 'SEAT-101').
            stadium_id (str): Target stadium identifier.
            mode (Optional[str]): Pathfinding mode ('shortest', 'accessible', or 'eco_transit').

        Returns:
            RouteResponse: Structured route response containing path segments and travel time.

        Raises:
            HTTPException: 404 if no path exists; 503 if Neo4j database is unreachable.
        """
        # Select parameterized Cypher query based on requested pathfinding mode
        if mode == "accessible":
            query = ACCESSIBLE_PATH_QUERY
        elif mode == "eco_transit":
            query = ECO_TRANSIT_PATH_QUERY
        else:
            query = SHORTEST_PATH_QUERY
        
        try:
            async with driver.session() as session:
                result = await session.run(query, from_id=from_id, to_id=to_id)
                record = await result.single()
                
                if not record:
                    raise HTTPException(status_code=404, detail=f"No route found between {from_id} and {to_id}")
                    
                segments: List[Dict[str, Any]] = record["route"]
                walk_time: float = float(record["total_walk_time_s"])

                return RouteResponse(
                    route_id=f"rt-{from_id}-{to_id}",
                    mode=mode or "shortest",
                    segments=segments,
                    total_walk_time_s=walk_time
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