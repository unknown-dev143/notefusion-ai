"""
Simple FFmpeg test script to verify video generation.
"""
import os
import subprocess
from pathlib import Path

def main():
    print("Testing FFmpeg Video Generation")
    print("=" * 50)
    
    # Set paths
    ffmpeg_path = r"C:\Program Files\Python312\Scripts\ffmpeg.exe"
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    
    # Output file
    output_file = output_dir / "test_video.mp4"
    
    # FFmpeg command to create a simple video
    cmd = [
        ffmpeg_path,
        "-y",  # Overwrite output file if it exists
        "-f", "lavfi",
        "-i", "color=c=blue:s=640x360:d=5",  # 5-second blue video
        "-vf", "drawtext=text='Hello World':fontcolor=white:fontsize=30:x=(w-text_w)/2:y=(h-text_h)/2",
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
        else:
            print("❌ Output file was not created or is empty")
            if result.stderr:
                print("FFmpeg error output:")
                print(result.stderr)
                
    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg command failed with exit code {e.returncode}")
        if e.stderr:
            print("Error output:")
            print(e.stderr)
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
