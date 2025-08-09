import os
import sys
from pathlib import Path
import subprocess

def main():
    print("Testing Video Generation with FFmpeg")
    print("=" * 50)
    
    # Set paths
    ffmpeg_path = r"C:\Users\User\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe"
    output_dir = Path("test_videos")
    output_dir.mkdir(exist_ok=True)
    
    # Create a simple video with FFmpeg
    output_file = output_dir / "simple_video.mp4"
    
    # FFmpeg command to create a simple video
    cmd = [
        ffmpeg_path,
        "-y",  # Overwrite output file if it exists
        "-f", "lavfi",
        "-i", "color=c=blue:s=1280x720:d=5",  # 5-second blue video
        "-vf", "drawtext=text='Hello World':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2",
        "-c:v", "libx264",
        "-t", "5",  # 5 seconds duration
        str(output_file.absolute())
    ]
    
    print(f"Running command: {' '.join(cmd)}")
    
    try:
        # Run FFmpeg
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        
        if output_file.exists() and output_file.stat().st_size > 0:
            print(f"✅ Video created successfully at: {output_file.absolute()}")
            print(f"File size: {output_file.stat().st_size / 1024:.2f} KB")
            return True
        else:
            print("❌ Output file was not created or is empty")
            if result.stderr:
                print("FFmpeg error output:")
                print(result.stderr)
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg command failed with return code {e.returncode}")
        if e.stdout:
            print("FFmpeg stdout:")
            print(e.stdout)
        if e.stderr:
            print("FFmpeg stderr:")
            print(e.stderr)
        return False
        
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    main()
