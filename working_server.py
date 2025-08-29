from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/test")
def test_endpoint():
    return {"status": "working"}

if __name__ == "__main__":
    uvicorn.run(
        "working_server:app",
        host="0.0.0.0",
        port=5000,
        log_level="debug",
        reload=True
    )
