from fastapi import FastAPI
import uvicorn
import os

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "FastAPI is working!"}

if __name__ == "__main__":
    print("Starting FastAPI server...")
    print(f"Working directory: {os.getcwd()}")
    uvicorn.run("minimal_test:app", host="0.0.0.0", port=5000, reload=True, log_level="info")
