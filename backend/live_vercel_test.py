import json
import urllib.request
import urllib.error

BASE_URL = "https://smart-stadiums-tournament-operation-mu.vercel.app"

def test_live_401():
    print("==================================================")
    print("1. LIVE VERCEL: Unauthenticated Protected Route (401)")
    print("==================================================")
    url = f"{BASE_URL}/v1/incidents"
    payload = json.dumps({
        "type": "Medical Emergency",
        "severity": 4,
        "description": "Fan collapsed near concourse",
        "zone_id": "Z-GATE-E",
        "stadium_id": "STAD-01",
        "reporter_role": "steward"
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Status Code: {resp.status}")
            print(f"Response: {resp.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
        print(f"Status Code: {e.code}")
        headers_str = "\n".join([f"{k}: {v}" for k, v in e.headers.items()])
        print(f"Headers:\n{headers_str}")
        print(f"Response Body: {e.read().decode('utf-8')}")

def test_live_navigation_modes():
    print("\n==================================================")
    print("2. LIVE VERCEL: Navigation Route Comparison (shortest vs eco_transit)")
    print("==================================================")
    
    for mode in ["shortest", "eco_transit", "accessible"]:
        url = f"{BASE_URL}/v1/navigate/route?from_id=GATE-A&to_id=SEAT-101&stadium_id=STAD-01&mode={mode}"
        req = urllib.request.Request(url, method="GET")
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                print(f"Mode '{mode}': Status {resp.status} - Route ID: {data.get('route_id')}, Walk Time: {data.get('total_walk_time_s')}s, Segments: {[s['name'] for s in data.get('segments', [])]}")
        except urllib.error.HTTPError as e:
            print(f"Mode '{mode}': Status {e.code} - Body: {e.read().decode('utf-8')}")

def test_live_429_rate_limit():
    print("\n==================================================")
    print("3. LIVE VERCEL: 35 Rapid Requests to /v1/crowd/heatmap (429 Test)")
    print("==================================================")
    url = f"{BASE_URL}/v1/crowd/heatmap?stadium_id=STAD-01"
    
    for i in range(1, 36):
        req = urllib.request.Request(url, method="GET")
        try:
            with urllib.request.urlopen(req) as resp:
                print(f"Req #{i:02d}: Status {resp.status} (X-RateLimit-Limit: {resp.headers.get('X-RateLimit-Limit')})")
        except urllib.error.HTTPError as e:
            print(f"Req #{i:02d}: Status {e.code} - Body: {e.read().decode('utf-8')}")

if __name__ == "__main__":
    test_live_401()
    test_live_navigation_modes()
    test_live_429_rate_limit()
