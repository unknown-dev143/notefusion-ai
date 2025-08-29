"""
Verify audio services are working.
"""
import os
from pathlib import Path

# Create test output directory
test_dir = Path("test_output")
test_dir.mkdir(exist_ok=True)

def check_tts():
    """Check if TTS works."""
    try:
        from gtts import gTTS
        tts = gTTS('Test message', lang='en')
        out_file = test_dir / 'tts_test.mp3'
        tts.save(str(out_file))
        return out_file.exists() and out_file.stat().st_size > 0
    except Exception as e:
        print(f"TTS Error: {e}")
        return False

def check_stt():
    """Check if STT imports work."""
    try:
        import speech_recognition as sr
        r = sr.Recognizer()
        return True
    except Exception as e:
        print(f"STT Import Error: {e}")
        return False

if __name__ == "__main__":
    print("=== Audio Service Check ===\n")
    
    print("1. Checking TTS...")
    if check_tts():
        print("✅ TTS is working!")
    else:
        print("❌ TTS test failed")
    
    print("\n2. Checking STT...")
    if check_stt():
        print("✅ STT imports work!")
    else:
        print("❌ STT import failed")
    
    print("\nCheck complete. See test_output/ for generated files.")
