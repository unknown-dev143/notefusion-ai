from fastapi import FastAPI
import uvicorn
import sys

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello, World!"}

if __name__ == "__main__":
    print("Starting FastAPI test server...")
    print(f"Python version: {sys.version}")
    print(f"Current directory: {os.getcwd()}")
    uvicorn.run("test_run:app", host="0.0.0.0", port=8000, reload=True)
