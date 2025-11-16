import sqlite3
import hashlib
import jwt
from datetime import datetime, timedelta

def test_authentication():
    print("=== Testing Authentication Flow ===\n")
    
    # Connect to the SQLite database
    conn = sqlite3.connect('notefusion.db')
    cursor = conn.cursor()
    
    try:
        # 1. Check if the test user exists
        print("1. Checking test user in database...")
        cursor.execute("SELECT * FROM users WHERE email = ?", ("test@example.com",))
        user = cursor.fetchone()
        
        if user:
            print(f"   ✅ Test user found in database (ID: {user[0]}, Email: {user[1]})")
            
            # 2. Simulate login (verify password)
            print("\n2. Simulating login...")
            stored_password = user[3]  # hashed_password field
            # Password verification using SHA-256 (matches updated direct_db_init.py)
            import hashlib
            password = "testpass123"
            # Using SHA-256 for consistent hashing across different Python processes
            expected_hash = hashlib.sha256(password.encode()).hexdigest()
            # For debugging: print both hashes
            print(f"   Password length: {len(password)}")
            print(f"   Stored hash: {stored_password}")
            print(f"   Expected hash: {expected_hash}")
            
            if stored_password == expected_hash:
                print("   ✅ Password verification successful")
                
                # 3. Generate JWT token
                print("\n3. Generating JWT token...")
                secret_key = "test-secret-key-1234567890"
                algorithm = "HS256"
                
                token_data = {
                    "sub": user[1],  # email
                    "user_id": user[0],
                    "exp": datetime.utcnow() + timedelta(minutes=30)
                }
                
                token = jwt.encode(token_data, secret_key, algorithm=algorithm)
                print(f"   ✅ Token generated: {token[:50]}...")
                
                # 4. Verify token
                print("\n4. Verifying JWT token...")
                try:
                    payload = jwt.decode(token, secret_key, algorithms=[algorithm])
                    print(f"   ✅ Token verified. User email: {payload['sub']}")
                    print("\n🎉 Authentication flow test completed successfully!")
                except Exception as e:
                    print(f"   ❌ Token verification failed: {e}")
            else:
                print(f"   ❌ Password verification failed")
        else:
            print("   ❌ Test user not found in database")
            
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    test_authentication()
