import os
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal, Base
from app.models.user import User
from app.core.security import get_password_hash
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def init_db() -> None:
    """Initialize the database with required tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if any user exists
        user = db.query(User).first()
        if not user:
            print("Creating initial admin user...")
            admin_user = User(
                email=os.getenv("ADMIN_EMAIL", "admin@example.com"),
                username="admin",
                hashed_password=get_password_hash(os.getenv("ADMIN_PASSWORD", "admin123")),
                is_superuser=True,
                is_active=True,
                full_name="Admin User"
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully!")
        else:
            print("Database already contains users.")
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialization complete!")
