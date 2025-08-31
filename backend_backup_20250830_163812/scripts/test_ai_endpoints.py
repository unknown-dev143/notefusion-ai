import asyncio
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
TOKEN = os.getenv("TEST_AUTH_TOKEN")  # You'll need to set this with a valid token

async def test_ai_endpoints():
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        # Test GET /ai/settings
        print("\n=== Testing GET /ai/settings ===")
        try:
            response = await client.get(f"{BASE_URL}/ai/settings", headers=headers)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print("Response:", response.json())
            else:
                print("Error:", response.text)
        except Exception as e:
            print(f"Error: {e}")
        
        # Test GET /ai/models/available
        print("\n=== Testing GET /ai/models/available ===")
        try:
            response = await client.get(f"{BASE_URL}/ai/models/available", headers=headers)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print(f"Found {len(response.json())} available models")
                # Print first 3 models if available
                for model in response.json()[:3]:
                    print(f"- {model.get('name')} ({model.get('provider')}): {model.get('model_id')}")
                if len(response.json()) > 3:
                    print(f"... and {len(response.json()) - 3} more models")
            else:
                print("Error:", response.text)
        except Exception as e:
            print(f"Error: {e}")
        
        # Test POST /ai/models/check-updates
        print("\n=== Testing POST /ai/models/check-updates ===")
        try:
            response = await client.post(
                f"{BASE_URL}/ai/models/check-updates",
                headers=headers,
                json={"force": True}
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 202:
                print("Update check started successfully")
            else:
                print("Response:", response.json())
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    if not TOKEN:
        print("Error: TEST_AUTH_TOKEN environment variable not set")
        print("Please set it with a valid authentication token")
    else:
        asyncio.run(test_ai_endpoints())
