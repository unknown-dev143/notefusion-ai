import os
from pathlib import Path

def create_test_video():
    # Create output directory
    output_dir = "test_output"
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        from moviepy.editor import TextClip, CompositeVideoClip, ColorClip
        
        print("MoviePy is installed and working!")
        
        # Video settings
        WIDTH = 1280
        HEIGHT = 720
        DURATION = 5  # seconds
        FPS = 24
        
        print("Creating a simple video...")
        
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
        output_path = os.path.join(output_dir, "test_video.mp4")
        
        # Write the video file
        video.write_videofile(output_path, fps=FPS, codec='libx264', audio_codec='aac')
        
        print(f"\n✅ Test video created successfully at: {os.path.abspath(output_path)}")
        print("\nTry playing the video to verify it works.")
        
    except ImportError as e:
        print(f"\n❌ Error: {e}")
        print("\nPlease install the required dependencies:")
        print("pip install moviepy numpy")
        
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")

if __name__ == "__main__":
    create_test_video()
