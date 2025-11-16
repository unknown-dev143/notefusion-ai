import requests
import json
from pprint import pprint
from test_server import SlideContent, AudioSettings, VideoRequest, TransitionType, TextPosition, BackgroundType

def test_video_generation():
    # Example slides with different styles
    slides = [
        SlideContent(
            text="Welcome to NoteFusion AI",
            duration=3.0,
            text_color="#FFFFFF",
            background="#1E1E1E",
            background_type=BackgroundType.COLOR,
            text_position=TextPosition.CENTER,
            font_size=48,
            font_family="Arial",
            transition=TransitionType.FADE,
            transition_duration=0.5
        ),
        SlideContent(
            text="Create Stunning Videos\nFrom Your Notes",
            duration=4.0,
            text_color="#FFD700",
            background="#2C3E50,#4CA1AF",  # Gradient
            background_type=BackgroundType.GRADIENT,
            text_position=TextPosition.CENTER,
            font_size=42,
            font_family="Arial",
            transition=TransitionType.SLIDE_LEFT,
            transition_duration=0.7
        ),
        SlideContent(
            text="Customize Everything\n• Text Styles\n• Colors\n• Transitions\n• And More!",
            duration=5.0,
            text_color="#FFFFFF",
            background="#8E0E00,#1F1C18",  # Gradient
            background_type=BackgroundType.GRADIENT,
            text_position=TextPosition.LEFT,
            font_size=36,
            font_family="Arial",
            transition=TransitionType.ZOOM,
            transition_duration=1.0
        )
    ]
    
    # Audio settings (optional)
    audio = AudioSettings(
        enabled=False,  # Set to True to enable background music
        background_music=None,  # Path to audio file
        volume=0.5,
        voice_over=False,
        voice_speed=1.0
    )
    
    # Create the video request
    request = VideoRequest(
        slides=slides,
        audio=audio,
        resolution=(1280, 720),
        fps=30,
        output_format="mp4",
        watermark="NoteFusion AI",
        metadata={
            "title": "Demo Video",
            "author": "NoteFusion Team",
            "description": "A sample video generated with NoteFusion AI"
        }
    )
    
    # Convert to dictionary for JSON serialization
    request_data = json.loads(request.json())
    
    print("Sending video generation request...")
    print(f"Total duration: {sum(slide['duration'] for slide in request_data['slides']):.1f} seconds")
    
    # Send the request to the server
    response = requests.post(
        "http://localhost:8000/api/v1/video/generate",
        json=request_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print("\nVideo generated successfully!")
        print(f"Video URL: http://localhost:8000{result['download_url']}")
        print("\nMetadata:")
        pprint(result['metadata'])
    else:
        print(f"\nError: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_video_generation()
