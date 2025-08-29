import os
import sys
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Load environment variables
load_dotenv()

async def test_db_connection():
    """Test database connection"""
    from app.config.settings import settings
    
    print("🔍 Testing database connection...")
    try:
        # Create async engine
        engine = create_async_engine(settings.DATABASE_URL)
        
        # Test connection
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
            
        print("✅ Database connection successful!")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

async def setup_test_data():
    """Set up test user and API key"""
    from app.db.session import SessionLocal
    from app.models.user import User
    from app.models.api_key import APIKey
    from app.core.security import get_password_hash
    
    TEST_EMAIL = "test@example.com"
    TEST_PASSWORD = "testpassword"
    
    db = SessionLocal()
    try:
        print("\n🔧 Setting up test data...")
        
        # Create test user if not exists
        user = db.query(User).filter(User.email == TEST_EMAIL).first()
        if not user:
            user = User(
                email=TEST_EMAIL,
                hashed_password=get_password_hash(TEST_PASSWORD),
                full_name="Test User",
                is_active=True,
                is_superuser=False,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"✅ Created test user: {TEST_EMAIL}")
        else:
            print(f"ℹ️  Test user already exists: {TEST_EMAIL}")
        
        # Create API key if not exists
        api_key = db.query(APIKey).filter(APIKey.user_id == user.id).first()
        if not api_key:
            api_key = APIKey(
                user_id=user.id,
                name="Test API Key",
                scopes=["notes:read", "notes:write"],
                rate_limit=1000,
            )
            key_id, key_secret = api_key.generate_key()
            db.add(api_key)
            db.commit()
            
            print("\n🔑 Generated API Key:")
            print("=" * 50)
            print(f"Key ID:     {key_id}")
            print(f"Key Secret: {key_secret}")
            print(f"Full Key:   {key_id}.{key_secret}")
            print("=" * 50)
            
            # Save to .env file
            with open(".env", "a") as f:
                f.write(f"\n# Added by test script\nAPI_KEY={key_id}.{key_secret}\n")
            print("\n✅ API key saved to .env file")
        else:
            print("ℹ️  API key already exists for test user")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up test data: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

async def main():
    print("🚀 NoteFusion AI - Authentication Setup Test\n")
    
    # Test database connection
    if not await test_db_connection():
        print("\n❌ Please check your database configuration and try again.")
        return
    
    # Set up test data
    if not await setup_test_data():
        print("\n❌ Failed to set up test data. Please check the error above.")
        return
    
    print("\n✅ Setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the server: python -m uvicorn app.main:app --reload --port 8000")
    print("2. Test the API using the provided API key")

if __name__ == "__main__":
    asyncio.run(main())
