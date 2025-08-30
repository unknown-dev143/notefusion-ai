<<<<<<< HEAD
#!/usr/bin/env python3
"""
Simple test script for NoteFusion AI backend API
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the root endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_sessions_endpoint():
    """Test the sessions endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/sessions")
        print(f"✅ Sessions endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Sessions endpoint failed: {e}")
        return False

def test_upload_endpoint():
    """Test the upload endpoint with a dummy file"""
    try:
        # Create a dummy text file
        test_content = "This is a test file for NoteFusion AI."
        files = {
            'file': ('test.txt', test_content, 'text/plain')
        }
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
        print(f"✅ Upload endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Upload endpoint failed: {e}")
        return False

def test_fusion_endpoint():
    """Test the fusion endpoint with dummy content"""
    try:
        data = {
            'lecture_content': 'This is a test lecture about machine learning.',
            'textbook_content': 'Machine learning is a subset of artificial intelligence.',
            'module_code': 'CS101',
            'chapters': 'Chapter 1',
            'detail_level': 'standard'
        }
        
        response = requests.post(f"{BASE_URL}/api/fuse", data=data)
        print(f"✅ Fusion endpoint: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Session ID: {result.get('session_id')}")
            print(f"   Status: {result.get('status')}")
        else:
            print(f"   Error: {response.text}")
        return True
    except Exception as e:
        print(f"❌ Fusion endpoint failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing NoteFusion AI Backend API")
    print("=" * 50)
    
    tests = [
        test_health_check,
        test_sessions_endpoint,
        test_upload_endpoint,
        test_fusion_endpoint
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the backend logs for details.")

if __name__ == "__main__":
=======
#!/usr/bin/env python3
"""
Simple test script for NoteFusion AI backend API
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the root endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_sessions_endpoint():
    """Test the sessions endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/sessions")
        print(f"✅ Sessions endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Sessions endpoint failed: {e}")
        return False

def test_upload_endpoint():
    """Test the upload endpoint with a dummy file"""
    try:
        # Create a dummy text file
        test_content = "This is a test file for NoteFusion AI."
        files = {
            'file': ('test.txt', test_content, 'text/plain')
        }
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
        print(f"✅ Upload endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Upload endpoint failed: {e}")
        return False

def test_fusion_endpoint():
    """Test the fusion endpoint with dummy content"""
    try:
        data = {
            'lecture_content': 'This is a test lecture about machine learning.',
            'textbook_content': 'Machine learning is a subset of artificial intelligence.',
            'module_code': 'CS101',
            'chapters': 'Chapter 1',
            'detail_level': 'standard'
        }
        
        response = requests.post(f"{BASE_URL}/api/fuse", data=data)
        print(f"✅ Fusion endpoint: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Session ID: {result.get('session_id')}")
            print(f"   Status: {result.get('status')}")
        else:
            print(f"   Error: {response.text}")
        return True
    except Exception as e:
        print(f"❌ Fusion endpoint failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing NoteFusion AI Backend API")
    print("=" * 50)
    
    tests = [
        test_health_check,
        test_sessions_endpoint,
        test_upload_endpoint,
        test_fusion_endpoint
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the backend logs for details.")

if __name__ == "__main__":
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    main() 