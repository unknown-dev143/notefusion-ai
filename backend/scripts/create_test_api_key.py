"""
Script to create a test API key for development and testing.
This should only be used in development environments.
"""
import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User
from app.models.api_key import APIKey
from app.core.security import get_password_hash
from sqlalchemy.orm import Session


def create_test_user(db: Session):
    """Create a test user if it doesn't exist."""
    test_email = "test@example.com"
    test_password = "testpassword"
    
    user = db.query(User).filter(User.email == test_email).first()
    if not user:
        user = User(
            email=test_email,
            hashed_password=get_password_hash(test_password),
            full_name="Test User",
            is_active=True,
            is_superuser=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Created test user with email: {test_email} and password: {test_password}")
    else:
        print(f"ℹ️  Test user already exists with email: {test_email}")
    
    return user


async def create_test_api_key():
    """Create a test API key."""
    db = SessionLocal()
    try:
        # Create test user if it doesn't exist
        user = create_test_user(db)
        
        # Check if a test API key already exists
        existing_key = db.query(APIKey).filter(
            APIKey.user_id == user.id,
            APIKey.name == "Test API Key"
        ).first()
        
        if existing_key:
            print("ℹ️  Test API key already exists. Deleting the old one...")
            db.delete(existing_key)
            db.commit()
        
        # Create a new test API key
        key = APIKey(
            user_id=user.id,
            name="Test API Key",
            scopes=["notes:read", "notes:write"],
            rate_limit=1000,
            expires_at=datetime.utcnow() + timedelta(days=30)
        )
        
        # Generate the key ID and secret
        key_id, key_secret = key.generate_key()
        
        db.add(key)
        db.commit()
        db.refresh(key)
        
        print("\n" + "="*50)
        print("✅ Test API Key Created Successfully!")
        print("="*50)
        print(f"🔑 Key ID:      {key_id}")
        print(f"🔑 Key Secret:  {key_secret}")
        print(f"🔗 Full Key:    {key_id}.{key_secret}")
        print("="*50)
        print("\n⚠️  IMPORTANT: This is a test key for development only!")
        print("   Do NOT use this in production or commit it to version control!")
        print("="*50 + "\n")
        
        return key
        
    except Exception as e:
        print(f"❌ Error creating test API key: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    if os.getenv("ENVIRONMENT") == "production":
        print("❌ This script should not be run in production!")
        sys.exit(1)
        
    print("🚀 Creating test API key...")
    asyncio.run(create_test_api_key())
