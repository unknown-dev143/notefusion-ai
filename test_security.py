"""Test script for security monitoring system."""
import requests
import time
from datetime import datetime

def test_rate_limiting(base_url):
    """Test rate limiting by making multiple requests."""
    print("\nTesting rate limiting...")
    endpoint = f"{base_url}/api/v1/ai/test/rate-limit"
    
    # Make several requests quickly
    for i in range(1, 6):
        response = requests.get(endpoint)
        print(f"Request {i}: {response.status_code} - {response.text.strip()}")
        if response.status_code == 429:
            print("✅ Rate limiting is working!")
            retry_after = response.headers.get('Retry-After')
            if retry_after:
                print(f"   Please wait {retry_after} seconds before trying again.")
            return
    
    print("⚠️  Rate limiting may not be working as expected")

def test_content_moderation(base_url):
    """Test content moderation with sample content."""
    print("\nTesting content moderation...")
    endpoint = f"{base_url}/api/v1/ai/test/content-moderation"
    
    # Test with potentially harmful content
    test_content = [
        "This is a normal message",
        "I'm feeling very angry and want to hurt someone",
        "This is just a test of the emergency broadcast system"
    ]
    
    for content in test_content:
        response = requests.post(endpoint, json={"content": content})
        print(f"Content: {content[:30]}...")
        print(f"Status: {response.status_code}, Response: {response.text.strip()}")
        if "violation" in response.text.lower():
            print("✅ Content moderation is working!")
        print()

def test_security_headers(base_url):
    """Test if security headers are properly set."""
    print("\nTesting security headers...")
    endpoint = f"{base_url}/api/v1/ai/test/security"
    
    response = requests.get(endpoint)
    security_headers = [
        'Content-Security-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy'
    ]
    
    print(f"Testing endpoint: {endpoint}")
    print(f"Status code: {response.status_code}")
    
    missing_headers = []
    for header in security_headers:
        if header in response.headers:
            print(f"✅ {header}: {response.headers[header]}")
        else:
            missing_headers.append(header)
    
    if missing_headers:
        print("\n⚠️  Missing security headers:")
        for header in missing_headers:
            print(f"   - {header}")
    else:
        print("\n✅ All security headers are present!")

def main():
    """Run all security tests."""
    base_url = "http://localhost:8000"  # Update if your server is running on a different URL
    
    print("🚀 Starting security tests...")
    print(f"Base URL: {base_url}")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Test security headers
        test_security_headers(base_url)
        
        # Test rate limiting
        test_rate_limiting(base_url)
        
        # Test content moderation
        test_content_moderation(base_url)
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error: {e}")
        print("Please make sure the server is running and accessible at", base_url)
    
    print("\n✨ Security tests completed! ✨")

if __name__ == "__main__":
    main()
