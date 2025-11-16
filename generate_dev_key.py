import os
import sys
import asyncio
from datetime import datetime, timedelta

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.api_key import APIKey
from app.core.security import get_password_hash

async def create_test_key():
    db = SessionLocal()
    try:
        # Create a test user if it doesn't exist
        test_email = "dev@example.com"
        test_password = "devpassword123"
        
        user = db.query(User).filter(User.email == test_email).first()
        if not user:
            user = User(
                email=test_email,
                hashed_password=get_password_hash(test_password),
                full_name="Developer User",
                is_active=True,
                is_superuser=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"✅ Created test user with email: {test_email} and password: {test_password}")
        
        # Create a test API key with all scopes
        key = APIKey(
            user_id=user.id,
            name="Development API Key",
            scopes=["notes:read", "notes:write", "users:read", "users:write"],
            rate_limit=1000,
            expires_at=datetime.utcnow() + timedelta(days=30)
        )
        
        # Generate the key ID and secret
        key_id, key_secret = key.generate_key()
        
        db.add(key)
        db.commit()
        
        print("\n" + "="*60)
        print("✅ Development API Key Created Successfully!")
        print("="*60)
        print(f"🔑 Key ID:      {key_id}")
        print(f"🔑 Key Secret:  {key_secret}")
        print(f"🔗 Full Key:    {key_id}.{key_secret}")
        print("="*60)
        print("\n⚠️  IMPORTANT: This is a development key!")
        print("   - Store it securely")
        print("   - Never commit it to version control")
        print("   - Rotate it regularly in production")
        print("="*60 + "\n")
        
        # Save to .env file
        with open(".env", "a") as f:
            f.write(f"\n# Added by generate_dev_key.py\nAPI_KEY={key_id}.{key_secret}\n")
        
        print("✅ API key has been added to your .env file")
        
        return key
        
    except Exception as e:
        print(f"❌ Error creating test API key: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    if os.getenv("ENVIRONMENT") == "production":
        print("❌ This script should not be run in production!")
        sys.exit(1)
        
    print("🚀 Generating development API key...")
    asyncio.run(create_test_key())
