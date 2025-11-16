# Import Base from our models module
from .base import Base

# Import models to ensure they are registered with SQLAlchemy
from .user import User
from .note import Note

# Initialize SQLAlchemy models
def init_models():
    # This will create all tables if they don't exist
    from database import engine
    Base.metadata.create_all(bind=engine)

__all__ = ["Base", "User", "Note", "init_models"]
