"""
Test script for task management API endpoints.
Run with: python -m pytest test_tasks_api.py -v
"""
import pytest
from fastapi import status
from datetime import datetime, timedelta
from test_utils import client, test_db, create_test_user, create_auth_token

# Test data
TEST_TASK = {
    "title": "Test Task",
    "description": "This is a test task",
    "status": "pending",
    "priority": "medium",
    "due_date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
    "reminder_enabled": True,
    "reminder_time": (datetime.utcnow() + timedelta(days=6, hours=12)).isoformat(),
    "category": "work",
    "tags": ["test", "important"]
}

@pytest.fixture
def auth_headers(test_db):
    """Return authentication headers with a valid token."""
    _, token = test_db[1], test_db[1]  # Get token from test_db fixture
    return {"Authorization": token}

def test_create_task(auth_headers):
    """Test creating a new task."""
    response = client.post("/api/v1/tasks", json=TEST_TASK, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    
    # Verify response data
    assert data["title"] == TEST_TASK["title"]
    assert data["description"] == TEST_TASK["description"]
    assert data["status"] == TEST_TASK["status"]
    assert data["priority"] == TEST_TASK["priority"]
    assert data["category"] == TEST_TASK["category"]
    assert data["tags"] == TEST_TASK["tags"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data
    
    # Clean up
    task_id = data["id"]
    client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)

def test_get_task(auth_headers):
    """Test retrieving a task by ID."""
    # Create a test task
    create_response = client.post("/api/v1/tasks", json=TEST_TASK, headers=auth_headers)
    assert create_response.status_code == status.HTTP_201_CREATED
    task_id = create_response.json()["id"]
    
    # Test get
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Verify response data
    assert data["id"] == task_id
    assert data["title"] == TEST_TASK["title"]
    assert data["description"] == TEST_TASK["description"]
    
    # Test non-existent task
    response = client.get(f"/api/v1/tasks/{uuid4()}", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # Clean up
    client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)

def test_update_task(auth_headers):
    """Test updating a task."""
    # Create a test task
    create_response = client.post("/api/v1/tasks", json=TEST_TASK, headers=auth_headers)
    task_id = create_response.json()["id"]
    
    # Test partial update
    update_data = {
        "description": "Updated description", 
        "status": "in_progress",
        "priority": "high"
    }
    response = client.put(
        f"/api/v1/tasks/{task_id}", 
        json=update_data, 
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Verify updated fields
    assert data["description"] == update_data["description"]
    assert data["status"] == update_data["status"]
    assert data["priority"] == update_data["priority"]
    
    # Verify other fields remain unchanged
    assert data["title"] == TEST_TASK["title"]
    assert data["category"] == TEST_TASK["category"]
    
    # Test update with invalid status
    invalid_update = {"status": "invalid_status"}
    response = client.put(
        f"/api/v1/tasks/{task_id}",
        json=invalid_update,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    # Clean up
    client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)

def test_delete_task(auth_headers):
    """Test deleting a task."""
    # Create a test task
    create_response = client.post("/api/v1/tasks", json=TEST_TASK, headers=auth_headers)
    task_id = create_response.json()["id"]
    
    # Test delete
    response = client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify task is deleted
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # Test delete non-existent task
    response = client.delete(f"/api/v1/tasks/{uuid4()}", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_list_tasks(auth_headers):
    """Test listing tasks with filtering and pagination."""
    # Create test tasks
    tasks = [
        {"title": "Task 1", "status": "pending", "priority": "high", "category": "work"},
        {"title": "Task 2", "status": "in_progress", "priority": "medium", "category": "personal"},
        {"title": "Task 3", "status": "completed", "priority": "low", "category": "work"},
        {"title": "Task 4", "status": "pending", "priority": "high", "category": "personal"},
    ]
    
    # Store created task IDs for cleanup
    task_ids = []
    for task in tasks:
        response = client.post("/api/v1/tasks", json=task, headers=auth_headers)
        task_ids.append(response.json()["id"])
    
    # Test get all tasks
    response = client.get("/api/v1/tasks", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    all_tasks = response.json()
    assert isinstance(all_tasks, list)
    
    # Test filtering by status
    response = client.get("/api/v1/tasks?status=pending", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    pending_tasks = response.json()
    assert all(task["status"] == "pending" for task in pending_tasks)
    
    # Test filtering by priority
    response = client.get("/api/v1/tasks?priority=high", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    high_priority_tasks = response.json()
    assert all(task["priority"] == "high" for task in high_priority_tasks)
    
    # Test filtering by category
    response = client.get("/api/v1/tasks?category=work", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    work_tasks = response.json()
    assert all(task["category"] == "work" for task in work_tasks)
    
    # Test pagination
    response = client.get("/api/v1/tasks?limit=2&skip=1", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    paginated_tasks = response.json()
    assert len(paginated_tasks) <= 2  # Should be at most 2 tasks
    
    # Clean up
    for task_id in task_ids:
        client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)

def test_search_tasks(auth_headers):
    """Test searching tasks by title or description."""
    # Create test tasks
    tasks = [
        {"title": "Find me", "description": "Important task", "tags": ["test"]},
        {"title": "Another task", "description": "Find this description", "tags": ["test"]},
        {"title": "Regular task", "description": "Nothing special", "tags": ["other"]},
    ]
    
    # Store created task IDs for cleanup
    task_ids = []
    for task in tasks:
        response = client.post("/api/v1/tasks", json=task, headers=auth_headers)
        task_ids.append(response.json()["id"])
    
    # Test search in title
    response = client.get("/api/v1/tasks/search?q=find", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    found_tasks = response.json()
    assert len(found_tasks) >= 1  # Should find tasks with "find" in title
    
    # Test search in description
    response = client.get("/api/v1/tasks/search?q=important", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert any(task["description"] == "Important task" for task in response.json())
    
    # Test search with no results
    response = client.get("/api/v1/tasks/search?q=nonexistentterm", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 0
    
    # Clean up
    for task_id in task_ids:
        client.delete(f"/api/v1/tasks/{task_id}", headers=auth_headers)

def test_unauthorized_access():
    """Test that unauthorized requests are rejected."""
    # Test endpoints that require authentication
    endpoints = [
        ("GET", "/api/v1/tasks"),
        ("POST", "/api/v1/tasks"),
        ("GET", "/api/v1/tasks/123"),
        ("PUT", "/api/v1/tasks/123"),
        ("DELETE", "/api/v1/tasks/123"),
        ("GET", "/api/v1/tasks/search?q=test"),
    ]
    
    # Test without token
    for method, url in endpoints:
        if method == "GET":
            response = client.get(url)
        elif method == "POST":
            response = client.post(url, json={})
        elif method == "PUT":
            response = client.put(url, json={})
        elif method == "DELETE":
            response = client.delete(url)
            
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    # Test with invalid token
    invalid_headers = {"Authorization": "Bearer invalid_token"}
    for method, url in endpoints:
        if method == "GET":
            response = client.get(url, headers=invalid_headers)
        elif method == "POST":
            response = client.post(url, json={}, headers=invalid_headers)
        elif method == "PUT":
            response = client.put(url, json={}, headers=invalid_headers)
        elif method == "DELETE":
            response = client.delete(url, headers=invalid_headers)
            
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
