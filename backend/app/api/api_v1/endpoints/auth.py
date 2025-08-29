from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any

from app import crud, models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.utils import (
    generate_password_reset_token,
    send_reset_password_email,
    verify_password_reset_token,
)

router = APIRouter()

@router.post("/login/access-token", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    elif not user.email_verified:
        raise HTTPException(status_code=400, detail="Email not verified")
    
    access_token = security.create_access_token(user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post("/login/test-token", response_model=schemas.User)
def test_token(current_user: models.User = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user

@router.post("/register", response_model=schemas.User)
def register_user(
    user_in: schemas.UserCreate, db: Session = Depends(deps.get_db)
) -> Any:
    """
    Create new user.
    """
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user = crud.user.create(db, obj_in=user_in)
    
    # Send email verification
    if settings.EMAILS_ENABLED and user_in.email:
        verification_token = security.generate_verification_token(user.email)
        # TODO: Send verification email
        
    return user

@router.post("/verify-email/{token}", response_model=schemas.Msg)
def verify_email(
    token: str, db: Session = Depends(deps.get_db)
) -> Any:
    """
    Verify email with token
    """
    email = security.verify_verification_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    user = crud.user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    if user.email_verified:
        return {"msg": "Email already verified"}
    
    user = crud.user.verify_email(db, db_obj=user)
    return {"msg": "Email verified successfully"}

@router.post("/forgot-password", response_model=schemas.Msg)
def forgot_password(
    email_in: str, db: Session = Depends(deps.get_db)
) -> Any:
    """
    Password Recovery
    """
    user = crud.user.get_by_email(db, email=email_in)
    
    if user:
        password_reset_token = generate_password_reset_token(email=email_in)
        # TODO: Send email with password reset token
        
    return {
        "msg": "If this email is registered, you will receive a password reset link."
    }

@router.post("/reset-password/", response_model=schemas.Msg)
def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Reset password
    """
    email = verify_password_reset_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    user = crud.user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    
    user = crud.user.update_password(db, user=user, new_password=new_password)
    return {"msg": "Password updated successfully"}
