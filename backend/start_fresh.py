import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Create a fresh SQLite database file
DATABASE_URL = "sqlite:///./fresh_notefusion.db"
if os.path.exists("fresh_notefusion.db"):
    os.remove("fresh_notefusion.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import models after creating engine
from app.models import Base

# Create all tables
Base.metadata.create_all(bind=engine)
print("Database created successfully at fresh_notefusion.db")
