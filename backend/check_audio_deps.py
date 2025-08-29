"""
Verify Python environment and audio dependencies.
"""
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check Python version."""
    print("Python version:", sys.version)
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        return False
    print("✅ Python version is compatible")
    return True

def check_module(module_name):
    """Check if a Python module is installed."""
    try:
        __import__(module_name)
        print(f"✅ {module_name} is installed")
        return True
    except ImportError:
        print(f"❌ {module_name} is not installed")
        return False

def install_module(module_name):
    """Install a Python module using pip."""
    print(f"Installing {module_name}...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", module_name])
        print(f"✅ Successfully installed {module_name}")
        return True
    except subprocess.CalledProcessError:
        print(f"❌ Failed to install {module_name}")
        return False

def main():
    """Main function to check and install dependencies."""
    print("🔍 Checking Python environment and dependencies...")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        return 1
    
    # Required modules
    required_modules = [
        'gtts',
        'speech_recognition',
        'pydub',
        'pyaudio'
    ]
    
    # Check and install missing modules
    missing_modules = []
    for module in required_modules:
        if not check_module(module):
            missing_modules.append(module)
    
    if missing_modules:
        print("\n🔄 Installing missing modules...")
        for module in missing_modules:
            install_module(module)
    else:
        print("\n✅ All required modules are installed")
    
    print("\n🎉 Environment check completed!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
