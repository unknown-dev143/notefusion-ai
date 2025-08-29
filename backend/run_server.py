import uvicorn
import os
from pathlib import Path

# Set the working directory to the backend folder
os.chdir(Path(__file__).parent)

if __name__ == "__main__":
    print("Starting NoteFusion AI Backend...")
    print(f"Current directory: {os.getcwd()}")
    
    # Check if main.py exists
    if not os.path.exists("main.py"):
        print("Error: main.py not found!")
        exit(1)
    
    # Start the FastAPI server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )
