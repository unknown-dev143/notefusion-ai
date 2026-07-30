from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.presentation import Presentation
from app.schemas import presentation as presentation_schemas

router = APIRouter()

@router.get("/", response_model=List[presentation_schemas.Presentation])
async def read_presentations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve presentations."""
    query = select(Presentation).where(Presentation.owner_id == current_user.id).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=presentation_schemas.Presentation)
async def create_presentation(
    *,
    db: AsyncSession = Depends(get_db),
    presentation_in: presentation_schemas.PresentationCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Create new presentation."""
    presentation = Presentation(
        **presentation_in.dict(),
        owner_id=current_user.id
    )
    db.add(presentation)
    await db.commit()
    await db.refresh(presentation)
    return presentation

@router.get("/{id}", response_model=presentation_schemas.Presentation)
async def read_presentation(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get presentation by ID."""
    query = select(Presentation).where(Presentation.id == id, Presentation.owner_id == current_user.id)
    result = await db.execute(query)
    presentation = result.scalar_one_or_none()
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")
    return presentation

@router.patch("/{id}", response_model=presentation_schemas.Presentation)
async def update_presentation(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    presentation_in: presentation_schemas.PresentationUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Update a presentation."""
    query = select(Presentation).where(Presentation.id == id, Presentation.owner_id == current_user.id)
    result = await db.execute(query)
    presentation = result.scalar_one_or_none()
    
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")
        
    update_data = presentation_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(presentation, field, value)
        
    db.add(presentation)
    await db.commit()
    await db.refresh(presentation)
    return presentation

@router.delete("/{id}")
async def delete_presentation(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Delete a presentation."""
    query = select(Presentation).where(Presentation.id == id, Presentation.owner_id == current_user.id)
    result = await db.execute(query)
    presentation = result.scalar_one_or_none()
    
    if not presentation:
        raise HTTPException(status_code=404, detail="Presentation not found")
        
    await db.delete(presentation)
    await db.commit()
    return {"status": "success"}
