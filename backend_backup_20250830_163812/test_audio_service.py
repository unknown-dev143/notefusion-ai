"""
Test script for the AudioService class.
"""
import os
from pathlib import Path
from app.services.audio.service import AudioService

def run_tests():
    """Run audio service tests."""
    print("=== Testing AudioService ===\n")
    
    # Initialize the service
    service = AudioService(output_dir="test_output/audio")
    
    # Test 1: Text to Speech
    print("1. Testing Text-to-Speech...")
    try:
        text = "Hello, this is a test of the audio service."
        audio_file = service.text_to_speech(text, lang='en')
        print(f"✅ TTS Success! File: {audio_file[0]}")
        
        # Verify file exists
        if Path(audio_file[0]).exists():
            print(f"   File size: {Path(audio_file[0]).stat().st_size} bytes")
        else:
            print("❌ Error: Audio file not found!")
            
    except Exception as e:
        print(f"❌ TTS Test Failed: {str(e)}")
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    run_tests()
