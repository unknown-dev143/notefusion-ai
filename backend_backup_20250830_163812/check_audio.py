"""
Simple script to verify audio service functionality.
"""
import sys
import os
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent))

def check_imports():
    """Check if required packages are installed."""
    print("\n=== Checking Dependencies ===")
    
    packages = [
        ('pydantic', 'pydantic'),
        ('gtts', 'gTTS'),
        ('speech_recognition', 'Recognizer'),
        ('pydub', 'AudioSegment'),
        ('pyaudio', 'pyaudio')
    ]
    
    all_ok = True
    for pkg, _ in packages:
        try:
            __import__(pkg)
            print(f"✅ {pkg} is installed")
        except ImportError:
            print(f"❌ {pkg} is NOT installed")
            all_ok = False
    
    return all_ok

def test_tts():
    """Test text-to-speech functionality."""
    print("\n=== Testing Text-to-Speech ===")
    
    try:
        from gtts import gTTS
        print("✅ gTTS imported successfully")
        
        # Create output directory
        output_dir = Path("test_output")
        output_dir.mkdir(exist_ok=True)
        
        # Test TTS
        text = "This is a test of the text-to-speech functionality."
        tts = gTTS(text=text, lang='en')
        output_file = output_dir / "test_tts.mp3"
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
    """Main function to run all checks."""
    print("\n=== Audio Service Verification ===\n")
    
    # Check imports
    if not check_imports():
        print("\n❌ Missing required packages. Please install them first.")
        print("Run: pip install -r test_requirements.txt")
        return
    
    # Test TTS
    tts_success = test_tts()
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"Text-to-Speech: {'✅ Passed' if tts_success else '❌ Failed'}")
    
    if tts_success:
        print("\n🎉 Audio service is working correctly!")
    else:
        print("\n❌ Some tests failed. Please check the output above.")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
