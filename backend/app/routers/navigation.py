from fastapi import APIRouter, Depends
from neo4j import AsyncDriver
from typing import Optional
from app.dependencies import get_neo4j_driver
from app.models.schemas import StandardResponse
from app.services.navigation_service import NavigationService

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
    route_data = await NavigationService.get_route(
        driver=driver,
        from_id=from_id,
        to_id=to_id,
        stadium_id=stadium_id,
        mode=mode
    )
    return StandardResponse(data=route_data)
