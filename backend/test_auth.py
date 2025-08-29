"""
Test script for the authentication system.
"""
import asyncio
import httpx
import json
from typing import Dict, Any

# Base URL for the API
BASE_URL = "http://localhost:8000/api/v1"

async def test_register() -> Dict[str, Any]:
    """Test user registration."""
    url = f"{BASE_URL}/auth/register"
    user_data = {
        "email": "test@example.com",
        "password": "TestPass123!",
        "full_name": "Test User"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=user_data)
        return response.json()

async def test_login() -> Dict[str, str]:
    """Test user login and get access token."""
    url = f"{BASE_URL}/auth/login"
    login_data = {
        "username": "test@example.com",
        "password": "TestPass123!"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, data=login_data)
        return response.json()

async def test_protected_route(access_token: str) -> Dict[str, Any]:
    """Test accessing a protected route with the access token."""
    url = f"{BASE_URL}/auth/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        return response.json()

async def main():
    """Run all tests."""
    print("Testing authentication system...\n")
    
    # Test registration
    print("1. Testing registration...")
    register_result = await test_register()
    print("Registration Result:", json.dumps(register_result, indent=2))
    
    # Test login
    print("\n2. Testing login...")
    login_result = await test_login()
    print("Login Result:", json.dumps(login_result, indent=2))
    
    if "access_token" in login_result:
        # Test protected route
        print("\n3. Testing protected route...")
        me_result = await test_protected_route(login_result["access_token"])
        print("Protected Route Result:", json.dumps(me_result, indent=2))
    
    print("\nAuthentication tests completed!")

if __name__ == "__main__":
    asyncio.run(main())
