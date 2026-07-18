import logging
import random
from datetime import datetime
from fastapi import APIRouter
from app.models.schemas import StandardResponse

logger = logging.getLogger("uvicorn")

router = APIRouter()

ZONES = [
    "Z-CONC-N", "Z-GATE-E", "Z-PLAZ-E", "Z-VIP-S", "Z-ESC-S", 
    "Z-SEAT-W1", "Z-CONC-W", "Z-CORN-NW", "Z-CORN-NE", "Z-FOOD-N", 
    "Z-MERC", "Z-MED-1"
]

@router.get("/heatmap", response_model=StandardResponse)
async def get_heatmap(stadium_id: str, include_forecast: bool = False):
    """Standard GET endpoint for crowd density updates.
    
    Returns the current state of all zones.
    Fluctuates zone density slightly to simulate dynamic updates on each poll.
    """
    zones_data = []
    for zone_id in ZONES:
        # Default bucket
        bucket = "low"
        if zone_id in ["Z-GATE-E", "Z-PLAZ-E", "Z-ESC-S", "Z-SEAT-W1"]:
            bucket = "moderate"
            
        # Randomly fluctuate density for some zones (except Z-MED-1)
        if zone_id != "Z-MED-1" and random.random() < 0.3:
            bucket = random.choice(["low", "moderate", "high", "critical"])
            
        zones_data.append({
            "zone_id": zone_id,
            "density_bucket": bucket,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        })
        
    logger.info(f"Polling crowd updates for stadium: {stadium_id}")
    return StandardResponse(
        data={"zones": zones_data, "timestamp": datetime.utcnow().isoformat() + "Z"}
    )

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

