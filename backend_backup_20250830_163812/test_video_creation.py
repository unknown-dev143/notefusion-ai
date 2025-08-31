import os
import sys
from pathlib import Path

def create_test_video():
    try:
        # Ensure output directory exists
        output_dir = Path("test_output")
        output_dir.mkdir(exist_ok=True)
        
        # Import necessary modules
        from moviepy.video.VideoClip import TextClip
        from moviepy.video.compositing.CompositeVideoClip import CompositeVideoClip
        from moviepy.video.VideoClip import ColorClip
        
        print("✅ Successfully imported required modules")
        
        # Create a simple text clip
        txt_clip = TextClip("Hello, World!", 
                          fontsize=50, 
                          color='white',
                          size=(640, 480))
        
        print("✅ Created TextClip")
        
        # Create a background
        color_clip = ColorClip(size=(640, 480), color=(0, 0, 255))  # Blue background
        
        # Set duration
        txt_clip = txt_clip.set_duration(3)  # 3 seconds
        color_clip = color_clip.set_duration(3)
        
        # Combine the clips
        video = CompositeVideoClip([color_clip, txt_clip.set_position('center')])
        
        # Output file path
        output_path = output_dir / "test_output.mp4"
        
        # Write the video file
        print(f"Writing video to {output_path}...")
        video.write_videofile(
            str(output_path),
            fps=24,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile=str(output_dir / 'temp_audio.m4a'),
            remove_temp=True
        )
        
        print(f"✅ Success! Video created at: {output_path.absolute()}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nTroubleshooting steps:")
        print("1. Make sure FFmpeg is installed and in your system PATH")
        print("2. Try installing moviepy with: pip install moviepy[all]")
        print("3. Check for any permission issues in the output directory")
        return False

if __name__ == "__main__":
    print("=== Testing Video Creation ===\n")
    create_test_video()
