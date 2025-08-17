from typing import Any, Dict, Optional, Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserUpdate

def get_user(db: Session, user_id: int) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(UserModel.email == email).first()

def get_user_by_verification_token(db: Session, token: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(
        UserModel.verification_token == token,
        UserModel.verification_token_expires > datetime.utcnow()
    ).first()

def get_user_by_reset_token(db: Session, token: str) -> Optional[UserModel]:
    return db.query(UserModel).filter(
        UserModel.password_reset_token == token,
        UserModel.password_reset_expires > datetime.utcnow()
    ).first()

def create_user(db: Session, obj_in: UserCreate) -> UserModel:
    db_obj = UserModel(
        email=obj_in.email,
        hashed_password=get_password_hash(obj_in.password),
        full_name=obj_in.full_name,
        is_active=True,
        email_verified=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_user(
    db: Session, db_obj: UserModel, obj_in: Union[UserUpdate, Dict[str, Any]]
) -> UserModel:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    if 'password' in update_data and update_data['password']:
        hashed_password = get_password_hash(update_data['password'])
        del update_data['password']
        update_data['hashed_password'] = hashed_password
    
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    
    db_obj.updated_at = datetime.utcnow()
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_password(
    db: Session, user: UserModel, new_password: str
) -> UserModel:
    user.hashed_password = get_password_hash(new_password)
    user.updated_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def verify_email(db: Session, user: UserModel) -> UserModel:
    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    user.updated_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def set_verification_token(
    db: Session, user: UserModel, token: str, expires_in: int = 3600
) -> UserModel:
    user.verification_token = token
    user.verification_token_expires = datetime.utcnow() + timedelta(seconds=expires_in)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def set_password_reset_token(
    db: Session, user: UserModel, token: str, expires_in: int = 3600
) -> UserModel:
    user.password_reset_token = token
    user.password_reset_expires = datetime.utcnow() + timedelta(seconds=expires_in)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate(
    db: Session, email: str, password: str
) -> Optional[UserModel]:
    user = get_user_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def update_last_login(db: Session, user: UserModel) -> UserModel:
    user.last_login = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def set_refresh_token(
    db: Session, user: UserModel, refresh_token: str, expires_in: int = 2592000
) -> UserModel:
    user.refresh_token = refresh_token
    user.refresh_token_expires = datetime.utcnow() + timedelta(seconds=expires_in)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def revoke_refresh_token(db: Session, user: UserModel) -> UserModel:
    user.refresh_token = None
    user.refresh_token_expires = None
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
