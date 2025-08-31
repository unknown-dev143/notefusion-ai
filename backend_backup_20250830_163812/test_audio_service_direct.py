"""
Direct test for the audio service.
"""
import os
import sys
from pathlib import Path

def main():
    """Test audio service directly."""
    print("=== Testing Audio Service Directly ===\n")
    
    # Add current directory to path
    sys.path.insert(0, str(Path(__file__).parent))
    
    # Create test output directory
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    
    # Test 1: Test gTTS directly
    try:
        print("1. Testing gTTS...")
        from gtts import gTTS
        
        # Simple text to speech
        text = "This is a direct test of the audio service."
        tts = gTTS(text=text, lang='en')
        
        # Save to file
        output_file = output_dir / "direct_test.mp3"
        tts.save(str(output_file))
        
        if output_file.exists():
            size = output_file.stat().st_size
            print(f"✅ gTTS test passed! File: {output_file} ({size} bytes)")
        else:
            print("❌ gTTS test failed: Output file not created")
            return
            
    except Exception as e:
        print(f"❌ gTTS test failed: {e}")
        return
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
