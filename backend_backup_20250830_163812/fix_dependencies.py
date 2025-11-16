"""
Script to fix dependency issues for the audio service.
"""
import subprocess
import sys

def fix_dependencies():
    """Install or update required dependencies."""
    print("\n=== Fixing Dependencies ===\n")
    
    # List of packages to install with specific versions
    packages = [
        "pydantic==1.10.9",
        "pydantic-settings==2.0.3",
        "gtts==2.5.4",
        "SpeechRecognition==3.14.3",
        "pydub==0.25.1",
        "pyaudio==0.2.14"
    ]
    
    # Install each package
    for package in packages:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", package])
            print(f"✅ Successfully installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}: {e}")
    
    print("\n=== Dependencies Fixed ===\n")
    print("Please try running the tests again.")

if __name__ == "__main__":
    fix_dependencies()
