from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "FastAPI is working!"}

if __name__ == "__main__":
    print("Starting FastAPI server at http://127.0.0.1:8000")
    print("Press Ctrl+C to stop")
    uvicorn.run("test_fastapi_setup:app", host="0.0.0.0", port=8000, reload=True)
