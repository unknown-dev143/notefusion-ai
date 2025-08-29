from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    print("Starting FastAPI test server...")
    uvicorn.run("fastapi_test:app", host="0.0.0.0", port=8000, reload=True)
