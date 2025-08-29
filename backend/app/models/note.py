from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    is_pinned = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    tags = Column(JSON, default=list)
    metadata = Column(JSON, default=dict)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_edited_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notes", foreign_keys=[user_id])
    folder = relationship("Folder", back_populates="notes")
    attachments = relationship("Attachment", back_populates="note", cascade="all, delete-orphan")
<<<<<<< HEAD
    flashcards = relationship("Flashcard", back_populates="note", cascade="all, delete-orphan")
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    editor = relationship("User", foreign_keys=[last_edited_by], uselist=False)
    
    def __repr__(self):
        return f"<Note {self.title} (ID: {self.id})>"


class Attachment(Base):
    __tablename__ = "attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_url = Column(String(512), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    note = relationship("Note", back_populates="attachments")
    
    @property
    def size_in_mb(self) -> float:
        return round(self.file_size / (1024 * 1024), 2)
    
    @property
    def is_image(self) -> bool:
        return self.file_type.startswith("image/")
    
    @property
    def is_pdf(self) -> bool:
        return self.file_type == "application/pdf"
    
    def __repr__(self):
        return f"<Attachment {self.filename} (ID: {self.id})>"


class Folder(Base):
    __tablename__ = "folders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="folders")
    parent = relationship("Folder", remote_side=[id], back_populates="subfolders")
    subfolders = relationship("Folder", back_populates="parent")
    notes = relationship("Note", back_populates="folder")
    
    def __repr__(self):
        return f"<Folder {self.name} (ID: {self.id})>"
