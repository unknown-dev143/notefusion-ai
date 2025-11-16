import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/test")
async def test_endpoint():
    return {"message": "Test endpoint working!"}

if __name__ == "__main__":
    uvicorn.run("test_fastapi_app:app", host="0.0.0.0", port=8000, reload=True)
