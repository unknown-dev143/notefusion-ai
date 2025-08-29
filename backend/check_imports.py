import sys

def check_import(module_name):
    try:
        __import__(module_name)
        print(f"✅ Successfully imported {module_name}")
        return True
    except ImportError as e:
        print(f"❌ Failed to import {module_name}: {e}")
        return False

print("=== Checking Python Imports ===\n")

# Check basic modules
modules = [
    "sys",
    "os",
    "numpy",
    "imageio",
    "moviepy",
    "moviepy.editor"
]

all_imported = True
for module in modules:
    if not check_import(module):
        all_imported = False

if all_imported:
    print("\n✅ All required modules are available!")
else:
    print("\n❌ Some required modules are missing. Please install them using:")
    print("pip install numpy imageio moviepy imageio-ffmpeg")
