import os
import subprocess
from pathlib import Path
import uuid

def main():
    print("Testing Video Generation with FFmpeg")
    print("=" * 50)
    
    # Set paths
    ffmpeg_path = r"C:\\Users\\User\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe"
    output_dir = Path("generated_videos").absolute()
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {output_dir}")
    
    # Generate a unique filename
    output_filename = f"video_{uuid.uuid4().hex}.mp4"
    output_path = output_dir / output_filename
    
    # Text to display in the video
    text = "Hello, NoteFusion AI!\nThis is a test video."
    
    # Create a temporary text file
    temp_text_file = output_dir / f"temp_{uuid.uuid4().hex}.txt"
    try:
        with open(temp_text_file, 'w', encoding='utf-8') as f:
            f.write(text)
        
        # Build the FFmpeg command
        cmd = [
            ffmpeg_path,
            "-y",  # Overwrite output file if it exists
            "-f", "lavfi",
            "-i", "color=c=navy:s=1280x720:d=5",  # 5-second navy background
            "-vf", f"drawtext=textfile={temp_text_file}:"
                   "fontcolor=white:fontsize=50:"
                   "x=(w-text_w)/2:y=(h-text_h)/2:"
                   "fontfile=arial.ttf:"
                   "box=1:boxcolor=black@0.5:boxborderw=10",
            "-c:v", "libx264",
            "-t", "5",  # 5 seconds duration
            str(output_path)
        ]
        
        print(f"Running command: {' '.join(cmd)}")
        
        # Run FFmpeg
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        
        # Check if the output file was created
        if output_path.exists() and output_path.stat().st_size > 0:
            print(f"✅ Video created successfully at: {output_path.absolute()}")
            print(f"File size: {output_path.stat().st_size / (1024 * 1024):.2f} MB")
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
        
    finally:
        # Clean up temporary files
        if 'temp_text_file' in locals() and temp_text_file.exists():
            temp_text_file.unlink()

if __name__ == "__main__":
    main()
