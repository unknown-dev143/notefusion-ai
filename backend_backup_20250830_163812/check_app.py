"""
Simple script to verify the FastAPI application can be imported and started.
"""
import uvicorn

if __name__ == "__main__":
    print("🔄 Attempting to start FastAPI application...")
    try:
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        print(f"❌ Error starting FastAPI application: {e}")
        print("\nTroubleshooting steps:")
        print("1. Make sure you're in the backend directory")
        print("2. Install dependencies: pip install -r requirements.txt")
        print("3. Check for any error messages above")
        input("\nPress Enter to exit...")
