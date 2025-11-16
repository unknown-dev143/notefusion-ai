#!/bin/bash

# Script to set up API authentication and rate limiting
set -e

echo "🚀 Setting up API authentication system..."

# Change to the backend directory
cd "$(dirname "$0")/.."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed"
    exit 1
fi

# Install required Python packages
echo "📦 Installing required Python packages..."
pip3 install -r requirements.txt

# Run database migrations
echo "🔄 Running database migrations..."
alembic upgrade head

# Set up Redis
echo "🔧 Setting up Redis for rate limiting..."
python3 -m scripts.setup_redis

# Create test API key for development
if [ "$NODE_ENV" = "development" ]; then
    echo "🔑 Creating test API key..."
    python3 -c "
import asyncio
from app.db.session import SessionLocal
from app.crud.crud_api_key import crud_api_key
from app.models.api_key import APIKeyCreate

async def create_test_key():
    db = SessionLocal()
    try:
        # Check if test key already exists
        from app.models.user import User
        user = db.query(User).filter(User.email == "test@example.com").first()
        if not user:
            print("❌ Test user not found. Please run database migrations first.")
            return
            
        # Create a test API key
        api_key = await crud_api_key.create_with_owner(
            db=db,
            obj_in=APIKeyCreate(
                name="Test API Key",
                scopes=["notes:read", "notes:write"],
                rate_limit=1000,
                expires_in_days=30
            ),
            owner_id=user.id
        )
        print(f"✅ Test API Key created successfully!")
        print(f"🔑 Key ID: {api_key.key_id}")
        print(f"🔑 Key Secret: {api_key.key_secret}")
        print("⚠️  Keep this key secret and do not commit it to version control!")
    except Exception as e:
        print(f"❌ Error creating test API key: {str(e)}")
    finally:
        db.close()

asyncio.run(create_test_key())
    "
fi

echo "✨ API authentication setup completed successfully!"
