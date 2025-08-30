"""
Run audio service tests with detailed output.
"""
import sys
import os
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent))

def run_tests():
    """Run tests with detailed output."""
    print("=== Running Audio Service Tests ===\n")
    
    # Test 1: Import audio service
    try:
        from app.services.audio.service import AudioService
        print("✅ Successfully imported AudioService")
    except ImportError as e:
        print(f"❌ Failed to import AudioService: {e}")
        return False
    
    # Test 2: Create AudioService instance
    try:
        audio_service = AudioService()
        print("✅ Successfully created AudioService instance")
    except Exception as e:
        print(f"❌ Failed to create AudioService instance: {e}")
        return False
    
    # Test 3: Test TTS
    try:
        test_text = "This is a test of the audio service."
        output_path = "test_output"
        os.makedirs(output_path, exist_ok=True)
        
        print(f"\nTesting TTS with text: {test_text}")
        audio_path, content_type = audio_service.text_to_speech(
            text=test_text,
            lang="en",
            filename="test_audio"
        )
        
        print(f"✅ TTS Success!")
        print(f"   Output file: {audio_path}")
        print(f"   Content type: {content_type}")
        
        if os.path.exists(audio_path):
            print(f"   File size: {os.path.getsize(audio_path)} bytes")
        else:
            print("   Warning: Output file not found")
            
    except Exception as e:
        print(f"❌ TTS test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = run_tests()
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n❌ Some tests failed. Please check the output above.")
    
    input("\nPress Enter to exit...")
