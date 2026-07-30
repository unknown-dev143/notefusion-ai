from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="todo", index=True)
    priority = Column(String(20), nullable=False, default="medium")
    due_date = Column(String(20), nullable=True)  # ISO date string YYYY-MM-DD
    tags = Column(Text, nullable=True, default="[]")  # JSON-serialised list
    category = Column(String(100), nullable=True)
    reminder_enabled = Column(Boolean, default=False)
    reminder_time = Column(String(50), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    owner = relationship("User", back_populates="tasks")
