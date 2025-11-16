"""
Simple tests for the task management API endpoints.
"""
import pytest
from fastapi import status
from datetime import datetime, timedelta

# Test task data
TEST_TASK = {
    "title": "Test Task",
    "description": "This is a test task",
    "status": "pending",
    "priority": "medium",
    "category": "work",
    "tags": ["test", "important"]
}

@pytest.mark.asyncio
async def test_create_task(client, auth_headers):
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

@pytest.mark.asyncio
async def test_get_task(client, auth_headers, test_task):
    """Test retrieving a task by ID."""
    # Test get
    response = client.get(f"/api/v1/tasks/{test_task.id}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Verify response data
    assert data["id"] == str(test_task.id)
    assert data["title"] == test_task.title
    assert data["description"] == test_task.description
    
    # Test non-existent task
    response = client.get("/api/v1/tasks/00000000-0000-0000-0000-000000000000", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_update_task(client, auth_headers, test_task):
    """Test updating a task."""
    # Test partial update
    update_data = {
        "description": "Updated description", 
        "status": "in_progress",
        "priority": "high"
    }
    response = client.put(
        f"/api/v1/tasks/{test_task.id}", 
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
    assert data["title"] == test_task.title
    assert data["category"] == test_task.category
    
    # Test update with invalid status
    invalid_update = {"status": "invalid_status"}
    response = client.put(
        f"/api/v1/tasks/{test_task.id}",
        json=invalid_update,
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

@pytest.mark.asyncio
async def test_delete_task(client, auth_headers, test_task):
    """Test deleting a task."""
    # Test delete
    response = client.delete(f"/api/v1/tasks/{test_task.id}", headers=auth_headers)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify task is deleted
    response = client.get(f"/api/v1/tasks/{test_task.id}", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_list_tasks(client, auth_headers, test_task):
    """Test listing tasks."""
    # Test get all tasks
    response = client.get("/api/v1/tasks", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    tasks = response.json()
    assert isinstance(tasks, list)
    assert len(tasks) > 0
    
    # Test filtering by status
    response = client.get(f"/api/v1/tasks?status={test_task.status}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    filtered_tasks = response.json()
    assert all(task["status"] == test_task.status for task in filtered_tasks)

@pytest.mark.asyncio
async def test_unauthorized_access(client, unauthorized_headers):
    """Test that unauthorized requests are rejected."""
    # Test endpoints that require authentication
    endpoints = [
        ("GET", "/api/v1/tasks"),
        ("POST", "/api/v1/tasks"),
        ("GET", "/api/v1/tasks/123"),
        ("PUT", "/api/v1/tasks/123"),
        ("DELETE", "/api/v1/tasks/123"),
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
    for method, url in endpoints:
        if method == "GET":
            response = client.get(url, headers=unauthorized_headers)
        elif method == "POST":
            response = client.post(url, json={}, headers=unauthorized_headers)
        elif method == "PUT":
            response = client.put(url, json={}, headers=unauthorized_headers)
        elif method == "DELETE":
            response = client.delete(url, headers=unauthorized_headers)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
