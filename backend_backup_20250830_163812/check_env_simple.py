"""
Simple environment check script.
"""
import sys
import platform

def main():
    """Print environment information."""
    print("=== Environment Check ===")
    print(f"Python Version: {sys.version}")
    print(f"Platform: {platform.platform()}")
    print(f"Executable: {sys.executable}")
    
    # Test basic imports
    print("\n=== Testing Imports ===")
    try:
        import gtts
        print("✅ gTTS imported successfully")
    except ImportError as e:
        print(f"❌ gTTS import failed: {e}")
    
    print("\n=== Environment Check Complete ===")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
