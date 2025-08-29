"""
Quick audio test script.
"""
from gtts import gTTS
import speech_recognition as sr
import os
from pathlib import Path

# Setup
test_dir = Path("test_audio")
test_dir.mkdir(exist_ok=True)

def test_tts():
    print("\n1. Testing TTS...")
    try:
        tts = gTTS("Testing one two three", lang='en')
        out_file = test_dir / "test.mp3"
        tts.save(str(out_file))
        print(f"✅ Saved to {out_file}")
        return out_file
    except Exception as e:
        print(f"❌ TTS Error: {e}")
        return None

def test_stt(audio_file):
    print("\n2. Testing STT...")
    try:
        r = sr.Recognizer()
        with sr.AudioFile(str(audio_file)) as source:
            audio = r.record(source)
            text = r.recognize_google(audio)
            print(f"✅ Recognized: {text}")
            return True
    except Exception as e:
        print(f"❌ STT Error: {e}")
        return False

if __name__ == "__main__":
    print("=== Audio Test ===\n")
    
    # Test TTS
    audio_file = test_tts()
    
    # Test STT if TTS was successful
    if audio_file and audio_file.exists():
        test_stt(audio_file)
    
    print("\nTest complete!")
