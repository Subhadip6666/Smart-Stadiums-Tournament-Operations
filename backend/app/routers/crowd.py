import asyncio
import json
import logging
from datetime import datetime
from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse
from app.models.schemas import StandardResponse

logger = logging.getLogger("uvicorn")

router = APIRouter()

ZONES = [
    "Z-CONC-N", "Z-GATE-E", "Z-PLAZ-E", "Z-VIP-S", "Z-ESC-S", 
    "Z-SEAT-W1", "Z-CONC-W", "Z-CORN-NW", "Z-CORN-NE", "Z-FOOD-N", 
    "Z-MERC", "Z-MED-1"
]

@router.get("/heatmap")
async def get_heatmap(request: Request, stadium_id: str, include_forecast: bool = False):
    """Server-Sent Events endpoint for real-time density updates.
    
    IMPORTANT: Only bucketed labels are sent — never raw occupancy numbers.
    This is enforced by the anonymization contract (see ADR-003).
    """
    async def event_generator():
        # Send initial full set of zones
        initial_zones = []
        for zone_id in ZONES:
            bucket = "low"
            if zone_id in ["Z-GATE-E", "Z-PLAZ-E", "Z-ESC-S", "Z-SEAT-W1"]:
                bucket = "moderate"
            elif zone_id == "Z-MED-1":
                bucket = "low"
            initial_zones.append({
                "zone_id": zone_id,
                "density_bucket": bucket,
                "updated_at": datetime.utcnow().isoformat() + "Z"
            })
        
        logger.info(f"SSE initializing client connection for stadium: {stadium_id}")
        yield {
            "event": "density_update",
            "data": json.dumps({"zones": initial_zones, "timestamp": datetime.utcnow().isoformat() + "Z"})
        }

        while True:
            if await request.is_disconnected():
                logger.info("SSE client disconnected")
                break
                
            # Randomly select 2-4 zones to update
            import random
            num_updates = random.randint(2, 4)
            updated_zones = []
            selected_zones = random.sample(ZONES, num_updates)
            for zone_id in selected_zones:
                density = random.choice(["low", "moderate", "high", "critical"])
                # Keep medical station low
                if zone_id == "Z-MED-1":
                    density = "low"
                updated_zones.append({
                    "zone_id": zone_id,
                    "density_bucket": density,
                    "updated_at": datetime.utcnow().isoformat() + "Z"
                })
            
            logger.info(f"SSE sending crowd update for zones: {[z['zone_id'] for z in updated_zones]}")
            yield {
                "event": "density_update",
                "data": json.dumps({"zones": updated_zones, "timestamp": datetime.utcnow().isoformat() + "Z"})
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
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
    )

