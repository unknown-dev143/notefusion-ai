from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.mindmap import MindMap
from app.schemas import mindmap as mindmap_schemas

router = APIRouter()

@router.get("/", response_model=List[mindmap_schemas.MindMap])
async def read_mindmaps(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve mindmaps."""
    query = select(MindMap).where(MindMap.owner_id == current_user.id).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=mindmap_schemas.MindMap)
async def create_mindmap(
    *,
    db: AsyncSession = Depends(get_db),
    mindmap_in: mindmap_schemas.MindMapCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Create new mindmap."""
    mindmap = MindMap(
        **mindmap_in.dict(),
        owner_id=current_user.id
    )
    db.add(mindmap)
    await db.commit()
    await db.refresh(mindmap)
    return mindmap

@router.patch("/{id}", response_model=mindmap_schemas.MindMap)
async def update_mindmap(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    mindmap_in: mindmap_schemas.MindMapUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Update a mindmap."""
    query = select(MindMap).where(MindMap.id == id, MindMap.owner_id == current_user.id)
    result = await db.execute(query)
    mindmap = result.scalar_one_or_none()
    
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")
        
    update_data = mindmap_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mindmap, field, value)
        
    db.add(mindmap)
    await db.commit()
    await db.refresh(mindmap)
    return mindmap

@router.delete("/{id}", response_model=mindmap_schemas.MindMap)
async def delete_mindmap(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Delete a mindmap."""
    query = select(MindMap).where(MindMap.id == id, MindMap.owner_id == current_user.id)
    result = await db.execute(query)
    mindmap = result.scalar_one_or_none()
    
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")
        
    await db.delete(mindmap)
    await db.commit()
    return mindmap
