"""Tests for AI security middleware."""
import pytest
from fastapi import FastAPI, Request, status
from fastapi.testclient import TestClient
from fastapi.responses import JSONResponse
import json

from app.middleware.ai_security import AISecurityMiddleware, AIRequestValidator
from app.middleware.ai_rate_limiter import AIRateLimiter
from app.middleware.content_moderation import ContentModeration

# Test app for AI security middleware
app = FastAPI()
app.add_middleware(AISecurityMiddleware)
app.add_middleware(ContentModeration)

# Initialize rate limiter for testing
rate_limiter = AIRateLimiter()
app.middleware("http")(rate_limiter)

# Test endpoints
@app.post("/api/v1/ai/test")
async def test_endpoint(request: Request):
    return {"message": "Test successful"}

@app.post("/api/v1/ai/validate")
async def validate_endpoint(request: Request, data: AIRequestValidator):
    return {"message": "Validation successful", "data": data.dict()}

# Test client
client = TestClient(app)

def test_ai_security_middleware():
    """Test AI security middleware."""
    # Test with valid request
    response = client.post("/api/v1/ai/test", json={"text": "Hello, world!"})
    assert response.status_code == 200
    assert response.json() == {"message": "Test successful"}
    
    # Test with sensitive data in request
    response = client.post("/api/v1/ai/test", json={"api_key": "secret123"})
    assert response.status_code == 400
    assert "sensitive data" in response.json()["detail"].lower()

def test_content_moderation():
    """Test content moderation."""
    # Test with clean content
    response = client.post("/api/v1/ai/test", json={"text": "This is a test"})
    assert response.status_code == 200
    
    # Test with violent content
    response = client.post("/api/v1/ai/test", json={"text": "I want to kill someone"})
    assert response.status_code == 400
    assert "content_violation" in response.json()["error"]

def test_ai_request_validation():
    """Test AI request validation."""
    # Test valid request
    response = client.post("/api/v1/ai/validate", json={"text": "Hello"})
    assert response.status_code == 200
    
    # Test invalid temperature
    response = client.post("/api/v1/ai/validate", json={"text": "Hello", "temperature": 3.0})
    assert response.status_code == 422
    
    # Test max tokens exceeded
    response = client.post("/api/v1/ai/validate", json={"text": "Hello", "max_tokens": 5000})
    assert response.status_code == 422

def test_rate_limiting():
    """Test rate limiting."""
    # Reset rate limiter for test
    rate_limiter.request_counts = {}
    
    # Make requests up to the limit
    for _ in range(30):  # Free tier limit
        response = client.post("/api/v1/ai/test", json={"text": "test"})
        
    # Next request should be rate limited
    response = client.post("/api/v1/ai/test", json={"text": "test"})
    assert response.status_code == 429
    assert "rate_limit_exceeded" in response.json()["error"]
    
    # Check rate limit headers
    assert "X-RateLimit-Limit" in response.headers
    assert "X-RateLimit-Remaining" in response.headers
    assert "X-RateLimit-Reset" in response.headers

if __name__ == "__main__":
    pytest.main(["-v", "test_ai_security.py"])
