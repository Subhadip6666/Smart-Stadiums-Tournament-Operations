from fastapi import APIRouter
from app.models.schemas import StandardResponse
from app.services.crowd_service import CrowdService

router = APIRouter()

@router.get("/heatmap", response_model=StandardResponse)
async def get_heatmap(stadium_id: str, include_forecast: bool = False):
    """Standard GET endpoint for crowd density updates."""
    data = CrowdService.get_heatmap_data(stadium_id, include_forecast)
    return StandardResponse(data=data)

@router.get("/zone/{zone_id}", response_model=StandardResponse)
async def get_zone_density(zone_id: str):
    """Get crowd level details for a specific zone."""
    data = CrowdService.get_zone_details(zone_id)
    return StandardResponse(data=data)
