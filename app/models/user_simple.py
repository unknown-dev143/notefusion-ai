from sqlalchemy import Column, Integer, String
from app.core.database import Base


class User(Base):
    __tablename__ = "users_test"
    id = Column(Integer, primary_key=True)
    username = Column(String)


class UserSession(Base):
    __tablename__ = "user_sessions_test"
    id = Column(Integer, primary_key=True)
