from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Presentation(Base):
    """🎥 AI Presentation Persistence Model"""
    __tablename__ = "presentations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    topic = Column(String(255), nullable=True)
    
    # Store all slide data as a JSON blob for flexibility
    # This includes templates, content, and chart configurations
    slides_data = Column(JSON, nullable=False)
    
    theme_id = Column(String(50), default="ocean")
    
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="presentations")
