import sys
import os
import platform
import sqlite3
import asyncio
from pathlib import Path

print("=" * 50)
print("NoteFusion AI - Backend Debug Utility")
print("=" * 50)
print(f"Python Version: {sys.version}")
print(f"Platform: {platform.platform()}")
print(f"Current Directory: {os.getcwd()}")
print("\n" + "=" * 20 + " Environment Check " + "=" * 20)

# Check environment variables
print("\nEnvironment Variables:")
for var in ["PATH", "PYTHONPATH", "VIRTUAL_ENV"]:
    print(f"{var}: {os.environ.get(var, 'Not set')}")

# Check database files
print("\nDatabase Files:")
db_files = list(Path(".").glob("*.db"))
for db_file in db_files:
    try:
        conn = sqlite3.connect(str(db_file))
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"\n{db_file.name}:")
        print(f"  Size: {db_file.stat().st_size / 1024:.2f} KB")
        print(f"  Tables: {[t[0] for t in tables]}")
        conn.close()
    except Exception as e:
        print(f"  Error accessing {db_file}: {str(e)}")

# Check requirements
print("\n" + "=" * 20 + " Dependencies Check " + "=" * 20)
try:
    import pkg_resources
    required = ['fastapi', 'uvicorn', 'sqlalchemy', 'pydantic']
    installed = {pkg.key for pkg in pkg_resources.working_set}
    missing = set(required) - installed
    
    print("\nInstalled Dependencies:")
    for pkg in required:
        try:
            version = pkg_resources.get_distribution(pkg).version
            status = "✓" if pkg in installed else "✗"
            print(f"{status} {pkg}=={version}")
        except:
            print(f"✗ {pkg}: Not installed")
    
    if missing:
        print("\nMissing Dependencies:")
        for pkg in missing:
            print(f"- {pkg}")
        print("\nInstall missing packages with: pip install " + " ".join(missing))
    
except Exception as e:
    print(f"Error checking dependencies: {str(e)}")

# Test async database connection
async def test_db_connection():
    print("\n" + "=" * 20 + " Database Connection Test " + "=" * 20)
    try:
        from sqlalchemy.ext.asyncio import create_async_engine
        from sqlalchemy import text
        
        db_url = "sqlite+aiosqlite:///notefusion.db"
        print(f"\nConnecting to database: {db_url}")
        
        engine = create_async_engine(db_url, echo=True)
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            print(f"Test query result: {result.scalar()}")
            
            # Check tables
            result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            tables = [row[0] for row in result.fetchall()]
            print(f"\nDatabase tables: {tables}")
            
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
    finally:
        if 'engine' in locals():
            await engine.dispose()

# Run the debug checks
if __name__ == "__main__":
    print("\n" + "=" * 20 + " Running Tests " + "=" * 20)
    asyncio.run(test_db_connection())
    
    print("\n" + "=" * 20 + " Debug Complete " + "=" * 20)
    print("\nNext steps:")
    print("1. Check for any errors in the output above")
    print("2. Make sure all required dependencies are installed")
    print("3. Verify database connection and tables")
    print("4. Try running the server with: uvicorn main:app --reload")
    input("\nPress Enter to exit...")
