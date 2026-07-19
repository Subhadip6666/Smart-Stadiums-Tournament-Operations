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
    print("2. LIVE VERCEL: Navigation Route Comparison (shortest vs eco_transit vs accessible)")
    print("==================================================")
    
    for mode in ["shortest", "eco_transit", "accessible"]:
        url = f"{BASE_URL}/v1/navigate/route?from_id=GATE-A&to_id=SEAT-101&stadium_id=STAD-01&mode={mode}"
        req = urllib.request.Request(url, method="GET")
        try:
            with urllib.request.urlopen(req) as resp:
                raw_data = json.loads(resp.read().decode('utf-8'))
                route = raw_data.get("data", raw_data)
                seg_names = [s.get("name", s.get("id")) for s in route.get("segments", [])]
                print(f"Mode '{mode}': Status {resp.status} - Route ID: {route.get('route_id')}, Walk Time: {route.get('total_walk_time_s')}s, Segments: {' -> '.join(seg_names)}")
        except urllib.error.HTTPError as e:
            print(f"Mode '{mode}': Status {e.code} - Body: {e.read().decode('utf-8')}")

if __name__ == "__main__":
    test_live_401()
    test_live_navigation_modes()
