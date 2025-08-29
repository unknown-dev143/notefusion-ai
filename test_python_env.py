import sys
import os
import platform

def test_environment():
    print("=== Python Environment Test ===")
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Platform: {platform.platform()}")
    print(f"Current Working Directory: {os.getcwd()}")
    
    print("\nEnvironment Variables:")
    for key in ['PATH', 'PYTHONPATH', 'PYTHONHOME']:
        if key in os.environ:
            print(f"{key}: {os.environ[key]}")
    
    print("\n=== Import Tests ===")
    try:
        import pytest
        print(f"✅ pytest version: {pytest.__version__}")
    except ImportError:
        print("❌ pytest not installed")
    
    try:
        import asyncio
        print(f"✅ asyncio version: {asyncio.__version__ if hasattr(asyncio, '__version__') else 'built-in'}")
    except ImportError:
        print("❌ asyncio not available")

if __name__ == "__main__":
    test_environment()
    input("\nPress Enter to exit...")
