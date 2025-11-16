"""
CRUD operations for API keys.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import hashlib
import hmac
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, or_

from app.core.config import settings
from app.models.api_key import APIKeyInDB, APIKeyCreate, APIKeyUpdate, APIKeyUsage
from app.db.session import Base

# This should be in your environment variables
API_KEY_SECRET = settings.SECRET_KEY.get_secret_value()

class CRUDAPIKey:
    """CRUD operations for API keys."""
    
    async def create(
        self, 
        db: AsyncSession, 
        *, 
        obj_in: APIKeyCreate
    ) -> APIKeyInDB:
        """Create a new API key."""
        # Generate a new API key
        key_id = uuid4()
        key_prefix = f"nf_{key_id.hex[:8]}"
        random_part = secrets.token_hex(16)
        full_key = f"{key_prefix}_{random_part}"
        
        # Create a signature
        signature = hmac.new(
            API_KEY_SECRET.encode(),
            full_key.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Hash the full key for storage
        hashed_key = self._hash_key(full_key)
        
        # Create the API key in the database
        db_obj = APIKeyInDB(
            id=key_id,
            key_prefix=key_prefix,
            hashed_key=hashed_key,
            **obj_in.dict(exclude_unset=True)
        )
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Return the full key only once
        return APIKeyResponse(
            **db_obj.dict(),
            key=f"{full_key}.{signature}"
        )
    
    async def get(self, db: AsyncSession, id: UUID) -> Optional[APIKeyInDB]:
        """Get an API key by ID."""
        result = await db.execute(
            select(APIKeyInDB).where(APIKeyInDB.id == id)
        )
        return result.scalars().first()
    
    async def get_by_key(
        self, 
        db: AsyncSession, 
        *, 
        key_part: str
    ) -> Optional[APIKeyInDB]:
        """Get an API key by its prefix."""
        result = await db.execute(
            select(APIKeyInDB).where(APIKeyInDB.key_prefix == key_part)
        )
        return result.scalars().first()
    
    async def get_multi(
        self, 
        db: AsyncSession, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        user_id: Optional[UUID] = None,
        is_active: Optional[bool] = None
    ) -> List[APIKeyInDB]:
        """Get multiple API keys with optional filtering."""
        query = select(APIKeyInDB)
        
        if user_id is not None:
            query = query.where(APIKeyInDB.user_id == user_id)
            
        if is_active is not None:
            query = query.where(APIKeyInDB.is_active == is_active)
            
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def update(
        self, 
        db: AsyncSession, 
        *, 
        db_obj: APIKeyInDB, 
        obj_in: APIKeyUpdate
    ) -> APIKeyInDB:
        """Update an API key."""
        update_data = obj_in.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def delete(self, db: AsyncSession, *, id: UUID) -> bool:
        """Delete an API key."""
        result = await db.execute(
            delete(APIKeyInDB).where(APIKeyInDB.id == id)
        )
        await db.commit()
        return result.rowcount > 0
    
    async def deactivate(self, db: AsyncSession, *, id: UUID) -> bool:
        """Deactivate an API key."""
        result = await db.execute(
            update(APIKeyInDB)
            .where(APIKeyInDB.id == id)
            .values(is_active=False)
        )
        await db.commit()
        return result.rowcount > 0
    
    async def record_usage(
        self, 
        db: AsyncSession, 
        *, 
        api_key_id: UUID,
        path: str,
        method: str,
        status_code: int,
        client_ip: str,
        user_agent: Optional[str] = None
    ) -> None:
        """Record API key usage."""
        usage = APIKeyUsage(
            api_key_id=api_key_id,
            path=path,
            method=method,
            status_code=status_code,
            client_ip=client_ip,
            user_agent=user_agent
        )
        
        # Update last_used_at on the API key
        await db.execute(
            update(APIKeyInDB)
            .where(APIKeyInDB.id == api_key_id)
            .values(last_used_at=datetime.utcnow())
        )
        
        db.add(usage)
        await db.commit()
    
    def _hash_key(self, key: str) -> str:
        """Hash an API key for storage."""
        return hashlib.sha256(
            f"{key}{API_KEY_SECRET}".encode()
        ).hexdigest()
    
    def verify_key(self, key: str, hashed_key: str) -> bool:
        """Verify an API key against its hash."""
        return hmac.compare_digest(
            self._hash_key(key),
            hashed_key
        )

# Create a singleton instance
crud_api_key = CRUDAPIKey()
