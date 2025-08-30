"""
Simple audio test script to verify basic audio functionality.
"""
import os
import sys
import wave
import struct
import numpy as np
from pathlib import Path

# Create output directory
output_dir = Path("test_output")
output_dir.mkdir(exist_ok=True)

def test_audio_basics():
    """Test basic audio file creation and reading."""
    print("\n=== Testing Basic Audio Functionality ===")
    
    # Test WAV file creation
    test_file = output_dir / "test_tone.wav"
    
    try:
        # Generate a simple sine wave
        sample_rate = 16000  # 16KHz
        duration = 1.0      # 1 second
        frequency = 440.0   # A4 note
        
        # Generate time array
        t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
        
        # Generate sine wave (16-bit PCM)
        audio_data = (np.sin(2 * np.pi * frequency * t) * 32767 * 0.5).astype(np.int16)
        
        # Save as WAV file
        with wave.open(str(test_file), 'wb') as wf:
            wf.setnchannels(1)  # Mono
            wf.setsampwidth(2)   # 16-bit
            wf.setframerate(sample_rate)
            wf.writeframes(audio_data.tobytes())
        
        # Verify file was created
        if not test_file.exists() or test_file.stat().st_size == 0:
            print("❌ Failed to create WAV file")
            return False
        
        print(f"✅ Created test tone at: {test_file}")
        print(f"File size: {test_file.stat().st_size} bytes")
        
        # Try to read the file back
        try:
            with wave.open(str(test_file), 'rb') as wf:
                print(f"Successfully opened WAV file:")
                print(f"  Channels: {wf.getnchannels()}")
                print(f"  Sample width: {wf.getsampwidth()} bytes")
                print(f"  Frame rate: {wf.getframerate()} Hz")
                print(f"  Frames: {wf.getnframes()}")
                
                # Read some frames
                frames = wf.readframes(10)
                print(f"  First 10 frames: {frames}")
                
            return True
            
        except Exception as e:
            print(f"❌ Error reading WAV file: {str(e)}")
            return False
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n=== Audio Basic Test ===")
    success = test_audio_basics()
    
    if success:
        print("\n✅ Basic audio test passed!")
    else:
        print("\n❌ Basic audio test failed!")
    
    input("\nPress Enter to exit...")
