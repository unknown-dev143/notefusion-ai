"""
Environment check script for NoteFusion AI.
"""
import sys
import os
import platform
import subprocess
from pathlib import Path

def print_header(title):
    """Print a section header."""
    print(f"\n{'='*50}")
    print(f"{title}")
    print(f"{'='*50}")

def check_python():
    """Check Python version and environment."""
    print_header("PYTHON ENVIRONMENT")
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Platform: {platform.platform()}")
    print(f"Working Directory: {os.getcwd()}")

def check_imports():
    """Check if required packages are importable."""
    print_header("REQUIRED PACKAGES")
    
    required = [
        ('fastapi', 'FastAPI'),
        ('gtts', 'gTTS'),
        ('speech_recognition', 'Recognizer'),
        ('pydub', 'AudioSegment'),
        ('pytest', 'pytest'),
    ]
    
    all_ok = True
    for pkg, obj in required:
        try:
            __import__(pkg)
            print(f"✅ {pkg} is installed")
        except ImportError:
            print(f"❌ {pkg} is NOT installed")
            all_ok = False
    
    return all_ok

def check_directories():
    """Check if required directories exist."""
    print_header("DIRECTORIES")
    
    required_dirs = [
        'app',
        'app/services',
        'app/api',
        'app/config',
        'tests'
    ]
    
    all_ok = True
    for dir_path in required_dirs:
        full_path = Path(dir_path)
        exists = full_path.exists() and full_path.is_dir()
        status = "✅" if exists else "❌"
        print(f"{status} {dir_path}")
        if not exists:
            all_ok = False
    
    return all_ok

def main():
    """Main function to run all checks."""
    print("\n" + "="*50)
    print("NOTEFUSION AI - ENVIRONMENT CHECK")
    print("="*50)
    
    check_python()
    imports_ok = check_imports()
    dirs_ok = check_directories()
    
    print_header("SUMMARY")
    if imports_ok and dirs_ok:
        print("✅ Environment looks good!")
    else:
        print("❌ Some issues were found. Please check the output above.")
    
    print("\nTo install missing packages, run:")
    print("pip install fastapi gtts SpeechRecognition pydub pytest")

if __name__ == "__main__":
    main()
