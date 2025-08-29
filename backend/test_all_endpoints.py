"""
Comprehensive API Test Script for NoteFusion AI Backend

This script tests all major API endpoints including:
- Authentication
- User Management
- Task Operations
- Session Management
"""

import requests
import json
import uuid
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "http://localhost:8000"
API_PREFIX = f"{BASE_URL}/api/v1"

# Test user credentials
TEST_USER = {
    "email": f"test_{str(uuid.uuid4())[:8]}@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
}

# Global variables to store test data
auth_token: Optional[str] = None
user_id: Optional[str] = None

class TestFailed(Exception):
    """Custom exception for test failures"""
    pass

def print_test_start(name: str):
    """Print test start message"""
    print(f"\n{'='*50}")
    print(f"TEST: {name}")
    print(f"{'='*50}")

def make_request(method: str, endpoint: str, data: Optional[Dict] = None, 
                headers: Optional[Dict] = None, auth_required: bool = True) -> Dict:
    """Make an HTTP request to the API"""
    url = f"{API_PREFIX}{endpoint}"
    headers = headers or {}
    
    # Add auth token if required
    if auth_required and auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, params=data)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        # Try to parse JSON response
        try:
            response_data = response.json()
        except ValueError:
            response_data = {"status": "error", "message": "Invalid JSON response"}
        
        return {
            "status_code": response.status_code,
            "data": response_data,
            "headers": dict(response.headers)
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "status_code": 0,
            "error": str(e),
            "data": {}
        }

def test_health_check():
    """Test the health check endpoint"""
    print_test_start("Health Check")
    
    result = make_request('GET', '/health', auth_required=False)
    
    if result["status_code"] == 200 and result["data"].get("status") == "ok":
        print("✅ Health check passed")
        return True
    else:
        print(f"❌ Health check failed: {result}")
        return False

def test_user_registration():
    """Test user registration"""
    print_test_start("User Registration")
    
    result = make_request('POST', '/auth/register', data=TEST_USER, auth_required=False)
    
    if result["status_code"] == 201 and "id" in result["data"]:
        global user_id
        user_id = result["data"]["id"]
        print("✅ User registration successful")
        print(f"   User ID: {user_id}")
        return True
    else:
        print(f"❌ User registration failed: {result}")
        return False

def test_user_login():
    """Test user login and get auth token"""
    print_test_start("User Login")
    
    login_data = {
        "username": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
    
    result = make_request('POST', '/auth/login', data=login_data, auth_required=False)
    
    if result["status_code"] == 200 and "access_token" in result["data"]:
        global auth_token
        auth_token = result["data"]["access_token"]
        print("✅ User login successful")
        print(f"   Token: {auth_token[:20]}...")
        return True
    else:
        print(f"❌ User login failed: {result}")
        return False

def test_create_task():
    """Test creating a new task"""
    print_test_start("Create Task")
    
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "priority": "high"
    }
    
    result = make_request('POST', '/tasks', data=task_data)
    
    if result["status_code"] == 201 and "id" in result["data"]:
        task_id = result["data"]["id"]
        print(f"✅ Task created successfully (ID: {task_id})")
        return task_id
    else:
        print(f"❌ Task creation failed: {result}")
        return None

def test_get_task(task_id: str):
    """Test retrieving a task"""
    print_test_start(f"Get Task {task_id}")
    
    result = make_request('GET', f'/tasks/{task_id}')
    
    if result["status_code"] == 200 and result["data"]["id"] == task_id:
        print("✅ Task retrieved successfully")
        return True
    else:
        print(f"❌ Task retrieval failed: {result}")
        return False

def test_update_task(task_id: str):
    """Test updating a task"""
    print_test_start(f"Update Task {task_id}")
    
    update_data = {
        "status": "completed",
        "description": "Updated description"
    }
    
    result = make_request('PUT', f'/tasks/{task_id}', data=update_data)
    
    if result["status_code"] == 200 and result["data"]["status"] == "completed":
        print("✅ Task updated successfully")
        return True
    else:
        print(f"❌ Task update failed: {result}")
        return False

def test_list_tasks():
    """Test listing all tasks"""
    print_test_start("List Tasks")
    
    result = make_request('GET', '/tasks')
    
    if result["status_code"] == 200 and isinstance(result["data"], list):
        print(f"✅ Retrieved {len(result['data'])} tasks")
        return True
    else:
        print(f"❌ Failed to list tasks: {result}")
        return False

def test_delete_task(task_id: str):
    """Test deleting a task"""
    print_test_start(f"Delete Task {task_id}")
    
    result = make_request('DELETE', f'/tasks/{task_id}')
    
    if result["status_code"] == 200 or result["status_code"] == 204:
        print("✅ Task deleted successfully")
        return True
    else:
        print(f"❌ Task deletion failed: {result}")
        return False

def test_user_profile():
    """Test user profile retrieval"""
    print_test_start("User Profile")
    
    result = make_request('GET', '/users/me')
    
    if result["status_code"] == 200 and "email" in result["data"]:
        print(f"✅ User profile retrieved: {result['data']['email']}")
        return True
    else:
        print(f"❌ Failed to retrieve user profile: {result}")
        return False

def run_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("NOTE FUSION AI - API TEST SUITE")
    print("="*60 + "\n")
    
    # Health check
    if not test_health_check():
        print("\n❌ Aborting tests - Health check failed")
        return False
    
    # User registration and authentication
    if not test_user_registration():
        print("\n❌ Aborting tests - User registration failed")
        return False
        
    if not test_user_login():
        print("\n❌ Aborting tests - User login failed")
        return False
    
    # Test user profile
    test_user_profile()
    
    # Task operations
    task_id = test_create_task()
    if task_id:
        test_get_task(task_id)
        test_update_task(task_id)
        test_list_tasks()
        test_delete_task(task_id)
    
    print("\n" + "="*60)
    print("TESTING COMPLETE")
    print("="*60 + "\n")
    
    return True

if __name__ == "__main__":
    run_tests()
