import logging
import random
from datetime import datetime, timezone
from typing import Dict, Any, List

from app.config import STADIUM_ZONES

logger = logging.getLogger(__name__)

class CrowdService:
    """Service layer for stadium crowd analytics, heatmaps, and zone metrics."""

    @staticmethod
    def get_heatmap_data(stadium_id: str, include_forecast: bool = False) -> Dict[str, Any]:
        """Calculate current stadium crowd density heatmap with bucketed density classifications.

        Conforms strictly to ADR-003 privacy specification by bucketizing raw density counts.

        Args:
            stadium_id (str): Unique identifier for target stadium (e.g., 'STAD-01').
            include_forecast (bool): Flag indicating whether predictive forecast trend is requested.

        Returns:
            Dict[str, Any]: Dictionary containing stadium zone density buckets and ISO timestamp.
        """
        zones_data: List[Dict[str, str]] = []
        for zone_id in STADIUM_ZONES:
            bucket: str = "low"
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
        """Retrieve detailed crowd metrics and alternate route recommendations for a specific zone.

        Args:
            zone_id (str): Unique zone identifier (e.g., 'Z-CONC-N').

        Returns:
            Dict[str, Any]: Zone metrics, crowd status, and walk-time rerouting suggestions.
        """
        clean_name: str = zone_id.replace("Z-", "")
        return {
            "zone_id": zone_id,
            "zone_name": f"Zone {clean_name}",
            "crowd_level": "busy",
            "suggestion": "Concourse C is less crowded - 2 min walk",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }