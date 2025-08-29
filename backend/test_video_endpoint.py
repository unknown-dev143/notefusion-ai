import requests
import json

def test_video_generation():
    url = "http://localhost:8000/api/v1/video/generate"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_ACCESS_TOKEN"  # Replace with a valid token if auth is required
    }
    
    data = {
        "text": "This is a test video generation request.",
        "style": "default",
        "voice": "default",
        "duration_per_slide": 5
    }
    
    try:
        print("Sending request to:", url)
        response = requests.post(url, headers=headers, json=data)
        
        print("\nResponse Status Code:", response.status_code)
        print("Response Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
            
        try:
            print("\nResponse Body:")
            print(json.dumps(response.json(), indent=2))
        except ValueError:
            print("Response (raw):", response.text)
            
        if response.status_code == 200:
            print("\n✅ Video generation request successful!")
            result = response.json()
            if "video_url" in result:
                print(f"Video URL: {result['video_url']}")
                print("\nYou can download the video by visiting the URL above in your browser.")
        else:
            print("\n❌ Video generation request failed.")
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error making request: {e}")
        print("\nPlease make sure the backend server is running.")
        print("You can start it with: uvicorn app.main:app --reload")

if __name__ == "__main__":
    test_video_generation()
