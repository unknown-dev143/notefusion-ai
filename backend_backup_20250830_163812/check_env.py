import sys
import os
import site
import importlib.util

def print_section(title):
    print("\n" + "="*80)
    print(f" {title} ")
    print("="*80)

# Print Python version and executable
print_section("PYTHON ENVIRONMENT")
print(f"Python Version: {sys.version}")
print(f"Executable: {sys.executable}")

# Print Python path
print_section("PYTHON PATH")
for i, path in enumerate(sys.path, 1):
    print(f"{i:2d}. {path}")

# Check if moviepy is importable
print_section("MODULE IMPORT TEST")
try:
    print("Trying to import moviepy.editor...")
    import moviepy.editor
    print("✅ Successfully imported moviepy.editor")
    print(f"MoviePy version: {moviepy.__version__}")
    print(f"MoviePy path: {moviepy.__file__}")
    
    # Try to import TextClip
    print("\nTrying to import TextClip...")
    from moviepy.editor import TextClip
    print("✅ Successfully imported TextClip")
    
    # Create a simple text clip
    print("\nCreating a simple text clip...")
    clip = TextClip("Hello, World!", fontsize=70, color='white', size=(640, 480))
    print("✅ Successfully created TextClip")
    
    # Try to write to a file
    print("\nTrying to write video file...")
    output_path = "test_output.mp4"
    clip.write_videofile(
        output_path,
        fps=24,
        codec='libx264',
        audio_codec='aac',
        temp_audiofile='temp_audio.m4a',
        remove_temp=True
    )
    print(f"✅ Successfully wrote video to {os.path.abspath(output_path)}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    
    # Print more detailed error information
    import traceback
    print("\nDetailed error traceback:")
    traceback.print_exc()

# Check site-packages
print_section("SITE-PACKAGES")
for path in site.getsitepackages():
    print(f"\nSite-packages: {path}")
    if os.path.exists(path):
        print("  Contents:")
        try:
            items = os.listdir(path)
            for item in items:
                if 'moviepy' in item.lower():
                    print(f"    ✅ {item}")
                else:
                    print(f"    - {item}")
        except Exception as e:
            print(f"    Error listing directory: {e}")
    else:
        print("  Directory does not exist")
