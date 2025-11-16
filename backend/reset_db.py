import os
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

# Database setup
DATABASE_URL = "sqlite:///./notefusion_new.db"
if os.path.exists("notefusion_new.db"):
    os.remove("notefusion_new.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import models after creating engine
from app.models import Base

# Check if tables exist
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Existing tables: {tables}")

# Create all tables
Base.metadata.create_all(bind=engine)
print("Database created successfully at notefusion_new.db")

# Verify tables were created
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tables after creation: {tables}")
