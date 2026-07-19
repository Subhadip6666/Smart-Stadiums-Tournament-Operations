import json
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_live_verifications():
    print("==================================================")
    print("1. LIVE HTTP VERIFICATION: Neo4j Down / 503 Test")
    print("==================================================")
    # Attempting route navigation when Neo4j is down (localhost default without live instance)
    nav_res = client.get("/v1/navigate/route?from_id=GATE-A&to_id=SEAT-101&stadium_id=STAD-01")
    print(f"HTTP Status Code: {nav_res.status_code}")
    print(f"HTTP Response Body: {json.dumps(nav_res.json(), indent=2)}")
    assert nav_res.status_code == 503
    assert "temporarily unavailable" in nav_res.json()["detail"].lower()

    print("\n==================================================")
    print("2. LIVE SECURITY VERIFICATION: Unauthenticated Protected Route (401)")
    print("==================================================")
    inc_payload = {
        "type": "Security Disturbance",
        "severity": 4,
        "description": "Unauthorized access attempt at Gate 3",
        "zone_id": "Z-GATE-E",
        "stadium_id": "STAD-01",
        "reporter_role": "guard"
    }
    sec_res = client.post("/v1/incidents", json=inc_payload)
    print(f"HTTP Status Code: {sec_res.status_code}")
    print(f"HTTP Response Body: {json.dumps(sec_res.json(), indent=2)}")
    assert sec_res.status_code == 401

    print("\n==================================================")
    print("3. LIVE RATE LIMIT VERIFICATION: Excess Public Requests (429)")
    print("==================================================")
    status_codes = []
    # Trigger rate limit threshold (limit is 30 for public routes per rate_limit middleware)
    for _ in range(35):
        r = client.get("/v1/crowd/heatmap?stadium_id=STAD-01")
        status_codes.append(r.status_code)
    
    last_res = client.get("/v1/crowd/heatmap?stadium_id=STAD-01")
    print(f"Last Request HTTP Status Code: {last_res.status_code}")
    print(f"Last Request HTTP Response Body: {json.dumps(last_res.json(), indent=2)}")
    assert 429 in status_codes or last_res.status_code == 429

    print("\nALL LIVE VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_live_verifications()
