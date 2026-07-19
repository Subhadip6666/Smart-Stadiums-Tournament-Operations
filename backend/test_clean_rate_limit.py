import urllib.request
import urllib.error

url = "https://smart-stadiums-tournament-operation-mu.vercel.app/v1/crowd/heatmap?stadium_id=STAD-01"

print("==================================================")
print("CLEAN WINDOW RATE LIMIT TEST (Fresh 60s Window)")
print("==================================================")

for i in range(1, 36):
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req) as resp:
            limit_hdr = resp.headers.get("X-RateLimit-Limit", "N/A")
            print(f"Req #{i:02d}: Status {resp.status} (X-RateLimit-Limit: {limit_hdr})")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"Req #{i:02d}: Status {e.code} - Body: {body}")
