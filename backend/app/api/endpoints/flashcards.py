from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import logging

from .... import crud, schemas
from ....core.database import get_db, get_async_db, AsyncSession
from ....core.security import get_current_active_user, get_current_user
from ....models.user import User
from ....core.exceptions import (
    NotFoundError,
    ForbiddenError,
    DatabaseError,
    ValidationError as AppValidationError
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/flashcards", tags=["flashcards"])

router = APIRouter()

@router.post(
    "/",
    response_model=schemas.FlashcardResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Flashcard created successfully"},
        400: {"description": "Invalid input data"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)
async def create_flashcard(
    flashcard: schemas.FlashcardCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
) -> schemas.FlashcardResponse:
    """
    Create a new flashcard.
    
    - **front_text**: The front side text (question/term)
    - **back_text**: The back side text (answer/definition)
    - **tags**: List of tags for organization
    - **ease_factor**: Ease factor for spaced repetition (default: 2.5)
    - **interval**: Initial interval in days (default: 1)
    
    Returns the created flashcard with all fields populated.
    """
    try:
        return await crud.flashcard.create(
            db=db,
            obj_in=flashcard,
            user_id=str(current_user.id)
        )
    except SQLAlchemyError as e:
        logger.error(f"Database error creating flashcard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating flashcard"
        )
    except Exception as e:
        logger.error(f"Unexpected error creating flashcard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.post(
    "/batch",
    response_model=List[schemas.FlashcardResponse],
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Flashcards created successfully"},
        400: {"description": "Invalid input data or batch size exceeded"},
        401: {"description": "Not authenticated"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)
async def create_flashcards_batch(
    batch: schemas.FlashcardBatch,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
) -> List[schemas.FlashcardResponse]:
    """
    Create multiple flashcards in a single batch.
    
    - **flashcards**: List of flashcards to create (max 100)
    - **default_tags**: Tags to apply to all flashcards in the batch
    
    Returns list of created flashcards with all fields populated.
    """
    try:
        created = []
        async with db.begin():
            for flashcard in batch.flashcards:
                # Apply default tags if any
                if batch.default_tags:
                    flashcard.tags = list(set(flashcard.tags + batch.default_tags))
                
                created_flashcard = await crud.flashcard.create(
                    db=db,
                    obj_in=flashcard,
                    user_id=str(current_user.id)
                )
                created.append(created_flashcard)
            
            await db.commit()
            
        return created
        
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error(f"Database error in batch create: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating flashcards"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in batch create: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.get(
    "/{flashcard_id}",
    response_model=schemas.FlashcardResponse,
    responses={
        200: {"description": "Flashcard retrieved successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized to access this flashcard"},
        404: {"description": "Flashcard not found"}
    }
)
async def read_flashcard(
    flashcard_id: str = Path(..., description="The ID of the flashcard to retrieve"),
    include_note: bool = Query(False, description="Include the full note data"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> schemas.FlashcardResponse:
    """
    Get a specific flashcard by ID.
    
    - **flashcard_id**: The UUID of the flashcard to retrieve
    - **include_note**: If true, includes the full note data (default: false)
    
    Returns the flashcard with the specified ID if the user has access to it.
    """
    try:
        flashcard = await crud.flashcard.get(
            db=db,
            id=flashcard_id,
            user_id=str(current_user.id),
            include_note=include_note
        )
        return flashcard
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    except ForbiddenError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this flashcard"
        )
    except Exception as e:
        logger.error(f"Error retrieving flashcard {flashcard_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the flashcard"
        )

@router.get(
    "/",
    response_model=List[schemas.FlashcardResponse],
    responses={
        200: {"description": "List of flashcards retrieved successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized"},
        422: {"description": "Validation error"}
    }
)
async def read_flashcards(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    due_only: bool = Query(False, description="Only return due flashcards"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> List[schemas.FlashcardResponse]:
    """
    Retrieve a paginated list of flashcards with optional filtering.
    
    - **skip**: Number of items to skip (pagination)
    - **limit**: Maximum number of items to return (1-1000)
    - **tags**: Filter by tags (comma-separated)
    - **due_only**: Only return flashcards that are due for review
    
    Returns a list of flashcards that match the criteria.
    """
    try:
        return await crud.flashcard.get_multi(
            db=db,
            skip=skip,
            limit=limit,
            user_id=str(current_user.id),
            tags=tags,
            due_only=due_only
        )
    except Exception as e:
        logger.error(f"Error retrieving flashcards: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving flashcards"
        )

@router.get(
    "/due/",
    response_model=List[schemas.FlashcardResponse],
    responses={
        200: {"description": "List of due flashcards retrieved successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized"}
    }
)
async def get_due_flashcards(
    limit: int = Query(20, ge=1, le=100, description="Maximum number of due cards to return"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> List[schemas.FlashcardResponse]:
    """
    Get flashcards that are due for review.
    
    - **limit**: Maximum number of due cards to return (1-100)
    
    Returns a list of flashcards that are due for review, ordered by due date.
    """
    try:
        return await crud.flashcard.get_due_cards(
            db=db,
            user_id=str(current_user.id),
            limit=limit
        )
    except Exception as e:
        logger.error(f"Error retrieving due flashcards: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving due flashcards"
        )

@router.put(
    "/{flashcard_id}",
    response_model=schemas.FlashcardResponse,
    responses={
        200: {"description": "Flashcard updated successfully"},
        400: {"description": "Invalid input data"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized to update this flashcard"},
        404: {"description": "Flashcard not found"},
        422: {"description": "Validation error"}
    }
)
async def update_flashcard(
    flashcard_id: str = Path(..., description="The ID of the flashcard to update"),
    flashcard_in: schemas.FlashcardUpdate = Body(..., description="The updated flashcard data"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> schemas.FlashcardResponse:
    """
    Update a flashcard.
    
    - **flashcard_id**: The ID of the flashcard to update
    - **flashcard_in**: The updated flashcard data
    
    Returns the updated flashcard.
    """
    try:
        # First get the flashcard to check ownership
        flashcard = await crud.flashcard.get(
            db=db,
            id=flashcard_id,
            user_id=str(current_user.id)
        )
        
        # Update the flashcard
        return await crud.flashcard.update(
            db=db,
            db_obj=flashcard,
            obj_in=flashcard_in
        )
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    except ForbiddenError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this flashcard"
        )
    except Exception as e:
        logger.error(f"Error updating flashcard {flashcard_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the flashcard"
        )

@router.post(
    "/{flashcard_id}/review",
    response_model=schemas.FlashcardResponse,
    responses={
        200: {"description": "Flashcard reviewed successfully"},
        400: {"description": "Invalid review data"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized to review this flashcard"},
        404: {"description": "Flashcard not found"},
        422: {"description": "Validation error"}
    }
)
async def review_flashcard(
    flashcard_id: str = Path(..., description="The ID of the flashcard to review"),
    review: schemas.FlashcardReview = Body(..., description="The review data"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> schemas.FlashcardResponse:
    """
    Record a flashcard review and update its spaced repetition parameters.
    
    - **flashcard_id**: The ID of the flashcard to review
    - **quality**: Rating of how well the card was known (0-5)
    
    Updates the flashcard's ease factor, interval, and due date based on the SM-2 algorithm.
    Returns the updated flashcard.
    """
    try:
        # First get the flashcard to check ownership
        flashcard = await crud.flashcard.get(
            db=db,
            id=flashcard_id,
            user_id=str(current_user.id)
        )
        
        # Record the review
        return await crud.flashcard.review_card(
            db=db,
            db_obj=flashcard,
            quality=review.quality
        )
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    except ForbiddenError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to review this flashcard"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error reviewing flashcard {flashcard_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while recording the review"
        )

@router.delete(
    "/{flashcard_id}",
    response_model=schemas.FlashcardResponse,
    responses={
        200: {"description": "Flashcard deleted successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized to delete this flashcard"},
        404: {"description": "Flashcard not found"}
    }
)
async def delete_flashcard(
    flashcard_id: str = Path(..., description="The ID of the flashcard to delete"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> schemas.FlashcardResponse:
    """
    Delete a flashcard.
    
    - **flashcard_id**: The ID of the flashcard to delete
    
    Returns the deleted flashcard.
    """
    try:
        # First get the flashcard to check ownership
        flashcard = await crud.flashcard.get(
            db=db,
            id=flashcard_id,
            user_id=str(current_user.id)
        )
        
        # Delete the flashcard
        return await crud.flashcard.remove(
            db=db,
            id=flashcard_id
        )
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    except ForbiddenError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this flashcard"
        )
    except Exception as e:
        logger.error(f"Error deleting flashcard {flashcard_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the flashcard"
        )

@router.get(
    "/stats/",
    response_model=schemas.FlashcardStats,
    responses={
        200: {"description": "Flashcard statistics retrieved successfully"},
        401: {"description": "Not authenticated"}
    }
)
async def get_flashcard_stats(
    time_range: str = Query("all", description="Time range for statistics (day, week, month, year, all)"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user),
) -> schemas.FlashcardStats:
    """
    Get flashcard statistics for the current user.
    
    - **time_range**: Time range for statistics (day, week, month, year, all)
    
    Returns statistics including total cards, due cards, and review history.
    """
    try:
        # Validate time_range
        valid_ranges = ["day", "week", "month", "year", "all"]
        if time_range not in valid_ranges:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid time_range. Must be one of: {', '.join(valid_ranges)}"
            )
            
        return await crud.flashcard.get_stats(
            db=db,
            user_id=str(current_user.id),
            time_range=time_range
        )
        
    except Exception as e:
        logger.error(f"Error retrieving flashcard stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving flashcard statistics"
        )
