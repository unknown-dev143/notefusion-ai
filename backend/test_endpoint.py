"""Test endpoint for server verification."""
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/test")
async def test():
    return {"status": "ok", "message": "Server is running!"}

if __name__ == "__main__":
    uvicorn.run("test_endpoint:app", host="0.0.0.0", port=8000, reload=True)
