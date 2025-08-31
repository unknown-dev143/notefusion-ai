import os
import sys
from pathlib import Path

def create_test_video():
    try:
        # Ensure output directory exists
        output_dir = "test_videos"
        os.makedirs(output_dir, exist_ok=True)
        
        # Import moviepy
        from moviepy.editor import TextClip, ColorClip, CompositeVideoClip
        
        # Create a simple text clip
        txt_clip = TextClip("Hello, World!", 
                          fontsize=50, 
                          color='white',
                          size=(640, 480))
        
        # Set the duration
        txt_clip = txt_clip.set_duration(3)  # 3 seconds
        
        # Create a background
        color_clip = ColorClip(size=(640, 480), color=(0, 0, 255))  # Blue background
        color_clip = color_clip.set_duration(3)
        
        # Combine the clips
        video = CompositeVideoClip([color_clip, txt_clip.set_position('center')])
        
        # Output file path
        output_path = os.path.join(output_dir, "test_output.mp4")
        
        # Write the video file
        video.write_videofile(output_path, fps=24, codec='libx264', audio_codec='aac')
        
        print(f"✅ Success! Video created at: {os.path.abspath(output_path)}")
        return True
        
    except Exception as e:
        print(f"❌ Error creating video: {str(e)}")
        print("\nTroubleshooting steps:")
        print("1. Make sure you have FFmpeg installed and in your system PATH")
        print("2. Install required packages: pip install moviepy numpy imageio imageio-ffmpeg")
        print("3. If using a virtual environment, make sure it's activated")
        return False

if __name__ == "__main__":
    print("=== Testing Video Generation ===\n")
    create_test_video()
