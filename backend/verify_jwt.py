import asyncio
import os
os.environ["JWT_SECRET"] = "dummy_secret_for_test"
os.environ["NEO4J_PASSWORD"] = "dummy_password"

from httpx import AsyncClient
from jose import jwt
from app.main import app

async def test_forged_jwt():
    print("Testing forged JWT...")
    forged_token = jwt.encode({"sub": "hacker"}, "wrong_secret", algorithm="HS256")
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(
            "/v1/navigate/route?from_id=A&to_id=B&stadium_id=1",
            headers={"Authorization": f"Bearer {forged_token}"}
        )
        print(f"Forged JWT Response Status: {response.status_code}")
        print(f"Forged JWT Response Body: {response.json()}")

if __name__ == "__main__":
    asyncio.run(test_forged_jwt())
