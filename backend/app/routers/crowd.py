import asyncio
from fastapi import APIRouter, Depends, Request
from sse_starlette.sse import EventSourceResponse
from app.dependencies import verify_token
from app.models.schemas import StandardResponse

router = APIRouter(dependencies=[Depends(verify_token)])

@router.get("/heatmap")
async def get_heatmap(request: Request, stadium_id: str, include_forecast: bool = False):
    """Server-Sent Events endpoint for real-time density updates.
    
    IMPORTANT: Only bucketed labels are sent — never raw occupancy numbers.
    This is enforced by the anonymization contract (see ADR-003).
    """
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
                
            # Only bucketed density labels — no raw percentages
            yield {
                "event": "density_update",
                "data": '{"zones": [{"zone_id": "Z-CONC-A", "density_bucket": "high"}]}'
            }
            await asyncio.sleep(5)

    return EventSourceResponse(event_generator())

@router.get("/zone/{zone_id}", response_model=StandardResponse)
async def get_zone_density(zone_id: str):
    return StandardResponse(
        data={
            "zone_id": zone_id,
            "zone_name": "Concourse A",
            "crowd_level": "busy",
            "suggestion": "Concourse C is less crowded - 2 min walk",
            "updated_at": "2026-06-15T19:32:10Z"
        }
    )
