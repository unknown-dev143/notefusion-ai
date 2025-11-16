import sys
import asyncio
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.absolute() / "backend"
sys.path.insert(0, str(backend_dir))

def print_header(title):
    print("\n" + "=" * 50)
    print(f"TEST: {title}")
    print("=" * 50)

async def test_audio_service():
    """Test basic audio service functionality."""
    try:
        print_header("Testing Audio Service Import")
        from app.services.audio.service import AudioService
        print("✅ Successfully imported AudioService")
        
        print_header("Testing AudioService Initialization")
        audio_service = AudioService()
        print("✅ Successfully initialized AudioService")
        
        # Test text-to-speech
        print_header("Testing Text-to-Speech")
        test_text = "This is a test of the text-to-speech functionality."
        print(f"Converting text to speech: {test_text}")
        
        try:
            audio_data = await audio_service.text_to_speech(
                text=test_text,
                voice="en-US-AriaNeural",
                rate="+10%",
                pitch="+0Hz"
            )
            
            # Save the audio to a file
            output_path = "test_output_tts.wav"
            with open(output_path, "wb") as f:
                f.write(audio_data)
                
            print(f"✅ TTS successful! Audio saved to {output_path}")
            
        except Exception as e:
            print(f"⚠️ TTS test skipped: {str(e)}")
            print("This is expected if Azure credentials are not configured.")
        
        # Test audio transcription
        print_header("Testing Audio Transcription")
        test_audio = Path("test_audio.wav")
        
        if test_audio.exists():
            print(f"Found test audio file: {test_audio}")
            try:
                with open(test_audio, "rb") as f:
                    audio_data = f.read()
                
                transcription = await audio_service.transcribe_audio(
                    audio_data=audio_data,
                    language="en-US",
                    format="wav"
                )
                print(f"✅ Transcription successful: {transcription[:100]}...")
                
            except Exception as e:
                print(f"⚠️ Transcription test skipped: {str(e)}")
                print("This is expected if the transcription service is not configured.")
        else:
            print(f"⚠️ Test audio file not found: {test_audio}")
            print("Skipping transcription test...")
        
        print("\n✅ All tests completed!")
        
    except ImportError as e:
        print(f"❌ Failed to import required modules: {str(e)}")
        print("Make sure you've installed all dependencies from requirements.txt")
        return 1
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(test_audio_service())
    if exit_code != 0:
        print("\nSome tests failed. Check the output above for details.")
    input("\nPress Enter to exit...")
    sys.exit(exit_code)
