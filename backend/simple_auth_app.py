from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import timedelta
from typing import Optional

from simple_auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    fake_users_db,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(title="Simple Auth API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    email: str
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(login_data: UserLogin):
    user = authenticate_user(fake_users_db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.get("/")
async def root():
    return {"message": "Welcome to the Simple Auth API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("simple_auth_app:app", host="0.0.0.0", port=8000, reload=True)
