import sys
import os

print("Python version:", sys.version)
print("\nPython path:")
for p in sys.path:
    print(f"  {p}")

print("\nTrying to import moviepy...")
try:
    import moviepy.editor
    print("✅ Successfully imported moviepy.editor")
    
    print("\nMoviePy version:", moviepy.__version__)
    
    # Test basic functionality
    from moviepy.editor import TextClip
    print("✅ Successfully imported TextClip from moviepy.editor")
    
except Exception as e:
    print("❌ Error importing moviepy:")
    print(str(e))
    
    # Try to import the module directly
    try:
        import moviepy
        print("\nBut moviepy package is installed at:", moviepy.__file__)
    except ImportError as ie:
        print("\nCould not import moviepy at all:", str(ie))
    
    # Check if the module exists in site-packages
    print("\nChecking site-packages...")
    import site
    for path in site.getsitepackages():
        print(f"\nChecking {path}:")
        if os.path.exists(path) and 'moviepy' in os.listdir(path):
            print(f"  ✅ Found moviepy in {path}")
        else:
            print(f"  ❌ moviepy not found in {path}")
    
    # Check if the module is in the current directory
    if os.path.exists('moviepy'):
        print("\n⚠️ Found moviepy in current directory, which might cause conflicts")
