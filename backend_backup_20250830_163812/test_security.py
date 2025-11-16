"""Test script to verify AI security features."""
import requests
import time

BASE_URL = "http://localhost:8000"

def test_security_headers():
    """Test security headers are present in responses."""
    print("\n=== Testing Security Headers ===")
    response = requests.get(f"{BASE_URL}/api/v1/ai/test/security")
    
    # Check status code
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Check security headers
    security_headers = [
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy'
    ]
    
    for header in security_headers:
        if header in response.headers:
            print(f"✓ {header}: {response.headers[header]}")
        else:
            print(f"✗ {header}: Missing")

def test_rate_limiting():
    """Test rate limiting functionality."""
    print("\n=== Testing Rate Limiting ===")
    url = f"{BASE_URL}/api/v1/ai/test/rate-limit"
    
    # Make requests up to the limit
    for i in range(1, 32):  # Free tier limit is 30/min
        response = requests.post(url, json={"test": f"Request {i}"})
        print(f"Request {i}: {response.status_code}")
        
        if response.status_code == 429:
            print(f"✓ Rate limited after {i-1} requests")
            print(f"Rate limit headers: {dict((k, v) for k, v in response.headers.items() if k.startswith('X-RateLimit'))}")
            break
    else:
        print("✗ Rate limiting not triggered as expected")

def test_content_moderation():
    """Test content moderation."""
    print("\n=== Testing Content Moderation ===")
    url = f"{BASE_URL}/api/v1/ai/test/content-moderation"
    
    # Test with clean content
    print("\nTesting clean content:")
    response = requests.post(url, json={"text": "This is a test message"})
    print(f"Status: {response.status_code}, Response: {response.json()}")
    
    # Test with potentially harmful content
    print("\nTesting potentially harmful content:")
    response = requests.post(url, json={"text": "I want to kill someone"})
    print(f"Status: {response.status_code}, Response: {response.json()}")

if __name__ == "__main__":
    print("=== Starting AI Security Tests ===\n")
    
    try:
        # Test security headers
        test_security_headers()
        
        # Test rate limiting
        test_rate_limiting()
        
        # Test content moderation
        test_content_moderation()
        
    except Exception as e:
        print(f"\nError during testing: {str(e)}")
    
    print("\n=== Testing Complete ===")
    print("\nNote: Make sure the FastAPI server is running before running these tests.")
    print("You can start it with: cd backend && uvicorn app.main:app --reload")
