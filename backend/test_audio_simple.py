"""
Simple test script for the audio service.
"""
import sys
import os
from pathlib import Path

# Add the current directory to the Python path
sys.path.insert(0, os.path.abspath('.'))

def main():
    print("=== Simple Audio Service Test ===\n")
    
    # Test TTS
    try:
        print("Testing Text-to-Speech...")
        from gtts import gTTS
        
        # Create output directory if it doesn't exist
        output_dir = Path("test_output")
        output_dir.mkdir(exist_ok=True)
        
        # Create a simple TTS file
        tts = gTTS(text="This is a test of the text-to-speech service.", lang="en")
        output_file = output_dir / "test_tts.mp3"
        tts.save(str(output_file))
        
        if output_file.exists():
            print(f"✅ TTS test passed! File saved to: {output_file}")
            print(f"   File size: {output_file.stat().st_size} bytes")
        else:
            print("❌ TTS test failed: Output file not created")
            
    except Exception as e:
        print(f"❌ TTS test failed: {str(e)}")
    
    print("\nTest completed!")

if __name__ == "__main__":
    main()
