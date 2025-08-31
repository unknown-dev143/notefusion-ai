"""
Final audio test script with simplified output.
"""
import os
import time
from pathlib import Path
from gtts import gTTS
import speech_recognition as sr

# Create output directory
output_dir = Path("test_output")
output_dir.mkdir(exist_ok=True)

def test_tts():
    """Test Text-to-Speech."""
    print("\n[1/3] Testing TTS...")
    try:
        tts = gTTS("This is a test of the text to speech service.", lang='en')
        output_file = output_dir / "tts_test.mp3"
        tts.save(str(output_file))
        
        if output_file.exists() and output_file.stat().stize > 0:
            print(f"✅ TTS Success! File: {output_file}")
            return str(output_file)
    except Exception as e:
        print(f"❌ TTS Error: {str(e)}")
    return None

def test_stt(audio_file):
    """Test Speech-to-Text."""
    print("\n[2/3] Testing STT...")
    try:
        r = sr.Recognizer()
        with sr.AudioFile(audio_file) as source:
            audio = r.record(source)
            result = r.recognize_google(audio)
            print(f"✅ STT Success! Recognized: '{result}'")
            return True
    except Exception as e:
        print(f"❌ STT Error: {str(e)}")
    return False

def main():
    print("=== Audio System Test ===\n")
    
    # Test TTS
    audio_file = test_tts()
    
    # Test STT if TTS was successful
    if audio_file:
        time.sleep(1)  # Wait for file system
        test_stt(audio_file)
    
    print("\nTest complete!")
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()
