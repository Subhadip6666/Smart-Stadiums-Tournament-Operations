"""Fan Data Anonymizer per ADR-003.

Strips PII (Personal Identifiable Information) and transforms raw counts
into bucketed density metrics to protect fan privacy.
"""
from typing import Dict, Any

PII_FIELDS = {"user_id", "name", "email", "phone", "ticket_id", "ip_address"}

def anonymize_fan_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Strips PII fields and converts raw fan data to anonymous bucketed density format."""
    cleaned = {k: v for k, v in raw_data.items() if k not in PII_FIELDS}
    
    if "count" in cleaned:
        cnt = cleaned.pop("count")
        if cnt < 20:
            cleaned["density_bucket"] = "low"
        elif cnt < 50:
            cleaned["density_bucket"] = "moderate"
        elif cnt < 80:
            cleaned["density_bucket"] = "high"
        else:
            cleaned["density_bucket"] = "critical"
            
    return cleaned