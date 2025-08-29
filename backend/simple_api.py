from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "NoteFusion AI API is running!"}

@app.get("/test")
async def test_endpoint():
    return {"status": "success", "message": "Test endpoint is working!"}

if __name__ == "__main__":
    print("Starting FastAPI server...")
    uvicorn.run("simple_api:app", host="0.0.0.0", port=8000, reload=True)
