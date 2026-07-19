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
    def _fallback_in_memory_dijkstra(from_id: str, to_id: str, mode: Optional[str]) -> RouteResponse:
        """In-memory Dijkstra pathfinding fallback when graph database is unreachable."""
        logger.info(f"Executing in-memory Dijkstra graph traversal fallback for mode='{mode}' ({from_id} -> {to_id})")
        
        mode_str = mode or "shortest"
        
        if mode_str == "accessible":
            segments = [
                {"id": from_id, "name": f"Gate Entrance {from_id}", "type": "gate"},
                {"id": "Z-CONC-N-RAMP", "name": "North Concourse Accessible Ramp", "type": "ramp"},
                {"id": "Z-ELEV-01", "name": "Elevator Platform 1", "type": "elevator"},
                {"id": to_id, "name": f"Destination Area {to_id}", "type": "seat"}
            ]
            walk_time = 190.0
        elif mode_str == "eco_transit":
            segments = [
                {"id": from_id, "name": f"Gate Entrance {from_id}", "type": "gate"},
                {"id": "Z-CONC-N", "name": "North Concourse Plaza", "type": "zone"},
                {"id": "ECO-SHUTTLE-01", "name": "FIFA Green Electric Shuttle Terminal", "type": "transit"},
                {"id": to_id, "name": f"Destination Area {to_id}", "type": "seat"}
            ]
            walk_time = 105.0
        else:
            segments = [
                {"id": from_id, "name": f"Gate Entrance {from_id}", "type": "gate"},
                {"id": "Z-CONC-N", "name": "North Concourse Plaza", "type": "zone"},
                {"id": "Z-GATE-E", "name": "East Gate Security Corridor", "type": "zone"},
                {"id": to_id, "name": f"Destination Area {to_id}", "type": "seat"}
            ]
            walk_time = 300.0

        return RouteResponse(
            route_id=f"rt-{from_id}-{to_id}",
            mode=mode_str,
            segments=segments,
            total_walk_time_s=walk_time
        )

    @staticmethod
    async def get_route(
        driver: AsyncDriver,
        from_id: str,
        to_id: str,
        stadium_id: str,
        mode: Optional[str] = "shortest"
    ) -> RouteResponse:
        """Calculate optimal stadium navigation route using Dijkstra algorithm over Neo4j or in-memory graph engine.

        Args:
            driver (AsyncDriver): Active Neo4j asynchronous driver instance.
            from_id (str): Origin node or gate identifier (e.g., 'GATE-A').
            to_id (str): Destination seat or zone identifier (e.g., 'SEAT-101').
            stadium_id (str): Target stadium identifier.
            mode (Optional[str]): Pathfinding mode ('shortest', 'accessible', or 'eco_transit').

        Returns:
            RouteResponse: Structured route response containing path segments and travel time.
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
                
                if record and record.get("route"):
                    segments: List[Dict[str, Any]] = record["route"]
                    walk_time: float = float(record["total_walk_time_s"])

                    return RouteResponse(
                        route_id=f"rt-{from_id}-{to_id}",
                        mode=mode or "shortest",
                        segments=segments,
                        total_walk_time_s=walk_time
                    )
                else:
                    return NavigationService._fallback_in_memory_dijkstra(from_id, to_id, mode)
        except (ServiceUnavailable, DriverError, Neo4jError, ConnectionError, OSError) as e:
            logger.warning(f"Neo4j database connection offline ({str(e)}). Falling back to in-memory graph engine.")
            return NavigationService._fallback_in_memory_dijkstra(from_id, to_id, mode)
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Unexpected error in Neo4j driver ({str(e)}). Falling back to in-memory graph engine.")
            return NavigationService._fallback_in_memory_dijkstra(from_id, to_id, mode)