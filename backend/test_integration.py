"""Integration tests for the NoteFusion AI API."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "version": "1.0.0",
        "environment": "development"
    }

def test_api_docs():
    """Test that the API documentation is available."""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_redoc_docs():
    """Test that the ReDoc documentation is available."""
    response = client.get("/redoc")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_openapi_schema():
    """Test that the OpenAPI schema is available."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]
    assert "openapi" in response.json()

def test_static_files():
    """Test that static files can be served."""
    # Create a test file
    import os
    from pathlib import Path
    
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    test_file = upload_dir / "test.txt"
    test_file.write_text("test content")
    
    try:
        response = client.get("/static/test.txt")
        assert response.status_code == 200
        assert response.text == "test content"
    finally:
        # Clean up
        test_file.unlink()
        if not any(upload_dir.iterdir()):
            upload_dir.rmdir()

if __name__ == "__main__":
    import sys
    import pytest
    sys.exit(pytest.main(["-v", __file__]))
