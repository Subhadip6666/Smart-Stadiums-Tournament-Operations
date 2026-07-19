from app.services.crowd_service import CrowdService

def test_crowd_service_heatmap():
    """Verify crowd density heatmap generation."""
    res = CrowdService.get_heatmap_data("STAD-01")
    assert "zones" in res
    assert len(res["zones"]) > 0
    assert "timestamp" in res

def test_crowd_service_zone_details():
    """Verify zone details lookup."""
    res = CrowdService.get_zone_details("Z-GATE-E")
    assert res["zone_id"] == "Z-GATE-E"
    assert "crowd_level" in res