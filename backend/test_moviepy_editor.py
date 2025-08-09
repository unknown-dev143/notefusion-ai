print("=== Testing moviepy.editor import ===\n")

try:
    from moviepy.editor import TextClip
    print("✅ Successfully imported TextClip from moviepy.editor")
    print(f"TextClip module path: {TextClip.__module__}")
    
    # Test creating a simple text clip
    clip = TextClip("Hello, World!", fontsize=50, color='white', size=(640, 480))
    print("✅ Successfully created TextClip")
    
except ImportError as e:
    print(f"❌ Error importing moviepy.editor: {e}")
    
    # Try to debug the import error
    print("\n=== Debugging Import Error ===")
    try:
        import moviepy
        print(f"✅ moviepy package found at: {moviepy.__file__}")
        
        # Try to list the contents of the moviepy package
        print("\nContents of moviepy package:")
        import os
        moviepy_dir = os.path.dirname(moviepy.__file__)
        if os.path.exists(moviepy_dir):
            for item in os.listdir(moviepy_dir):
                print(f"  - {item}")
                
            # Check if editor.py exists
            editor_path = os.path.join(moviepy_dir, 'editor.py')
            if os.path.exists(editor_path):
                print("\n✅ editor.py found at:", editor_path)
            else:
                print("\n❌ editor.py not found in moviepy package")
        else:
            print(f"❌ MoviePy directory not found at: {moviepy_dir}")
            
    except ImportError as e:
        print(f"❌ Could not import moviepy: {e}")
    
    print("\nTroubleshooting steps:")
    print("1. Try uninstalling and reinstalling moviepy:")
    print("   pip uninstall -y moviepy")
    print("   pip install moviepy[all]")
    print("2. Check your Python environment:")
    print("   python -m pip list | findstr moviepy")
    print("3. Make sure you're using the correct Python interpreter")
    print("4. Check for any permission issues in the Python site-packages directory")
