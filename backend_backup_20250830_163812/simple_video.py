import os
import subprocess
import sys
from pathlib import Path

def create_video_with_ffmpeg(text, output_file="output.mp4"):
    """Create a simple video with text using FFmpeg."""
    try:
        # Set the full path to FFmpeg
        ffmpeg_path = r"C:\Users\User\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe"
        
        # Create output directory if it doesn't exist
        output_path = Path(output_file).parent
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Create a temporary text file for the image
        temp_text_file = output_path / "temp_text.txt"
        with open(temp_text_file, "w", encoding='utf-8') as f:
            f.write(text)
        
        # FFmpeg command to create a video with text
        cmd = [
            ffmpeg_path,
            "-f", "lavfi",
            "-i", "color=c=black:s=1280x720:d=5",
            "-vf", f"drawtext=textfile={temp_text_file}:fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2:fontfile=arial.ttf",
            "-c:v", "libx264",
            "-t", "5",
            "-y",  # Overwrite output file if it exists
            output_file
        ]
        
        print(f"Running command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Successfully created video: {output_file}")
            return True
        else:
            print("❌ Error creating video:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        # Clean up temporary files
        if 'temp_text_file' in locals() and temp_text_file.exists():
            temp_text_file.unlink()

if __name__ == "__main__":
    print("Simple Video Generator using FFmpeg")
    print("=" * 50)
    
    # Set the full path to FFmpeg
    ffmpeg_path = r"C:\\Users\\User\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe"
    
    # Check if FFmpeg is installed
    if not os.path.exists(ffmpeg_path):
        print(f"❌ FFmpeg not found at: {ffmpeg_path}")
        print("Please install FFmpeg from: https://ffmpeg.org/download.html")
        sys.exit(1)
    
    print(f"✅ FFmpeg found at: {ffmpeg_path}")
    
    # Create output directory
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    output_file = output_dir / "output.mp4"
    
    # Create a test video
    print("\nCreating a test video...")
    success = create_video_with_ffmpeg("Hello, World!\nThis is a test video.", str(output_file))
    
    if success:
        print("\n🎉 Video creation completed successfully!")
        print(f"Output file: {output_file.absolute()}")
        print(f"File size: {output_file.stat().st_size / (1024 * 1024):.2f} MB")
    else:
        print("\n❌ Failed to create video")
