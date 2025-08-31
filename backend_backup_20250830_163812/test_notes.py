"""
Test script for NoteFusion AI backend API

This script tests the note management, file upload, and AI generation endpoints.
"""
import os
import asyncio
import httpx
from typing import Dict, Any
import json

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123"
}

# Global variables to store auth tokens and test data
auth_tokens = {}
test_data = {}

async def register_user():
    """Register a test user."""
    url = f"{BASE_URL}/auth/register"
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"],
            "full_name": "Test User"
        })
        
        if response.status_code == 201:
            print("✅ User registered successfully")
            return True
        elif "already exists" in response.text.lower():
            print("ℹ️  User already exists, continuing with login")
            return True
        else:
            print(f"❌ Failed to register user: {response.text}")
            return False

async def login_user():
    """Login the test user and store auth tokens."""
    url = f"{BASE_URL}/auth/login"
    async with httpx.AsyncClient() as client:
        response = await client.post(url, data={
            "username": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        
        if response.status_code == 200:
            tokens = response.json()
            auth_tokens["access"] = tokens["access_token"]
            auth_tokens["refresh"] = tokens["refresh_token"]
            print("✅ User logged in successfully")
            return True
        else:
            print(f"❌ Failed to login user: {response.text}")
            return False

async def get_headers() -> Dict[str, str]:
    """Get headers with auth token."""
    return {
        "Authorization": f"Bearer {auth_tokens.get('access')}",
        "Content-Type": "application/json"
    }

async def create_test_note():
    """Create a test note."""
    url = f"{BASE_URL}/notes/"
    note_data = {
        "title": "Test Note",
        "content": "This is a test note created by the test script.",
        "tags": ["test", "api"]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json=note_data,
            headers=await get_headers()
        )
        
        if response.status_code == 200:
            note = response.json()
            test_data["note_id"] = note["id"]
            print(f"✅ Test note created with ID: {note['id']}")
            return True
        else:
            print(f"❌ Failed to create test note: {response.text}")
            return False

async def upload_test_file(file_path: str):
    """Upload a test file to the test note."""
    if "note_id" not in test_data:
        print("❌ No note ID found. Create a note first.")
        return False
    
    url = f"{BASE_URL}/notes/{test_data['note_id']}/attachments"
    
    # Prepare file for upload
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "application/octet-stream")}
        
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {auth_tokens.get('access')}"}
            response = await client.post(
                url,
                files=files,
                headers=headers
            )
            
            if response.status_code == 200:
                attachment = response.json()
                test_data["attachment_id"] = attachment["id"]
                print(f"✅ File uploaded successfully: {attachment['filename']}")
                return True
            else:
                print(f"❌ Failed to upload file: {response.text}")
                return False

async def generate_note_content():
    """Generate content for the test note using AI."""
    if "note_id" not in test_data:
        print("❌ No note ID found. Create a note first.")
        return False
    
    url = f"{BASE_URL}/notes/{test_data['note_id']}/generate"
    prompt = {
        "prompt": "Expand on this note with more details and examples.",
        "language": "en",
        "style": "academic",
        "length": "medium"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json=prompt,
            headers=await get_headers()
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Successfully generated note content")
            print(f"Generated content preview: {result['note']['content'][:200]}...")
            return True
        else:
            print(f"❌ Failed to generate note content: {response.text}")
            return False

async def main():
    """Run all tests."""
    print("🚀 Starting NoteFusion AI API tests...\n")
    
    # Test authentication
    print("🔐 Testing authentication...")
    if not await register_user():
        return
    if not await login_user():
        return
    
    # Test note operations
    print("\n📝 Testing note operations...")
    if not await create_test_note():
        return
    
    # Test file upload
    print("\n📎 Testing file upload...")
    test_file = "test_file.txt"
    with open(test_file, "w") as f:
        f.write("This is a test file for upload testing.")
    
    if not await upload_test_file(test_file):
        return
    
    # Test AI content generation
    print("\n🤖 Testing AI content generation...")
    if not await generate_note_content():
        return
    
    print("\n✨ All tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
