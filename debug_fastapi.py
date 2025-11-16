import os
import sys
import subprocess
import time
from pathlib import Path

def log(message, level="INFO"):
    """Log messages with timestamp and level"""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}", file=sys.stderr)

def run_command(command, cwd=None):
    """Run a command and return the output"""
    log(f"Running: {command}")
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        if result.stdout:
            log(f"Output:\n{result.stdout}")
        if result.stderr:
            log(f"Error:\n{result.stderr}", "ERROR")
        return result.returncode == 0
    except Exception as e:
        log(f"Command failed: {str(e)}", "ERROR")
        return False

def main():
    # Get the current directory
    base_dir = Path(__file__).parent.absolute()
    backend_dir = base_dir / "backend"
    
    log(f"Base directory: {base_dir}")
    log(f"Backend directory: {backend_dir}")
    
    # Check Python version
    log("Checking Python version...")
    run_command("python --version")
    
    # Create virtual environment if it doesn't exist
    venv_dir = base_dir / ".venv"
    if not venv_dir.exists():
        log("Creating virtual environment...")
        if not run_command("python -m venv .venv"):
            log("Failed to create virtual environment", "ERROR")
            return
    
    # Activate virtual environment and install dependencies
    if os.name == 'nt':  # Windows
        activate_script = ".venv\\Scripts\\activate.bat"
        pip_path = ".venv\\Scripts\\pip"
        python_path = ".venv\\Scripts\\python"
    else:  # Unix/Linux/Mac
        activate_script = "source .venv/bin/activate"
        pip_path = ".venv/bin/pip"
        python_path = ".venv/bin/python"
    
    log("Installing dependencies...")
    if not run_command(f"{pip_path} install -r requirements.txt", cwd=backend_dir):
        log("Failed to install dependencies", "ERROR")
        return
    
    # Check if .env exists, if not create one
    env_file = backend_dir / ".env"
    if not env_file.exists():
        log("Creating .env file...")
        try:
            with open(env_file, 'w') as f:
                f.write("# NoteFusion AI Environment Variables\n")
                f.write("DATABASE_URL=sqlite+aiosqlite:///./notefusion.db\n")
                f.write("SECRET_KEY=change_this_to_a_secure_secret_key\n")
                f.write("JWT_SECRET_KEY=change_this_to_a_secure_jwt_secret_key\n")
                f.write("CORS_ORIGINS=http://localhost:3000,http://localhost:8000\n")
            log("Created default .env file")
        except Exception as e:
            log(f"Failed to create .env file: {str(e)}", "ERROR")
    
    # Start the FastAPI server
    log("Starting FastAPI server...")
    log(f"Using Python: {python_path}")
    log(f"Working directory: {backend_dir}")
    
    # Run the FastAPI server
    server_command = f"{python_path} -m uvicorn app.main:app --reload"
    log(f"Running: {server_command}")
    
    try:
        process = subprocess.Popen(
            server_command,
            cwd=backend_dir,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace',
            bufsize=1,
            universal_newlines=True
        )
        
        # Stream the output
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                log(output.strip())
        
        # Check for any errors
        _, stderr = process.communicate()
        if stderr:
            log(f"Error: {stderr}", "ERROR")
        
    except KeyboardInterrupt:
        log("Stopping server...")
        process.terminate()
    except Exception as e:
        log(f"Failed to start server: {str(e)}", "ERROR")

if __name__ == "__main__":
    main()
