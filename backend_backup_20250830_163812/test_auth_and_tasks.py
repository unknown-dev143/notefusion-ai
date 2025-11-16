"""
Test Authentication and Task Management API Endpoints
"""

import requests
import uuid
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "http://localhost:8000"
API_PREFIX = f"{BASE_URL}/api/v1"

# Test user data
test_user = {
    "email": f"test_{str(uuid.uuid4())[:8]}@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
}

# Global variables
auth_token: Optional[str] = None

# Helper functions
def print_step(step: str):
    print(f"\n{'-'*50}")
    print(f"STEP: {step}")
    print(f"{'-'*50}")

def make_request(method: str, endpoint: str, data: Optional[Dict] = None, auth_required: bool = True) -> Dict:
    """Make an HTTP request to the API"""
    url = f"{API_PREFIX}{endpoint}"
    headers = {}
    
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
    print_step("Testing Health Check")
    result = make_request('GET', '/health', auth_required=False)
    print(f"Status Code: {result['status_code']}")
    print(f"Response: {result['data']}")
    return result['status_code'] == 200 and result['data'].get('status') == 'ok'

def test_user_registration():
    """Test user registration"""
    print_step("Testing User Registration")
    result = make_request('POST', '/auth/register', data=test_user, auth_required=False)
    print(f"Status Code: {result['status_code']}")
    print(f"Response: {result['data']}")
    return result['status_code'] in (200, 201) and 'id' in result.get('data', {})

def test_user_login():
    """Test user login"""
    global auth_token
    print_step("Testing User Login")
    
    login_data = {
        "username": test_user["email"],
        "password": test_user["password"]
    }
    
    result = make_request('POST', '/auth/login', data=login_data, auth_required=False)
    print(f"Status Code: {result['status_code']}")
    
    if result['status_code'] == 200 and 'access_token' in result.get('data', {}):
        auth_token = result['data']['access_token']
        print("Login successful!")
        return True
    else:
        print(f"Login failed: {result['data']}")
        return False

def test_create_task():
    """Test creating a new task"""
    print_step("Testing Task Creation")
    
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "status": "pending",
        "priority": "high"
    }
    
    result = make_request('POST', '/tasks', data=task_data)
    print(f"Status Code: {result['status_code']}")
    print(f"Response: {result['data']}")
    
    if result['status_code'] in (200, 201) and 'id' in result.get('data', {}):
        return result['data']['id']
    return None

def test_get_task(task_id: str):
    """Test retrieving a task"""
    print_step(f"Testing Get Task {task_id}")
    result = make_request('GET', f'/tasks/{task_id}')
    print(f"Status Code: {result['status_code']}")
    print(f"Response: {result['data']}")
    return result['status_code'] == 200 and result['data'].get('id') == task_id

def test_update_task(task_id: str):
    """Test updating a task"""
    print_step(f"Testing Update Task {task_id}")
    
    update_data = {
        "status": "completed",
        "description": "Updated description"
    }
    
    result = make_request('PUT', f'/tasks/{task_id}', data=update_data)
    print(f"Status Code: {result['status_code']}")
    print(f"Response: {result['data']}")
    
    return result['status_code'] == 200 and result['data'].get('status') == 'completed'

def test_list_tasks():
    """Test listing all tasks"""
    print_step("Testing List Tasks")
    result = make_request('GET', '/tasks')
    print(f"Status Code: {result['status_code']}")
    print(f"Found {len(result.get('data', []))} tasks")
    return result['status_code'] == 200 and isinstance(result.get('data', []), list)

def test_delete_task(task_id: str):
    """Test deleting a task"""
    print_step(f"Testing Delete Task {task_id}")
    result = make_request('DELETE', f'/tasks/{task_id}')
    print(f"Status Code: {result['status_code']}")
    return result['status_code'] in (200, 204)

def run_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("NOTE FUSION AI - API TEST SUITE")
    print("="*60 + "\n")
    
    # Test health check
    if not test_health_check():
        print("\n❌ Health check failed")
        return False
    
    # Test user registration
    if not test_user_registration():
        print("\n❌ User registration failed")
        return False
    
    # Test user login
    if not test_user_login():
        print("\n❌ User login failed")
        return False
    
    # Test task operations
    task_id = test_create_task()
    if not task_id:
        print("\n❌ Task creation failed")
        return False
    
    if not test_get_task(task_id):
        print("\n❌ Task retrieval failed")
        return False
    
    if not test_update_task(task_id):
        print("\n❌ Task update failed")
        return False
    
    if not test_list_tasks():
        print("\n❌ Task listing failed")
        return False
    
    if not test_delete_task(task_id):
        print("\n❌ Task deletion failed")
        return False
    
    print("\n✅ All tests passed!")
    return True

if __name__ == "__main__":
    run_tests()
