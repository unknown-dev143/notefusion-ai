import uvicorn
from pathlib import Path
import sys

# Add the current directory to the Python path
sys.path.append(str(Path(__file__).parent))

if __name__ == "__main__":
    print("Starting NoteFusion AI server...")
    print("Press Ctrl+C to stop")
    print("\nAPI Documentation:")
    print("  - Swagger UI: http://127.0.0.1:8000/docs")
    print("  - ReDoc:      http://127.0.0.1:8000/redoc")
    print("\nAccess the web interface at: http://localhost:3000")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
