import sys
import os
import platform

def main():
    with open('python_debug.txt', 'w') as f:
        # Basic Python info
        f.write("=== Python Debug Information ===\n\n")
        f.write(f"Python Executable: {sys.executable}\n")
        f.write(f"Python Version: {sys.version}\n")
        f.write(f"Platform: {platform.platform()}\n")
        f.write(f"Current Working Directory: {os.getcwd()}\n\n")
        
        # Environment variables
        f.write("=== Environment Variables ===\n")
        for key in sorted(os.environ.keys()):
            if 'python' in key.lower() or 'path' in key.lower() or 'venv' in key.lower():
                f.write(f"{key} = {os.environ[key]}\n")
        
        # Try to create a virtual environment
        f.write("\n=== Virtual Environment Test ===\n")
        try:
            import venv
            venv_dir = os.path.join(os.getcwd(), 'test_venv')
            f.write(f"Attempting to create virtual environment at: {venv_dir}\n")
            
            # Create virtual environment
            venv.create(venv_dir, with_pip=True)
            f.write("Successfully created virtual environment\n")
            
            # Check if activation script exists
            if os.name == 'nt':  # Windows
                activate_script = os.path.join(venv_dir, 'Scripts', 'activate.bat')
            else:  # Unix/Linux/Mac
                activate_script = os.path.join(venv_dir, 'bin', 'activate')
                
            if os.path.exists(activate_script):
                f.write(f"Activation script found at: {activate_script}\n")
            else:
                f.write(f"Warning: Activation script not found at: {activate_script}\n")
                
        except Exception as e:
            f.write(f"Error creating virtual environment: {str(e)}\n")
        
        f.write("\n=== Python Path ===\n")
        for path in sys.path:
            f.write(f"{path}\n")
        
        f.write("\nDebug information saved to python_debug.txt\n")
        
        print("Debug information saved to python_debug.txt")

if __name__ == "__main__":
    main()
