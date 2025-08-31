"""
Check Python environment and basic functionality.
"""
import sys
import platform
import os

def main():
    """Print environment information."""
    print("=== Python Environment Check ===\n")
    
    # Basic Python info
    print(f"Python Version: {sys.version}")
    print(f"Platform: {platform.platform()}")
    print(f"Executable: {sys.executable}")
    
    # Working directory
    print(f"\nWorking Directory: {os.getcwd()}")
    
    # Check write permissions
    test_file = "test_write.tmp"
    try:
        with open(test_file, 'w') as f:
            f.write("test")
        os.remove(test_file)
        print("✅ Write test passed")
    except Exception as e:
        print(f"❌ Write test failed: {e}")
    
    # Check basic imports
    print("\n=== Testing Imports ===")
    test_imports = [
        'gtts',
        'pydub',
        'speech_recognition'
    ]
    
    for module in test_imports:
        try:
            __import__(module)
            print(f"✅ {module} imported successfully")
        except ImportError as e:
            print(f"❌ {module} import failed: {e}")
    
    print("\n=== Environment Check Complete ===")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
