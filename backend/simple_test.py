print("Simple Python Test Script")
print("=" * 80)

# Print Python version and path
import sys
print(f"Python Version: {sys.version}")
print(f"Executable: {sys.executable}")
print(f"\nPython Path:")
for i, path in enumerate(sys.path, 1):
    print(f"{i:2d}. {path}")

# Try to import moviepy
print("\nTrying to import moviepy...")
try:
    import moviepy
    print(f"✅ Successfully imported moviepy from: {moviepy.__file__}")
    print(f"MoviePy version: {moviepy.__version__}")
    
    # Try to import from moviepy.editor
    print("\nTrying to import from moviepy.editor...")
    from moviepy.editor import TextClip
    print("✅ Successfully imported TextClip from moviepy.editor")
    
    # Test creating a simple text clip
    print("\nTesting TextClip creation...")
    clip = TextClip("Hello, World!", fontsize=70, color='white', size=(640, 480))
    print("✅ Successfully created TextClip")
    
    # Test writing to a file
    print("\nTesting video file writing...")
    output_path = "test_output.mp4"
    clip.write_videofile(
        output_path,
        fps=24,
        codec='libx264',
        audio_codec='aac',
        temp_audiofile='temp_audio.m4a',
        remove_temp=True
    )
    print(f"✅ Successfully wrote video to {output_path}")
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("\nTroubleshooting steps:")
    print("1. Make sure you have activated the virtual environment")
    print("2. Run: pip install moviepy numpy imageio imageio-ffmpeg")
    print("3. If using a virtual environment, make sure to activate it before running the script")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    print("\nDetailed error traceback:")
    traceback.print_exc()

print("\nTest completed.")
