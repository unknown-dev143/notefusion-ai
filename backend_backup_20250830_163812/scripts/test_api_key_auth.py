"""
Script to test API key authentication.
This script demonstrates how to use the API key to authenticate requests.
"""
import os
import sys
import asyncio
import aiohttp
import json
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

# Configuration
BASE_URL = "http://localhost:8000"  # Update this if your API is running on a different URL
API_KEY = None  # Will be set from command line or environment variable

# Test endpoints
ENDPOINTS = [
    {"method": "GET", "path": "/api/v1/notes/", "requires_auth": True},
    {"method": "GET", "path": "/api/v1/health", "requires_auth": False},
    {"method": "POST", "path": "/api/v1/notes/", "requires_auth": True, "data": {"title": "Test Note", "content": "This is a test note"}},
]

async def test_endpoint(session, endpoint):
    """Test a single API endpoint."""
    url = f"{BASE_URL}{endpoint['path']}"
    method = endpoint['method'].lower()
    headers = {}
    
    # Add API key to headers if required
    if endpoint.get('requires_auth', True) and API_KEY:
        headers["X-API-Key"] = API_KEY
    
    try:
        # Make the request
        start_time = datetime.now()
        
        if method == 'get':
            async with session.get(url, headers=headers) as response:
                response_data = await response.json()
                status_code = response.status
        elif method == 'post':
            data = endpoint.get('data', {})
            async with session.post(url, json=data, headers=headers) as response:
                response_data = await response.json()
                status_code = response.status
        else:
            return {
                "endpoint": endpoint['path'],
                "method": endpoint['method'],
                "status": "error",
                "error": f"Unsupported method: {endpoint['method']}"
            }
        
        response_time = (datetime.now() - start_time).total_seconds() * 1000  # in ms
        
        # Check rate limit headers
        rate_limit_headers = {}
        for header in ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']:
            if header in response.headers:
                rate_limit_headers[header] = response.headers[header]
        
        return {
            "endpoint": endpoint['path'],
            "method": endpoint['method'],
            "status": "success" if status_code < 400 else "error",
            "status_code": status_code,
            "response_time_ms": round(response_time, 2),
            "rate_limit": rate_limit_headers,
            "response": response_data if status_code < 400 else {"error": response_data.get("detail", "Unknown error")}
        }
        
    except Exception as e:
        return {
            "endpoint": endpoint['path'],
            "method": endpoint['method'],
            "status": "error",
            "error": str(e)
        }

async def run_tests(api_key):
    """Run all test endpoints."""
    global API_KEY
    API_KEY = api_key
    
    print(f"🚀 Starting API key authentication tests with key: {api_key[:10]}...\n")
    
    async with aiohttp.ClientSession() as session:
        tasks = [test_endpoint(session, endpoint) for endpoint in ENDPOINTS]
        results = await asyncio.gather(*tasks)
        
        # Print results
        for result in results:
            status_emoji = "✅" if result['status'] == 'success' else "❌"
            print(f"{status_emoji} {result['method']} {result['endpoint']} - {result['status_code'] if 'status_code' in result else 'ERROR'}")
            
            if 'error' in result:
                print(f"   Error: {result['error']}")
            
            if 'rate_limit' in result and result['rate_limit']:
                print("   Rate Limit:", ", ".join([f"{k}: {v}" for k, v in result['rate_limit'].items()]))
            
            print()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Test API key authentication')
    parser.add_argument('--api-key', type=str, help='API key to use for testing', 
                       default=os.getenv('API_KEY'))
    parser.add_argument('--base-url', type=str, default=BASE_URL,
                       help='Base URL of the API')
    
    args = parser.parse_args()
    
    if not args.api_key:
        print("❌ Error: No API key provided. Please set the API_KEY environment variable or use --api-key")
        print("\nTo get an API key, run:")
        print("   python scripts/create_test_api_key.py")
        print("\nThen run this script with:")
        print(f"   python scripts/test_api_key_auth.py --api-key YOUR_API_KEY")
        sys.exit(1)
    
    BASE_URL = args.base_url.rstrip('/')
    
    asyncio.run(run_tests(args.api_key))
