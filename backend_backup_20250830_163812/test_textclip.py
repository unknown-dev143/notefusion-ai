print("Testing TextClip import...")
try:
    from moviepy.editor import TextClip
    print("✅ Successfully imported TextClip from moviepy.editor")
    
    # Test creating a simple text clip
    print("\nCreating a simple text clip...")
    clip = TextClip("Hello, World!", fontsize=70, color='white', size=(640, 480))
    print("✅ Successfully created TextClip")
    
    # Test writing to a file
    print("\nWriting to file...")
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
    print("❌ Error:")
    print(str(e))
