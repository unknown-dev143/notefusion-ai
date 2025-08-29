import os
import sys
import traceback
import subprocess
from pathlib import Path

# Set the path to FFmpeg
FFMPEG_PATH = r"C:\Users\User\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe"
FFPROBE_PATH = r"C:\Users\User\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffprobe.exe"

# Verify FFmpeg is accessible
if not os.path.exists(FFMPEG_PATH):
    print(f"❌ Error: FFmpeg not found at {FFMPEG_PATH}")
    sys.exit(1)

print(f"✅ FFmpeg found at: {FFMPEG_PATH}")

# Set the environment variable for imageio
os.environ["IMAGEIO_FFMPEG_EXE"] = FFMPEG_PATH

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

# Set the environment variable for imageio
os.environ["IMAGEIO_FFMPEG_EXE"] = FFMPEG_PATH

# Configure MoviePy to use the specified FFmpeg binary
import imageio_ffmpeg
imageio_ffmpeg._utils.get_ffmpeg_exe = lambda: FFMPEG_PATH
imageio_ffmpeg._utils.get_ffmpeg_exe = lambda: FFMPEG_PATH

# Import MoviePy with explicit FFmpeg path
import moviepy
from moviepy.config import change_settings

# Configure MoviePy to use our FFmpeg binary
os.environ["IMAGEIO_FFMPEG_EXE"] = FFMPEG_PATH
import imageio_ffmpeg
imageio_ffmpeg._utils.get_ffmpeg_exe = lambda: FFMPEG_PATH

# Now import the editor
from moviepy.editor import TextClip, CompositeVideoClip, ColorClip

print(f"✅ MoviePy version: {moviepy.__version__}")
print("✅ Successfully imported moviepy.editor")

# Create output directory
output_dir = "test_output"
output_path = Path(output_dir)
output_path.mkdir(parents=True, exist_ok=True)
print(f"Output directory: {output_path.absolute()}")

# Video settings
WIDTH = 1280
HEIGHT = 720
DURATION = 5  # seconds
FPS = 24

print("Testing MoviePy installation...")
print("Creating a simple video...")

try:
    # Create a text clip
    txt_clip = TextClip("NoteFusion AI\nVideo Generation Test", 
                       fontsize=50, 
                       color='white',
                       size=(WIDTH, HEIGHT))
    
    # Set the duration of the clip
    txt_clip = txt_clip.set_duration(DURATION)
    
    # Create a color background
    color_clip = ColorClip(size=(WIDTH, HEIGHT), color=(64, 64, 255))  # Blue background
    color_clip = color_clip.set_duration(DURATION)
    
    # Overlay the text clip on the color clip
    video = CompositeVideoClip([color_clip, txt_clip.set_position('center')])
    
    # Output file path
    output_file = output_path / "test_video.mp4"
    print(f"Output file: {output_file.absolute()}")
    
    # Write the video file with explicit FFmpeg path
    print("Writing video file...")
    video.write_videofile(
        str(output_file), 
        fps=FPS, 
        codec='libx264', 
        audio_codec='aac',
        ffmpeg_params=[
            '-y',  # Overwrite output file if it exists
            '-loglevel', 'debug'  # Show debug output
        ],
        threads=4,
        preset='ultrafast',
        ffmpeg_timeout=60  # Increase timeout to 60 seconds
    )
    
    print(f"\n✅ Test video created successfully at: {os.path.abspath(output_path)}")
    print("\nTry playing the video to verify it works.")
    
except ImportError as e:
    print(f"\n❌ Error: {e}")
    print("\nPlease install the required dependencies:")
    print("pip install moviepy numpy")
    
except Exception as e:
    print(f"\n❌ An error occurred: {e}")
