"""
Simple TTS test script.
"""
from gtts import gTTS
from pathlib import Path
import os

# Create output directory
output_dir = Path("test_output")
output_dir.mkdir(exist_ok=True)

def test_tts():
    """Test Text-to-Speech functionality."""
    print("\n=== Testing Text-to-Speech ===")
    
    # Test text
    text = "This is a test of the text to speech service."
    
    # Output file
    output_file = output_dir / "test_tts.mp3"
    
    try:
        # Generate speech
        print("Generating speech...")
        tts = gTTS(text=text, lang='en', slow=False)
        
        # Save to file
        print(f"Saving to {output_file}...")
        tts.save(str(output_file))
        
        # Verify file was created
        if output_file.exists() and output_file.stat().st_size > 0:
            print(f"✅ TTS test passed!")
            print(f"File saved to: {output_file}")
            print(f"File size: {output_file.stat().st_size / 1024:.1f} KB")
            return True
        else:
            print("❌ TTS test failed: Output file not created or is empty")
            
    except Exception as e:
        print(f"❌ TTS test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    return False

if __name__ == "__main__":
    success = test_tts()
    if success:
        print("\n✅ TTS test completed successfully!")
    else:
        print("\n❌ TTS test failed!")
    
    input("\nPress Enter to exit...")
