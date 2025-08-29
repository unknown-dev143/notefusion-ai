import os
import sys
import uvicorn
from fastapi import FastAPI
import socket

def check_port(port):
    """Check if a port is available."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) != 0

def main():
    print("=" * 50)
    print("FastAPI Server Debug Tool")
    print("=" * 50)
    
    # Print environment info
    print("\nEnvironment Information:")
    print(f"Python: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Check common ports
    ports = [5000, 8000, 8080, 3000, 5001, 8001, 8081]
    print("\nPort Status:")
    for port in ports:
        status = "available" if check_port(port) else "in use"
        print(f"  Port {port}: {status}")
    
    # Create a simple FastAPI app
    app = FastAPI()
    
    @app.get("/")
    async def root():
        return {"message": "FastAPI debug server is working!"}
    
    # Try starting the server
    print("\nAttempting to start FastAPI server...")
    try:
        port = 5000
        while port < 9000:
            if check_port(port):
                print(f"\nStarting server on port {port}...")
                print(f"Access the API at: http://localhost:{port}")
                print("Press Ctrl+C to stop the server")
                print("-" * 50)
                uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
                break
            port += 1
    except Exception as e:
        print(f"\nError starting server: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure no other server is running on the same port")
        print("2. Check if your firewall is blocking the connection")
        print("3. Try running the script as administrator")
        print("4. Check if another process is using the port")

if __name__ == "__main__":
    main()
