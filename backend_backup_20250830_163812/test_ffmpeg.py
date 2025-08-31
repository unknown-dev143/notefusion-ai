import sys
import os
import subprocess
from pathlib import Path

# Print Python version and executable
print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")

# Set the path to FFmpeg
FFMPEG_PATH = r"C:\Users\User\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe"
FFPROBE_PATH = r"C:\Users\User\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffprobe.exe"

# Verify FFmpeg is accessible
if not os.path.exists(FFMPEG_PATH):
    print(f"❌ Error: FFmpeg not found at {FFMPEG_PATH}")
    sys.exit(1)

print(f"✅ FFmpeg found at: {FFMPEG_PATH}")

# Test FFmpeg version
print("\nTesting FFmpeg version:")
try:
    result = subprocess.run(
        [FFMPEG_PATH, "-version"],
        capture_output=True,
        text=True,
        check=True
    )
    print(f"FFmpeg version output:\n{result.stdout.splitlines()[0]}")
except subprocess.CalledProcessError as e:
    print(f"Error running FFmpeg: {e}")
    print(f"STDERR: {e.stderr}")
    sys.exit(1)

# Create a simple video using FFmpeg directly
print("\nCreating a simple video with FFmpeg...")
output_dir = Path("test_output")
output_dir.mkdir(exist_ok=True)
output_file = output_dir / "test_ffmpeg.mp4"

try:
    # Create a simple video with FFmpeg
    cmd = [
        FFMPEG_PATH,
        "-y",  # Overwrite output file if it exists
        "-f", "lavfi",
        "-i", "color=c=blue:s=1280x720:d=5",  # 5-second blue video
        "-vf", "drawtext=text='FFmpeg Test':fontcolor=white:fontsize=50:x=(w-text_w)/2:y=(h-text_h)/2",
        "-c:v", "libx264",
        "-t", "5",  # 5 seconds duration
        str(output_file)
    ]
    
    print(f"Running command: {' '.join(cmd)}")
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=True
    )
    
    if output_file.exists():
        print(f"✅ Video created successfully at: {output_file.absolute()}")
        print(f"File size: {output_file.stat().st_size / (1024 * 1024):.2f} MB")
    else:
        print("❌ Video file was not created")
        
except subprocess.CalledProcessError as e:
    print(f"❌ Error creating video: {e}")
    print(f"STDERR: {e.stderr}")
    sys.exit(1)

except Exception as e:
    print(f"❌ Unexpected error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
