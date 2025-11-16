"""
Test script to verify the authentication system.
This script tests user registration, login, and token verification.
"""
import asyncio
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = str(Path(__file__).parent.absolute())
sys.path.insert(0, project_root)

from app.core.database import init_db, close_db
from app.models.user import User
from app.core.security import (
    get_password_hash, 
    create_access_token,
    get_current_user,
    verify_password
)
from app.core.config import settings

async def test_user_authentication():
    """Test user registration and authentication."""
    print("🔐 Testing user authentication...")
    
    # Initialize database connection
    await init_db()
    
    try:
        # Test data
        test_email = "test@example.com"
        test_username = "testuser"
        test_password = "Test@1234"
        
        # Clean up any existing test user
        existing_user = await User.get_by_email(test_email)
        if existing_user:
            await existing_user.delete()
            print("🧹 Cleaned up existing test user")
        
        # 1. Test user registration
        print("\n1. Testing user registration...")
        hashed_password = get_password_hash(test_password)
        user = User(
            email=test_email,
            username=test_username,
            hashed_password=hashed_password,
            is_verified=True
        )
        await user.save()
        print(f"✅ Created user: {test_email}")
        
        # 2. Test user retrieval
        print("\n2. Testing user retrieval...")
        retrieved_user = await User.get_by_email(test_email)
        assert retrieved_user is not None, "Failed to retrieve user"
        assert retrieved_user.email == test_email, "Email doesn't match"
        print(f"✅ Retrieved user: {retrieved_user.email}")
        
        # 3. Test password verification
        print("\n3. Testing password verification...")
        assert verify_password(test_password, retrieved_user.hashed_password), \
            "Password verification failed"
        print("✅ Password verification successful")
        
        # 4. Test JWT token creation and verification
        print("\n4. Testing JWT token...")
        token_data = {"sub": str(retrieved_user.id)}
        token = create_access_token(token_data)
        print(f"✅ Created access token: {token[:50]}...")
        
        # 5. Test token verification
        current_user = await get_current_user(token)
        assert current_user is not None, "Failed to verify token"
        assert str(current_user.id) == str(retrieved_user.id), "User ID doesn't match"
        print(f"✅ Token verified for user: {current_user.email}")
        
        # 6. Test failed login attempt tracking
        print("\n5. Testing failed login attempt tracking...")
        await retrieved_user.record_failed_login()
        assert retrieved_user.failed_login_attempts == 1, "Failed login not recorded"
        print(f"✅ Recorded failed login attempt. Total attempts: {retrieved_user.failed_login_attempts}")
        
        # 7. Test successful login after failure
        print("\n6. Testing successful login after failure...")
        await retrieved_user.record_successful_login()
        assert retrieved_user.failed_login_attempts == 0, "Failed to reset login attempts"
        print("✅ Successfully recorded successful login")
        
        print("\n🎉 All authentication tests passed!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        raise
        
    finally:
        # Clean up
        if 'retrieved_user' in locals():
            await retrieved_user.delete()
            print("\n🧹 Cleaned up test user")
        await close_db()

if __name__ == "__main__":
    asyncio.run(test_user_authentication())
    input("\nPress Enter to exit...")
