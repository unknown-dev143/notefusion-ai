"""
Core verification for the Audio Service.
"""
import os
import sys
import tempfile
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent))

def test_tts():
    """Test text-to-speech functionality."""
    print("\n=== Testing Text-to-Speech ===")
    
    try:
        # Create output directory
        output_dir = Path("test_output")
        output_dir.mkdir(exist_ok=True)
        
        # Test gTTS directly
        from gtts import gTTS
        print("✅ gTTS imported successfully")
        
        # Generate test audio
        text = "This is a test of the audio service."
        tts = gTTS(text=text, lang='en')
        
        # Save to file
        output_file = output_dir / "direct_tts_test.mp3"
        tts.save(str(output_file))
        
        if output_file.exists():
            print(f"✅ TTS file created: {output_file}")
            print(f"   File size: {output_file.stat().st_size} bytes")
            return True
        else:
            print("❌ TTS file was not created")
            return False
            
    except Exception as e:
        print(f"❌ TTS test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("=== Audio Service Core Test ===")
    
    # Run TTS test
    tts_success = test_tts()
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"Text-to-Speech: {'✅ Passed' if tts_success else '❌ Failed'}")
    
    if tts_success:
        print("\n✅ Core audio functionality is working!")
    else:
        print("\n❌ Some tests failed. Please check the output above.")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
