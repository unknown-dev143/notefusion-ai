"""
Script to check the status of the NoteFusion AI application.
This script verifies the database connection and checks if the API is responding.
"""
import asyncio
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.absolute())
sys.path.insert(0, project_root)

from app.core.database import init_db, close_db, engine
from app.core.config import settings

def print_status(message, success=True):
    """Print a status message with an emoji."""
    emoji = "✅" if success else "❌"
    print(f"{emoji} {message}")

async def check_database():
    """Check if the database is accessible."""
    try:
        # Initialize database connection
        await init_db()
        
        # Check if we can execute a simple query
        async with engine.connect() as conn:
            result = await conn.execute("SELECT 1")
            row = result.fetchone()
            if row and row[0] == 1:
                print_status("Database connection successful")
                return True
            else:
                print_status("Database connection failed: Unexpected query result", False)
                return False
                
    except Exception as e:
        print_status(f"Database connection failed: {str(e)}", False)
        return False
        
    finally:
        await close_db()

async def check_api():
    """Check if the API is responding."""
    import aiohttp
    
    base_url = "http://localhost:8000"
    endpoints = [
        "/api/v1/health",
        "/docs",
        "/redoc"
    ]
    
    async with aiohttp.ClientSession() as session:
        for endpoint in endpoints:
            try:
                url = f"{base_url}{endpoint}"
                async with session.get(url, timeout=5) as response:
                    status = "OK" if response.status < 400 else "ERROR"
                    print_status(f"API {endpoint}: {status} ({response.status})", response.status < 400)
            except Exception as e:
                print_status(f"API {endpoint}: ERROR - {str(e)}", False)

async def main():
    """Run all checks."""
    print("🔍 Checking NoteFusion AI status...\n")
    
    # Check database connection
    print("1. Database Check")
    print("-" * 30)
    db_ok = await check_database()
    
    # Check API endpoints
    print("\n2. API Check")
    print("-" * 30)
    await check_api()
    
    # Print summary
    print("\n📋 Status Summary")
    print("-" * 30)
    print(f"Database: {'✅ OK' if db_ok else '❌ Not OK'}")
    print("\nNext steps:")
    if not db_ok:
        print("  - Make sure the database server is running")
        print(f"  - Check the database URL in your .env file: {settings.DATABASE_URL}")
    print("  - Start the application with: python -m uvicorn app.main:app --reload")
    print(f"  - Access the API documentation at: http://localhost:8000/docs")

if __name__ == "__main__":
    asyncio.run(main())
    input("\nPress Enter to exit...")
