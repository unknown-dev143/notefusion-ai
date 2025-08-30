
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Test successful! FastAPI is working."}

if __name__ == "__main__":
    print("Starting test server on http://127.0.0.1:5000")
    uvicorn.run("__main__:app", host="0.0.0.0", port=5000, log_level="info")
