"""
Simple video generation test using Python's built-in modules.
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    print("Simple Video Generation Test")
    print("=" * 50)
    
    # Set paths
    python_path = sys.executable
    output_dir = Path("test_output")
    output_dir.mkdir(exist_ok=True)
    output_file = output_dir / "test_video.mp4"
    
    print(f"Python executable: {python_path}")
    print(f"Output file: {output_file.absolute()}")
    
    # Check if we can import moviepy
    try:
        import moviepy.editor as mp
        print("✅ moviepy is installed")
        
        # Create a simple text clip
        txt_clip = mp.TextClip("Hello, NoteFusion AI!", fontsize=70, color='white', size=(640, 480))
        txt_clip = txt_clip.set_duration(5)  # 5 seconds
        
        # Create a color background
        color_clip = mp.ColorClip(size=(640, 480), color=(64, 64, 255))  # Blue background
        color_clip = color_clip.set_duration(5)
        
        # Combine clips
        video = mp.CompositeVideoClip([color_clip, txt_clip.set_position('center')])
        
        # Write the video file
        print("Creating video...")
        video.write_videofile(str(output_file), fps=24, codec='libx264', audio_codec='aac')
        
        if output_file.exists() and output_file.stat().st_size > 0:
            print(f"✅ Video created successfully: {output_file.absolute()}")
            print(f"File size: {output_file.stat().st_size / 1024:.2f} KB")
        else:
            print("❌ Video file was not created or is empty")
            
    except ImportError:
        print("❌ moviepy is not installed. Please install it with:")
        print("pip install moviepy")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
