from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/test")
async def test():
    return {"status": "working"}

if __name__ == "__main__":
    uvicorn.run("temp_server:app", host="0.0.0.0", port=5000, reload=True, log_level="debug")
