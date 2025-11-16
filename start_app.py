<<<<<<< HEAD
#!/usr/bin/env python3
"""
NoteFusion AI Startup Script
Starts both backend and frontend servers
"""

import subprocess
import sys
import os
import time
=======
#!/usr/bin/env python3
"""
NoteFusion AI Startup Script
Starts both backend and frontend servers
"""

import subprocess
import sys
import os
import time
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import requests
import webbrowser
from pathlib import Path

def check_python():
    """Check if Python is available"""
    try:
        result = subprocess.run(['py', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[OK] Python found: {result.stdout.strip()}")
            return True
        else:
            print("[ERROR] Python not found")
            return False
    except FileNotFoundError:
        print("[ERROR] Python not found")
        return False

def check_node():
    """Check if Node.js is available"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[OK] Node.js found: {result.stdout.strip()}")
            return True
        else:
            print("[ERROR] Node.js not found")
            return False
    except FileNotFoundError:
        print("[ERROR] Node.js not found")
        return False

def install_backend_dependencies():
    """Install backend dependencies"""
    print("Installing backend dependencies...")
    try:
        subprocess.run(['py', '-m', 'pip', 'install', '-r', 'backend/requirements.txt'], 
                      check=True, cwd='.')
        print("[OK] Backend dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to install backend dependencies: {e}")
        return False

def install_frontend_dependencies():
    """Install frontend dependencies"""
    print("Installing frontend dependencies...")
    try:
        subprocess.run(['npm', 'install'], check=True, cwd='frontend')
        print("[OK] Frontend dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to install frontend dependencies: {e}")
        return False

def start_backend():
    """Start the backend server"""
    print("Starting backend server...")
    try:
        # Start backend in background
        backend_process = subprocess.Popen(
            ['py', '-m', 'uvicorn', 'main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'],
            cwd='backend',
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a bit for server to start
        time.sleep(3)
        
        # Test if server is running
        try:
            response = requests.get('http://localhost:8000/', timeout=5)
            if response.status_code == 200:
                print("[OK] Backend server started successfully")
                return backend_process
            else:
                print(f"[ERROR] Backend server returned status {response.status_code}")
                return None
        except requests.exceptions.RequestException:
            print("[ERROR] Backend server not responding")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the frontend server"""
    print("Starting frontend server...")
    try:
        # Start frontend in background
        frontend_process = subprocess.Popen(
            ['npm', 'start'],
            cwd='frontend',
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a bit for server to start
        time.sleep(5)
        
        # Test if server is running
        try:
            response = requests.get('http://localhost:3000/', timeout=5)
            if response.status_code == 200:
                print("[OK] Frontend server started successfully")
                return frontend_process
            else:
                print(f"[ERROR] Frontend server returned status {response.status_code}")
                return None
        except requests.exceptions.RequestException:
            print("[ERROR] Frontend server not responding")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to start frontend: {e}")
        return None

def test_backend_api():
    """Test the backend API"""
    print("Testing backend API...")
    try:
        # Test health check
        response = requests.get('http://localhost:8000/')
        if response.status_code == 200:
            print("[OK] Health check passed")
        else:
            print(f"[ERROR] Health check failed: {response.status_code}")
            return False
        
        # Test sessions endpoint
        response = requests.get('http://localhost:8000/api/sessions')
        if response.status_code == 200:
            print("[OK] Sessions API working")
        else:
            print(f"[ERROR] Sessions API failed: {response.status_code}")
            return False
        
        print("[OK] Backend API tests passed")
        return True
        
    except Exception as e:
        print(f"[ERROR] Backend API test failed: {e}")
        return False

def open_browser():
    """Open the application in browser"""
    print("Opening application in browser...")
    try:
        webbrowser.open('http://localhost:3000')
        print("[OK] Browser opened")
    except Exception as e:
        print(f"[ERROR] Failed to open browser: {e}")

def main():
    """Main startup function"""
    print("NoteFusion AI Startup Script")
    print("=" * 50)
    
    # Check prerequisites
    if not check_python():
        print("Please install Python and try again")
        return
    
    if not check_node():
        print("Please install Node.js and try again")
        return
    
    # Install dependencies
    if not install_backend_dependencies():
        print("Failed to install backend dependencies")
        return
    
    if not install_frontend_dependencies():
        print("Failed to install frontend dependencies")
        return
    
    # Start servers
    backend_process = start_backend()
    if not backend_process:
        print("Failed to start backend server")
        return
    
    frontend_process = start_frontend()
    if not frontend_process:
        print("Failed to start frontend server")
        backend_process.terminate()
        return
    
    # Test API
    if not test_backend_api():
        print("Backend API tests failed")
        backend_process.terminate()
        frontend_process.terminate()
        return
    
    # Open browser
    open_browser()
    
    print("\nNoteFusion AI is now running!")
    print("Frontend: http://localhost:3000")
    print("Backend API: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop all servers")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("[OK] Servers stopped")

if __name__ == "__main__":
    main()