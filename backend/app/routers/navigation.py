from fastapi import APIRouter, Depends, HTTPException
from neo4j import AsyncDriver
from typing import Optional
from app.dependencies import get_neo4j_driver
from app.models.schemas import StandardResponse, RouteResponse
from app.graph.queries import SHORTEST_PATH_QUERY, ACCESSIBLE_PATH_QUERY

# Public endpoint — fans use wayfinding without auth.
router = APIRouter()

@router.get("/route", response_model=StandardResponse)
async def get_route(
    from_id: str,
    to_id: str,
    stadium_id: str,
    mode: Optional[str] = "shortest",
    driver: AsyncDriver = Depends(get_neo4j_driver)
):
    query = ACCESSIBLE_PATH_QUERY if mode == "accessible" else SHORTEST_PATH_QUERY
    
    async with driver.session() as session:
        try:
            result = await session.run(query, from_id=from_id, to_id=to_id)
            record = await result.single()
            
            if not record:
                raise HTTPException(status_code=404, detail="Route not found")
                
            return StandardResponse(
                data=RouteResponse(
                    route_id=f"rt-{from_id}-{to_id}",
                    mode=mode,
                    segments=record["route"],
                    total_walk_time_s=record["total_walk_time_s"]
                )
            )
        except Exception as e:
            import logging
            logging.error(f"Navigation query failed: {str(e)}")
            raise HTTPException(status_code=500, detail="An internal error occurred while calculating the route")
