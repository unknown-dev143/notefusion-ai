from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello, World!"}

if __name__ == "__main__":
    uvicorn.run("minimal_fastapi:app", host="0.0.0.0", port=8000, reload=True, log_level="debug")
