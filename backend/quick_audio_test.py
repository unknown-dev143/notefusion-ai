"""
Quick test for audio service functionality.
"""
import os
from pathlib import Path

def main():
    """Run quick audio test."""
    print("=== Quick Audio Test ===\n")
    
    # Create output directory
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    
    # Test 1: Basic TTS with gTTS
    try:
        print("Testing gTTS...")
        from gtts import gTTS
        
        # Simple text to speech
        tts = gTTS("This is a test of the audio service.", lang='en')
        output_file = output_dir / "quick_test.mp3"
        tts.save(str(output_file))
        
        if output_file.exists():
            size = output_file.stat().st_size
            print(f"✅ Success! Created: {output_file} ({size} bytes)")
            return True
        else:
            print("❌ Error: Output file not created")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Audio test completed successfully!")
    else:
        print("\n❌ Audio test failed.")
    
    input("\nPress Enter to exit...")
