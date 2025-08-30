from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "FastAPI is working!"}

if __name__ == "__main__":
    print("Starting FastAPI test server on http://127.0.0.1:8000")
    uvicorn.run("test_fastapi_simple:app", host="0.0.0.0", port=8000, log_level="info")
