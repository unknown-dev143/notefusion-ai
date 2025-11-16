import sys
import getpass
from sqlalchemy.orm import Session
import database, models, schemas, auth
from config import settings

def init_db():
    # Create database tables
    models.Base.metadata.create_all(bind=database.engine)
    print("✅ Database tables created")

def create_admin_user():
    db = database.SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
        if admin:
            print("ℹ️ Admin user already exists")
            return

        # Get admin details
        print("\n👤 Create Admin User")
        print("-------------------")
        email = input("Email [admin@example.com]: ") or "admin@example.com"
        username = input("Username [admin]: ") or "admin"
        
        while True:
            password = getpass.getpass("Password: ")
            if not password:
                print("❌ Password cannot be empty")
                continue
                
            confirm_password = getpass.getpass("Confirm password: ")
            if password != confirm_password:
                print("❌ Passwords do not match")
                continue
            break
        
        # Create admin user
        hashed_password = auth.get_password_hash(password)
        admin = models.User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            is_active=True,
            is_admin=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("\n✅ Admin user created successfully!")
        print(f"   Email: {email}")
        print(f"   Username: {username}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    try:
        print("🚀 Initializing NoteFusion Database...")
        init_db()
        create_admin_user()
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")
        sys.exit(1)
