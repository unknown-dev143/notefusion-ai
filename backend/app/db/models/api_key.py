"""Database models for API keys and usage tracking."""
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ARRAY
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class APIKeyDB(Base):
    """Database model for API keys."""
    __tablename__ = "api_keys"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    key_prefix = Column(String(16), unique=True, index=True, nullable=False)
    hashed_key = Column(String(256), nullable=False)
    name = Column(String(100), nullable=False)
    user_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    scopes = Column(ARRAY(String(50)), default=[], nullable=False)
    rate_limit = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    usages = relationship("APIKeyUsageDB", back_populates="api_key", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<APIKey {self.key_prefix} ({'active' if self.is_active else 'inactive'})>"
    
    @property
    def is_expired(self) -> bool:
        """Check if the API key has expired."""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at


class APIKeyUsageDB(Base):
    """Database model for tracking API key usage."""
    __tablename__ = "api_key_usages"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    api_key_id = Column(PG_UUID(as_uuid=True), ForeignKey("api_keys.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    path = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    status_code = Column(Integer, nullable=False)
    client_ip = Column(String(45), nullable=False)  # IPv6 can be up to 45 chars
    user_agent = Column(Text, nullable=True)
    
    # Relationships
    api_key = relationship("APIKeyDB", back_populates="usages")
    
    def __repr__(self) -> str:
        return f"<APIKeyUsage {self.method} {self.path} ({self.status_code})>"


class RateLimitWindowDB(Base):
    """Database model for tracking rate limit windows."""
    __tablename__ = "rate_limit_windows"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    api_key_id = Column(PG_UUID(as_uuid=True), ForeignKey("api_keys.id", ondelete="CASCADE"), nullable=False)
    window_start = Column(DateTime, nullable=False, index=True)
    request_count = Column(Integer, default=0, nullable=False)
    
    # Composite index on (api_key_id, window_start)
    __table_args__ = (
        {'postgresql_partition_by': 'RANGE (window_start)'},
    )
    
    def __repr__(self) -> str:
        return f"<RateLimitWindow {self.api_key_id} @ {self.window_start}: {self.request_count} requests>"
