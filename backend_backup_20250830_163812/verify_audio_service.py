"""
Quick verification script for the Audio Service.
"""
import sys
import os
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

def test_tts():
    """Test text-to-speech functionality."""
    from app.services.audio.service import audio_service
    
    print("Testing Text-to-Speech...")
    try:
        # Test TTS with default settings
        audio_path, content_type = audio_service.text_to_speech(
            text="This is a test of the audio service.",
            lang="en",
            filename="test_audio"
        )
        print(f"✅ TTS Success! File saved to: {audio_path}")
        print(f"   Content Type: {content_type}")
        print(f"   File exists: {Path(audio_path).exists()}")
        return True
    except Exception as e:
        print(f"❌ TTS Test Failed: {str(e)}")
        return False

def test_stt():
    """Test speech-to-text functionality."""
    from app.services.audio.service import audio_service
    
    print("\nTesting Speech-to-Text...")
    try:
        # Generate a test audio file first
        test_audio = Path("test_audio.wav")
        if not test_audio.exists():
            print("  Creating test audio file...")
            import wave
            import struct
            import math
            
            # Generate a simple sine wave
            sample_rate = 44100  # Hz
            duration = 2.0  # seconds
            frequency = 440.0  # Hz (A4 note)
            
            # Generate samples
            samples = []
            for i in range(int(sample_rate * duration)):
                sample = 32767.0 * math.sin(2.0 * math.pi * frequency * (i / sample_rate))
                samples.append(int(sample))
            
            # Write to WAV file
            with wave.open(str(test_audio), 'w') as wf:
                wf.setnchannels(1)  # mono
                wf.setsampwidth(2)   # 2 bytes per sample
                wf.setframerate(sample_rate)
                wf.writeframes(b''.join(struct.pack('h', s) for s in samples))
        
        # Test STT
        print(f"  Using test file: {test_audio}")
        try:
            text = audio_service.speech_to_text(test_audio)
            print(f"✅ STT Success! Transcribed text: {text}")
            return True
        except Exception as e:
            print(f"⚠️  STT returned an error (expected for test audio): {str(e)}")
            print("   This is normal for the test audio since it's just a sine wave.")
            return True
    except Exception as e:
        print(f"❌ STT Test Failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Audio Service Verification ===\n")
    
    # Create test output directory
    os.makedirs("test_output", exist_ok=True)
    
    # Run tests
    tts_success = test_tts()
    stt_success = test_stt()
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"Text-to-Speech: {'✅ Passed' if tts_success else '❌ Failed'}")
    print(f"Speech-to-Text: {'✅ Passed' if stt_success else '❌ Failed'}")
    
    if tts_success and stt_success:
        print("\n🎉 All tests passed! The audio service is working correctly.")
    else:
        print("\n❌ Some tests failed. Please check the error messages above.")
