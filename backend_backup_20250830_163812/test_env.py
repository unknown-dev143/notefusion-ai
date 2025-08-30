<<<<<<< HEAD
import sys  
print(sys.executable)  
=======
import sys
import os
import platform
import site

def print_divider():
    print("\n" + "="*80 + "\n")

print("Python Environment Information:")
print_divider()
print(f"Python Executable: {sys.executable}")
print(f"Python Version: {platform.python_version()}")
print(f"Platform: {platform.platform()}")

print_divider()
print("Python Path:")
for p in sys.path:
    print(f"  - {p}")

print_divider()
print("Site Packages:")
for path in site.getsitepackages():
    print(f"  - {path}")

print_divider()
print("Testing Basic Imports:")

try:
    import numpy
    print("✅ numpy:", numpy.__version__)
except ImportError as e:
    print("❌ numpy import failed:", str(e))

try:
    import moviepy
    print("✅ moviepy:", moviepy.__version__)
except ImportError as e:
    print("❌ moviepy import failed:", str(e))

try:
    from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
    print("✅ moviepy.editor imports successful")
except ImportError as e:
    print("❌ moviepy.editor import failed:", str(e))
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
