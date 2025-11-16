import sys
import os
from sqlalchemy import create_engine, Column, Integer, String, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Create a test database in memory
SQLALCHEMY_DATABASE_URL = "sqlite:///test_auth.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Create test model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Database tables created")

# Test database connection
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in result]
        print("\nTables in the database:")
        for table in tables:
            print(f"- {table}")
            
        # Check if users table exists
        if "users" in tables:
            print("\n✅ Users table exists")
            
            # Count users
            result = conn.execute(text("SELECT COUNT(*) FROM users;"))
            count = result.scalar()
            print(f"Number of users: {count}")
        else:
            print("\n❌ Users table does not exist")
            
except Exception as e:
    print(f"\n❌ Error accessing database: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
