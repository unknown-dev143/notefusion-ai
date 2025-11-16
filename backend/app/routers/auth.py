from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.user import User
from app.schemas import user as schemas
from app.core import security
from database import get_db
from config import settings
from app.schemas.user import TokenData

router = APIRouter()

def get_user(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    if not user or not security.verify_password(password, user.hashed_password):
        return False
    return user

@router.post("/register", response_model=schemas.UserInDB)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("\n=== Registration Attempt ===")
        logger.info(f"Email: {user.email}")
        logger.info(f"Full Name: {user.full_name}")
        
        # Check if user already exists
        logger.info("Checking if user exists...")
        db_user = get_user(db, email=user.email)
        if db_user:
            logger.warning(f"User with email {user.email} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        logger.info("Hashing password...")
        hashed_password = security.get_password_hash(user.password)
        
        # Create new user
        logger.info("Creating user object...")
        db_user = User(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
            is_active=True
        )
        logger.info(f"User data: {db_user.__dict__}")
        
        # Add to database
        logger.info("Adding user to database...")
        db.add(db_user)
        logger.info("Committing transaction...")
        db.commit()
        logger.info("Refreshing user object...")
        db.refresh(db_user)
        logger.info(f"User created successfully! ID: {db_user.id}")
        
        # Return the created user (without password hash)
        return db_user
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the full error with traceback
        import traceback
        import sys
        
        # Get the full traceback
        exc_type, exc_value, exc_traceback = sys.exc_info()
        error_traceback = ''.join(traceback.format_exception(exc_type, exc_value, exc_traceback))
        
        print("\n" + "="*80)
        print("!!! REGISTRATION ERROR !!!")
        print("="*80)
        print(f"Error Type: {type(e).__name__}")
        print(f"Error: {str(e)}")
        print("\nFull Traceback:")
        print(error_traceback)
        
        # Log database state
        print("\nDatabase State:")
        try:
            # Check database connection
            db.execute(text("SELECT 1"))
            print("- Database connection: OK")
            
            # Check if users table exists and its structure
            result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='users'"))
            users_table_exists = bool(result.fetchone())
            print(f"- Users table exists: {users_table_exists}")
            
            if users_table_exists:
                # Get users table columns
                result = db.execute(text("PRAGMA table_info(users)"))
                columns = [row[1] for row in result.fetchall()]
                print(f"- Users table columns: {', '.join(columns)}")
            
            # Log the current user being registered
            print("\nRegistration Data:")
            print(f"- Email: {getattr(user, 'email', 'N/A')}")
            print(f"- Full Name: {getattr(user, 'full_name', 'N/A')}")
            print(f"- Password provided: {'Yes' if hasattr(user, 'password') and user.password else 'No'}")
            
        except Exception as db_err:
            print(f"Error checking database state: {db_err}")
            import traceback
            print("Database check traceback:")
            print(traceback.format_exc())
        
        # Log to file for persistent storage
        log_entry = f"""
{'='*80}
[ERROR] {datetime.utcnow().isoformat()}
{'='*80}
Error Type: {type(e).__name__}
Error: {str(e)}

Traceback:
{error_traceback}

Database State:
- Users table exists: {users_table_exists if 'users_table_exists' in locals() else 'N/A'}
- Users table columns: {', '.join(columns) if 'columns' in locals() else 'N/A'}

Registration Data:
- Email: {getattr(user, 'email', 'N/A')}
- Full Name: {getattr(user, 'full_name', 'N/A')}
{'='*80}
"""
        
        try:
            with open("registration_errors.log", "a", encoding='utf-8') as f:
                f.write(log_entry)
        except Exception as log_err:
            print(f"Failed to write to error log: {log_err}")
        
        # Re-raise with a clean error message
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration. Please try again later."
        ) from e

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
