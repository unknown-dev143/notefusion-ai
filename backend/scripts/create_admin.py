#!/usr/bin/env python3
"""
Script to create an admin user in the database.

Usage:
    python -m scripts.create_admin <email> <password> [full_name]
"""
import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = str(Path(__file__).parent.parent)
sys.path.insert(0, project_root)

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin(email: str, password: str, full_name: str = "Admin User") -> bool:
    """
    Create an admin user in the database.
    
    Args:
        email: Admin email address
        password: Admin password (will be hashed)
        full_name: Optional full name (default: "Admin User")
        
    Returns:
        bool: True if admin was created successfully, False otherwise
    """
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == email).first()
        if admin:
            print(f"[INFO] User with email {email} already exists")
            return False
            
        # Create new admin user
        admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            is_superuser=True,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print(f"[SUCCESS] Admin user {email} created successfully")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to create admin user: {str(e)}", file=sys.stderr)
        return False
        
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Error: Missing required arguments", file=sys.stderr)
        print("Usage: python -m scripts.create_admin <email> <password> [full_name]", file=sys.stderr)
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    full_name = sys.argv[3] if len(sys.argv) > 3 else "Admin User"
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv(os.path.join(project_root, '.env'))
    
    success = create_admin(email, password, full_name)
    sys.exit(0 if success else 1)
