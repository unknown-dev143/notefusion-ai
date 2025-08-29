import os
import subprocess
from pathlib import Path

def main():
    print("Simple Video Generation Test")
    print("=" * 50)
    
    # Set paths
    ffmpeg_path = r"C:\Users\User\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe"
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    output_file = output_dir / "simple_video.mp4"
    
    # Remove existing output file if it exists
    if output_file.exists():
        output_file.unlink()
    
    # Simple FFmpeg command to create a test video
    cmd = [
        ffmpeg_path,
        "-y",
        "-f", "lavfi",
        "-i", "color=c=red:s=640x360:d=5",
        "-vf", "drawtext=text='Hello World':fontcolor=white:fontsize=30:x=(w-text_w)/2:y=(h-text_h)/2",
        "-c:v", "libx264",
        "-t", "5",
        str(output_file.absolute())
    ]
    
    print(f"Running command: {' '.join(cmd)}")
    
    try:
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
