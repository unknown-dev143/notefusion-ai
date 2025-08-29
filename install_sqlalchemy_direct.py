import sys
import subprocess
import os

def main():
    python_exe = sys.executable or r"C:\Users\User\AppData\Local\Programs\Python\Python313\python.exe"
    
    print(f"Using Python: {python_exe}")
    
    # Check if SQLAlchemy is installed
    try:
        import sqlalchemy
        print(f"✅ SQLAlchemy is already installed (version: {sqlalchemy.__version__})")
        print(f"   Location: {sqlalchemy.__file__}")
        return True
    except ImportError:
        print("❌ SQLAlchemy is not installed. Installing now...")
    
    # Install SQLAlchemy
    try:
        print("🔧 Installing SQLAlchemy...")
        result = subprocess.run(
            [python_exe, "-m", "pip", "install", "--user", "sqlalchemy"],
            capture_output=True,
            text=True
        )
        print("✅ Installation output:")
        print(result.stdout)
        if result.stderr:
            print("❌ Errors:", result.stderr)
        
        # Verify installation
        try:
            import sqlalchemy
            print(f"✅ Success! SQLAlchemy version: {sqlalchemy.__version__}")
            print(f"   Installed at: {sqlalchemy.__file__}")
            return True
        except ImportError as e:
            print(f"❌ Verification failed: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Error during installation: {e}")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ SQLAlchemy is ready to use!")
    else:
        print("\n❌ Failed to install/verify SQLAlchemy. Please check the output above.")
    
    input("\nPress Enter to exit...")
