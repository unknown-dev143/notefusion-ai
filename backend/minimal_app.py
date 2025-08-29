from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Minimal FastAPI app is running"}

if __name__ == "__main__":
    uvicorn.run("minimal_app:app", host="0.0.0.0", port=8000, reload=True)
