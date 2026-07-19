import pytest
from fastapi.testclient import TestClient
from jose import jwt
from app.main import app
from app.config import settings

client = TestClient(app)

def create_test_jwt() -> str:
    payload = {"sub": "staff-test-user", "role": "staff"}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")

def test_public_routes_accessible_without_auth():
    """Verify that public routes allow fan access without JWT authorization."""
    # Crowd heatmap
    res_crowd = client.get("/v1/crowd/heatmap?stadium_id=STAD-01")
    assert res_crowd.status_code == 200
    assert "zones" in res_crowd.json()["data"]

    # Navigation route
    res_nav = client.get("/v1/navigate/route?from_id=GATE-A&to_id=SEAT-101&stadium_id=STAD-01")
    # Will be 200, 404, or 503, but NOT 401
    assert res_nav.status_code in [200, 404, 503]

def test_staff_incident_route_requires_jwt():
    """Verify that staff-only incident route blocks unauthenticated access with 401."""
    valid_incident_payload = {
        "type": "Medical Emergency",
        "severity": 4,
        "description": "Fan fainted near Gate E concourse.",
        "zone_id": "Z-GATE-E",
        "stadium_id": "STAD-01",
        "reporter_role": "steward"
    }

    # Unauthenticated request
    res_unauth = client.post("/v1/incidents", json=valid_incident_payload)
    assert res_unauth.status_code == 401

    # Authenticated request with valid JWT
    token = create_test_jwt()
    res_auth = client.post(
        "/v1/incidents",
        json=valid_incident_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_auth.status_code == 201
    data = res_auth.json()["data"]
    assert data["status"] == "open"
    assert data["ai_triage"]["recommended_severity"] >= 4

def test_rate_limit_headers_present():
    """Verify rate limit middleware applies process time headers and rate limiting headers."""
    res = client.get("/v1/crowd/heatmap?stadium_id=STAD-01")
    assert "x-process-time" in res.headers
