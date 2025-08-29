from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello, World! This is a test server."}

if __name__ == "__main__":
    print("Starting test server at http://127.0.0.1:8000")
    uvicorn.run("simple_server:app", host="0.0.0.0", port=8000, reload=True, log_level="debug")
