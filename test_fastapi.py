from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Test endpoint is working!"}

if __name__ == "__main__":
    uvicorn.run("test_fastapi:app", host="0.0.0.0", port=8000, reload=True)
