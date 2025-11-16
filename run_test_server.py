import sys
import os
import uvicorn
from fastapi import FastAPI
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('fastapi_test.log')
    ]
)

app = FastAPI()

@app.get("/test")
async def test():
    return {"status": "working", "python_version": sys.version}

def main():
    try:
        logging.info("Starting FastAPI test server...")
        logging.info(f"Python version: {sys.version}")
        logging.info(f"Working directory: {os.getcwd()}")
        
        uvicorn.run(
            "run_test_server:app",
            host="0.0.0.0",
            port=5000,
            log_level="debug",
            reload=True
        )
    except Exception as e:
        logging.error(f"Error starting server: {str(e)}", exc_info=True)
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()
