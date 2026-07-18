"""Verification script for tiered access control.

Tests:
1. Public routes return 200 with NO Authorization header
2. Staff routes return 401 without a valid token
3. Chat input length limit returns 400 on oversized input
4. Rate limiter fires 429 on public routes when exceeded
"""
import requests
import json
import sys

BASE = "http://localhost:8000"

PASS = "\033[92m✓ PASS\033[0m"
FAIL = "\033[91m✗ FAIL\033[0m"

results = []

def check(name: str, condition: bool, detail: str = ""):
    status = PASS if condition else FAIL
    print(f"  {status}  {name}" + (f" — {detail}" if detail else ""))
    results.append((name, condition))

print("\n" + "=" * 60)
print("TIERED ACCESS VERIFICATION")
print("=" * 60)

# ── 1. Public routes: 200 with no auth ─────────────────────
print("\n── Public Routes (no Authorization header) ──")

r = requests.get(f"{BASE}/v1/crowd/zone/Z-GATE-E")
check("GET /v1/crowd/zone/:id → 200", r.status_code == 200, f"got {r.status_code}")

r = requests.get(f"{BASE}/v1/navigate/route", params={
    "from_id": "GATE-N", "to_id": "GATE-S", "stadium_id": "metlife", "mode": "shortest"
})
# May get 500 if Neo4j is not running, but should NOT get 401
check("GET /v1/navigate/route → not 401", r.status_code != 401, f"got {r.status_code}")

r = requests.post(f"{BASE}/v1/chat/message", json={
    "session_id": "test-session",
    "message": "Where is the nearest restroom?",
    "language": "en"
})
check("POST /v1/chat/message → 200", r.status_code == 200, f"got {r.status_code}")

# ── 2. Staff routes: 401 without auth ──────────────────────
print("\n── Staff Routes (no Authorization header → must be 401) ──")

r = requests.post(f"{BASE}/v1/incidents", json={
    "type": "MEDICAL", "severity": 3, "description": "Test",
    "zone_id": "Z-GATE-E", "stadium_id": "metlife", "reporter_role": "operator"
})
check("POST /v1/incidents → 401", r.status_code == 401, f"got {r.status_code}")

# ── 3. Chat input length limit ─────────────────────────────
print("\n── Chat Input Length Limit (>500 chars → 400) ──")

long_message = "A" * 501
r = requests.post(f"{BASE}/v1/chat/message", json={
    "session_id": "test-session",
    "message": long_message,
    "language": "en"
})
check("POST /v1/chat/message (501 chars) → 400", r.status_code == 400, f"got {r.status_code}")

short_message = "A" * 500
r = requests.post(f"{BASE}/v1/chat/message", json={
    "session_id": "test-session",
    "message": short_message,
    "language": "en"
})
check("POST /v1/chat/message (500 chars) → 200", r.status_code == 200, f"got {r.status_code}")

# ── 4. Rate limiting on public routes ──────────────────────
print("\n── Rate Limiting (public route: 30 req/min) ──")

# Fire 32 rapid requests to a public endpoint
rate_limit_hit = False
for i in range(32):
    r = requests.get(f"{BASE}/v1/crowd/zone/Z-GATE-E")
    if r.status_code == 429:
        rate_limit_hit = True
        check(f"Rate limit triggered at request #{i+1}", True, f"429 at request {i+1}")
        break

if not rate_limit_hit:
    check("Rate limit triggered within 32 requests", False, "never got 429")

# ── Summary ────────────────────────────────────────────────
print("\n" + "=" * 60)
passed = sum(1 for _, ok in results if ok)
total = len(results)
print(f"Results: {passed}/{total} passed")
if passed < total:
    print("FAILED checks:")
    for name, ok in results:
        if not ok:
            print(f"  - {name}")
    sys.exit(1)
else:
    print("All checks passed!")
    sys.exit(0)
