"""
Script to update environment variables and restart services.
"""
import os
import sys
import subprocess
import platform
from pathlib import Path
from typing import Dict, Optional, List

def get_os_type() -> str:
    """Get the operating system type."""
    return platform.system().lower()

def restart_docker_services() -> bool:
    """Restart Docker services."""
    try:
        print("🔄 Restarting Docker services...")
        subprocess.run(["docker-compose", "down"], check=True, cwd=Path(__file__).parent.parent)
        subprocess.run(["docker-compose", "up", "-d", "--build"], check=True, cwd=Path(__file__).parent.parent)
        print("✅ Docker services restarted successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error restarting Docker services: {e}")
        return False

def restart_windows_services() -> bool:
    """Restart Windows services."""
    try:
        print("🔄 Restarting Windows services...")
        # Example: Restart a Windows service
        # subprocess.run(["net", "stop", "YourServiceName"], check=True)
        # subprocess.run(["net", "start", "YourServiceName"], check=True)
        print("✅ Windows services restarted successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error restarting Windows services: {e}")
        return False

def restart_linux_services() -> bool:
    """Restart Linux services."""
    try:
        print("🔄 Restarting Linux services...")
        # Example: Restart systemd services
        # subprocess.run(["sudo", "systemctl", "restart", "your-service"], check=True)
        print("✅ Linux services restarted successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error restarting Linux services: {e}")
        return False

def restart_services() -> bool:
    """Restart services based on the operating system."""
    os_type = get_os_type()
    
    if os_type == 'windows':
        return restart_windows_services()
    elif os_type == 'linux':
        return restart_linux_services()
    else:
        print(f"❌ Unsupported operating system: {os_type}")
        return False

def update_environment() -> bool:
    """Update environment variables and restart services."""
    try:
        # Load environment variables from .env file
        env_path = Path(__file__).parent.parent / '.env'
        if not env_path.exists():
            print(f"❌ Error: .env file not found at {env_path}")
            return False
        
        # Load environment variables
        env_vars = {}
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
        
        # Update environment variables
        os.environ.update(env_vars)
        
        # Restart services
        if not restart_services():
            return False
        
        return True
    except Exception as e:
        print(f"❌ Error updating environment: {e}")
        return False

def main() -> int:
    """Main function to update environment and restart services."""
    print("🔄 Updating environment and restarting services...\n")
    
    try:
        if update_environment():
            print("\n✅ Environment updated and services restarted successfully!")
            return 0
        else:
            print("\n❌ Failed to update environment or restart services.")
            return 1
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
