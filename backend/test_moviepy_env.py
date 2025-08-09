import sys
print("Python executable:", sys.executable)
print("Python version:", sys.version)
print("\nPython path:")
for p in sys.path:
    print(f"  {p}")

print("\nTrying to import moviepy...")
try:
    import moviepy.editor
    print("✅ Successfully imported moviepy.editor")
    print(f"MoviePy version: {moviepy.__version__}")
    print(f"MoviePy path: {moviepy.__file__}")
    
    # Test creating a simple text clip
    print("\nTesting TextClip creation...")
    from moviepy.editor import TextClip
    clip = TextClip("Hello, World!", fontsize=70, color='white', bg_color='black', size=(640, 480))
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
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
