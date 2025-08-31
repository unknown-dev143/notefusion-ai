print("=== Testing Python Imports ===\n")

# 1. Test basic Python functionality
try:
    import sys
    print("✅ Python version:", sys.version)
    print("✅ Python executable:", sys.executable)
    print("✅ Python path:", sys.path)
    print()
except Exception as e:
    print("❌ Error with basic Python:", str(e))
    sys.exit(1)

# 2. Test numpy import
try:
    import numpy
    print("✅ Successfully imported numpy from:", numpy.__file__)
    print("   numpy version:", numpy.__version__)
    print()
except ImportError as e:
    print("❌ Error importing numpy:", str(e))
    print("   Try running: pip install numpy")
    print()

# 3. Test imageio import
try:
    import imageio
    print("✅ Successfully imported imageio from:", imageio.__file__)
    print("   imageio version:", imageio.__version__)
    print()
except ImportError as e:
    print("❌ Error importing imageio:", str(e))
    print("   Try running: pip install imageio")
    print()

# 4. Test moviepy import
try:
    import moviepy
    print("✅ Successfully imported moviepy from:", moviepy.__file__)
    print("   moviepy version:")
    
    # Test specific submodules
    try:
        from moviepy.editor import TextClip
        print("   ✅ Successfully imported TextClip from moviepy.editor")
    except ImportError as e:
        print(f"   ❌ Error importing TextClip: {e}")
    
    print()
except ImportError as e:
    print("❌ Error importing moviepy:", str(e))
    print("   Try running: pip install moviepy")
    print()

print("\n=== Test Complete ===")
print("If you see any ❌ errors above, please install the missing packages using pip.")
print("For example: pip install numpy imageio moviepy imageio-ffmpeg")
