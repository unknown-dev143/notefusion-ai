import sys
import os
import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "success", "message": "FastAPI is working!"}

def main():
    print("="*50)
    print("FastAPI Verification Test")
    print("="*50)
    
    print("\nStarting FastAPI server on http://localhost:5000")
    print("Press Ctrl+C to stop the server\n")
    
    uvicorn.run(
        "verify_fastapi:app",
        host="0.0.0.0",
        port=5000,
        log_level="debug",
        reload=True
    )

if __name__ == "__main__":
    main()
