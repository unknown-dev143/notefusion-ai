import os
import sys
from pathlib import Path

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.schemas.video import VideoGenerationRequest, VideoStyle, VideoVoice

# Create test directories
os.makedirs("app/videos", exist_ok=True)
os.makedirs("app/temp", exist_ok=True)

# Print configuration
print("Testing Video Generation Service")
print("=" * 50)
print(f"Video output directory: {settings.VIDEO_OUTPUT_DIR}")
print(f"Temporary directory: {settings.TEMP_DIR}")
print("\nCreating test video...")

# Create a simple video using moviepy
try:
    from moviepy.editor import TextClip, CompositeVideoClip, ColorClip
    
    # Create a text clip
    txt_clip = TextClip("Test Video Generation\nNoteFusion AI", 
                       fontsize=70, 
                       color='white',
                       size=(settings.DEFAULT_VIDEO_WIDTH, settings.DEFAULT_VIDEO_HEIGHT))
    
    # Set the duration of the clip
    txt_clip = txt_clip.set_duration(5)  # 5 seconds
    
    # Create a color background
    color_clip = ColorClip(size=(settings.DEFAULT_VIDEO_WIDTH, settings.DEFAULT_VIDEO_HEIGHT), 
                          color=(64, 64, 255))  # Blue background
    color_clip = color_clip.set_duration(5)
    
    # Overlay the text clip on the color clip
    video = CompositeVideoClip([color_clip, txt_clip.set_position('center')])
    
    # Output file path
    output_path = Path(settings.VIDEO_OUTPUT_DIR) / "test_video.mp4"
    
    # Write the video file
    video.write_videofile(str(output_path), fps=24)
    
    print(f"\n✅ Test video created successfully at: {output_path}")
    print("\nTry playing the video to verify it works.")
    
except ImportError as e:
    print(f"\n❌ Error: {e}")
    print("\nPlease install the required dependencies:")
    print("pip install moviepy numpy")
    
except Exception as e:
    print(f"\n❌ An error occurred: {e}")
