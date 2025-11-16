import sys
import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    print("Root endpoint was called")
    return {"message": "NoteFusion AI Backend is running!"}

if __name__ == "__main__":
    print("Starting FastAPI server...")
    print(f"Python executable: {sys.executable}")
    print(f"Working directory: {os.getcwd()}")
    try:
        uvicorn.run("run_fastapi_test:app", host="0.0.0.0", port=8000, reload=True, log_level="debug")
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...")
