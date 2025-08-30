from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    print("Starting minimal FastAPI server...")
    uvicorn.run("minimal_test:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
