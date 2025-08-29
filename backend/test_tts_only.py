"""
Simple TTS test script.
"""
import os
from pathlib import Path

def test_tts():
    # Create output directory
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    
    # Test text
    text = "This is a test of the text to speech service."
    output_file = output_dir / "tts_test.mp3"
    
    try:
        from gtts import gTTS
        
        # Generate speech
        print("Generating speech...")
        tts = gTTS(text=text, lang='en')
        
        # Save to file
        tts.save(str(output_file))
        
        # Verify file was created
        if output_file.exists() and output_file.stat().st_size > 0:
            print(f"✅ TTS test passed!")
            print(f"File saved to: {output_file}")
            print(f"File size: {output_file.stat().st_size} bytes")
            return True
        else:
            print("❌ TTS test failed: Output file not created or is empty")
            
    except Exception as e:
        print(f"❌ TTS test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    return False

if __name__ == "__main__":
    print("=== TTS Test ===\n")
    success = test_tts()
    
    if success:
        print("\n✅ TTS test completed successfully!")
    else:
        print("\n❌ TTS test failed!")
    
    input("\nPress Enter to exit...")
