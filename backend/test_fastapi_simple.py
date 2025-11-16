from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.testclient import TestClient
import sys
import os
import secrets
import hashlib

# Create a test FastAPI app
app = FastAPI()

# Test data
TEST_SECRET_KEY = "test_secret_key_1234567890"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
def get_password_hash(password: str) -> str:
    """Hash a password using SHA-256 with a random salt."""
    salt = secrets.token_hex(8)
    return f"{salt}${hashlib.sha256((password + salt).encode()).hexdigest()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hashed password."""
    if not hashed_password or '$' not in hashed_password:
        return False
    salt, stored_hash = hashed_password.split('$', 1)
    computed_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
    return secrets.compare_digest(computed_hash, stored_hash)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# In-memory database
fake_users_db = {}

# Models
class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Password hashing functions are now defined above

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, TEST_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Routes
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user_dict = fake_users_db.get(form_data.username)
    if not user_dict:
        print(f"Login failed: User {form_data.username} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = UserInDB(**user_dict)
    password_verified = verify_password(form_data.password, user.hashed_password)
    print(f"Password verified: {password_verified}")
    
    if not password_verified:
        print(f"Login failed: Incorrect password for user {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    print(f"Login successful for user {user.username}")
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, TEST_SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = fake_users_db.get(token_data.username)
    if user is None:
        raise credentials_exception
    return user

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Test client
client = TestClient(app)

def test_register_and_login():
    print("1. Creating test user...")
    # Create a test user
    username = "testuser"
    password = "testpass123"
    hashed_password = get_password_hash(password)
    
    fake_users_db[username] = {
        "username": username,
        "email": "test@example.com",
        "full_name": "Test User",
        "disabled": False,
        "hashed_password": hashed_password
    }
    print(f"   - Created user: {username} with password: {password}")
    print(f"   - Hashed password: {hashed_password}")
    
    # Test login with different variations to find what works
    login_attempts = [
        {"name": "Basic OAuth2 form data", 
         "data": {
            "username": username,
            "password": password,
            "grant_type": "password",
            "scope": "",
            "client_id": "",
            "client_secret": ""
         }},
        {"name": "Simple form data", 
         "data": {
            "username": username,
            "password": password
         }},
        {"name": "JSON data", 
         "data": {
            "username": username,
            "password": password
         },
         "json": True}
    ]
    
    token = None
    
    for attempt in login_attempts:
        print(f"\n2. Testing login attempt: {attempt['name']}")
        print(f"   - Sending request to /token with data: {attempt['data']}")
        
        if attempt.get('json', False):
            response = client.post("/token", json=attempt['data'])
        else:
            response = client.post(
                "/token",
                data=attempt['data'],
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
        
        print(f"   - Response status: {response.status_code}")
        print(f"   - Response content: {response.text}")
        
        if response.status_code == 200:
            try:
                token_data = response.json()
                if "access_token" in token_data:
                    token = token_data["access_token"]
                    print(f"   ✅ Success! Token: {token[:30]}...")
                    break
            except Exception as e:
                print(f"   ❌ Error parsing response: {e}")
        else:
            print(f"   ❌ Failed with status {response.status_code}")
    
    if not token:
        print("\n❌ All login attempts failed")
        return False
    
    # Test protected route
    print("\n3. Testing protected route /users/me")
    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"   - Response status: {response.status_code}")
    print(f"   - Response content: {response.text}")
    
    if response.status_code != 200:
        print(f"   ❌ Failed to access protected route: {response.status_code}")
        return False
    
    user_data = response.json()
    if user_data.get("username") != username:
        print(f"   ❌ Unexpected user data: {user_data}")
        return False
    
    print(f"   ✅ Success! User data: {user_data}")
    return True
    
    return "✅ All tests passed!"

if __name__ == "__main__":
    print("=== Starting Authentication Tests ===\n")
    try:
        result = test_register_and_login()
        print(result)
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
