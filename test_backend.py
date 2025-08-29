import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Test basic imports
try:
    from fastapi import FastAPI
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    import uvicorn
    print("✅ All required packages are installed")
except ImportError as e:
    print(f"❌ Missing package: {e.name}")
    print(f"Please install it using: pip install {e.name}")
    sys.exit(1)

# Test database connection
try:
    from backend.app.config import settings
    print(f"✅ Successfully imported settings from {settings.__file__}")
    
    # Test database connection
    try:
        SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        connection = engine.connect()
        print("✅ Successfully connected to the database")
        connection.close()
    except Exception as e:
        print(f"❌ Database connection error: {str(e)}")
        print(f"DATABASE_URL: {getattr(settings, 'DATABASE_URL', 'Not set')}")
        
except Exception as e:
    print(f"❌ Error importing settings: {str(e)}")
    print("Make sure you have a .env file with the correct settings")

print("\nTo start the server, run:")
print("uvicorn backend.app.main:app --reload")
