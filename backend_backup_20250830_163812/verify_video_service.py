"""
Verification script for the Video Generation Service.
This script tests the core functionality of the video generation service.
"""
import os
import sys
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Tuple

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(backend_dir))

# Check if FFmpeg is installed
def check_ffmpeg() -> Tuple[bool, str]:
    """Check if FFmpeg is installed and return its path."""
    try:
        # Try common FFmpeg executable names
        for cmd in ["ffmpeg", "ffmpeg.exe"]:
            try:
                result = subprocess.run(
                    [cmd, "-version"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    check=True
                )
                if "ffmpeg version" in result.stderr or "ffmpeg version" in result.stdout:
                    return True, cmd
            except (subprocess.SubprocessError, FileNotFoundError):
                continue
        
        # Check common installation paths on Windows
        common_paths = [
            r"C:\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe"
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                return True, path
                
        return False, "FFmpeg not found in PATH or common locations"
        
    except Exception as e:
        return False, f"Error checking FFmpeg: {str(e)}"

def test_ffmpeg_video_creation(ffmpeg_path: str) -> bool:
    """Test basic video creation with FFmpeg."""
    try:
        output_dir = Path("test_output")
        output_dir.mkdir(exist_ok=True)
        output_file = output_dir / "test_video.mp4"
        
        # Create a simple 2-second test video
        cmd = [
            ffmpeg_path,
            "-y",  # Overwrite output file if it exists
            "-f", "lavfi",
            "-i", "color=c=red:s=640x360:d=2",  # 2-second red video
            "-vf", "drawtext=text='Test Video':fontcolor=white:fontsize=30:x=(w-text_w)/2:y=(h-text_h)/2",
            "-c:v", "libx264",
            "-t", "2",  # 2 seconds duration
            str(output_file.absolute())
        ]
        
        print(f"Running FFmpeg command: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if output_file.exists() and output_file.stat().st_size > 0:
            print(f"✅ Successfully created test video: {output_file}")
            return True
        else:
            print("❌ Failed to create test video")
            if result.stderr:
                print("FFmpeg error output:")
                print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error in test_ffmpeg_video_creation: {str(e)}")
        return False

def main():
    print("=" * 50)
    print("Video Generation Service - Verification Script")
    print("=" * 50)
    print()
    
    # Check FFmpeg installation
    print("1. Checking FFmpeg installation...")
    ffmpeg_installed, ffmpeg_path = check_ffmpeg()
    
    if not ffmpeg_installed:
        print(f"❌ {ffmpeg_path}")
        print("\nPlease install FFmpeg and ensure it's in your PATH or provide the full path.")
        print("You can download FFmpeg from: https://ffmpeg.org/download.html")
        return
        
    print(f"✅ FFmpeg found at: {ffmpeg_path}")
    
    # Test basic video creation
    print("\n2. Testing basic video creation...")
    if test_ffmpeg_video_creation(ffmpeg_path):
        print("✅ FFmpeg video creation test passed!")
    else:
        print("❌ FFmpeg video creation test failed")
        return
    
    print("\n✅ All basic tests passed! The video generation service should work correctly.")
    print("You can now proceed with the TTS integration.")

if __name__ == "__main__":
    main()
