import logging
import random
from datetime import datetime, timezone
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

ZONES = [
    "Z-CONC-N", "Z-GATE-E", "Z-PLAZ-E", "Z-VIP-S", "Z-ESC-S", 
    "Z-SEAT-W1", "Z-CONC-W", "Z-CORN-NW", "Z-CORN-NE", "Z-FOOD-N", 
    "Z-MERC", "Z-MED-1"
]

class CrowdService:
    @staticmethod
    def get_heatmap_data(stadium_id: str, include_forecast: bool = False) -> Dict[str, Any]:
        """Calculates current zone crowd density heatmap for a stadium.
        
        Returns bucketed density values (low, moderate, high, critical) per ADR-003.
        """
        zones_data: List[Dict[str, str]] = []
        for zone_id in ZONES:
            bucket = "low"
            if zone_id in ["Z-GATE-E", "Z-PLAZ-E", "Z-ESC-S", "Z-SEAT-W1"]:
                bucket = "moderate"
                
            if zone_id != "Z-MED-1" and random.random() < 0.3:
                bucket = random.choice(["low", "moderate", "high", "critical"])
                
            zones_data.append({
                "zone_id": zone_id,
                "density_bucket": bucket,
                "updated_at": datetime.now(timezone.utc).isoformat()
            })
            
        logger.info(f"Generated crowd density heatmap for stadium: {stadium_id}")
        return {
            "zones": zones_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    def get_zone_details(zone_id: str) -> Dict[str, Any]:
        """Retrieves detailed crowd metrics and rerouting suggestion for a specific zone."""
        return {
            "zone_id": zone_id,
            "zone_name": f"Zone {zone_id.replace('Z-', '')}",
            "crowd_level": "busy",
            "suggestion": "Concourse C is less crowded - 2 min walk",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }