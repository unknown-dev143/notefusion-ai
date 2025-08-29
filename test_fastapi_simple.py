from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "FastAPI is working!"}

if __name__ == "__main__":
    uvicorn.run(
        "test_fastapi_simple:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="debug"
    )
