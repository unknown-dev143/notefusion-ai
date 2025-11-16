from typing import List, Optional, Dict, Any, Tuple, TypeVar, Type, Generic, Union
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import and_, or_, func, select, update, delete, text
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, NoResultFound, MultipleResultsFound
from datetime import datetime, timedelta
import uuid
import logging
import json
from fastapi import HTTPException, status, Depends
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, ValidationError

from ..core.logging import logger
from ..models.base import BaseModel as Base
from ..models.user import User
from ..schemas.flashcard import FlashcardCreate, FlashcardUpdate, FlashcardReview, PaginatedResponse
from ..core.security import get_password_hash, verify_password

from ..models.flashcard import Flashcard
from ..models.user import User
from ..schemas.flashcard import FlashcardCreate, FlashcardUpdate, FlashcardReview, PaginatedResponse
from ..core.security import get_password_hash, verify_password

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=Base)

class CRUDError(Exception):
    """Base exception for CRUD operations."""
    status_code: int = 400
    
    def __init__(self, message: str, status_code: int = None, **kwargs):
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.extra = kwargs
        super().__init__(message)

class NotFoundError(CRUDError):
    """Raised when a requested resource is not found."""
    status_code = 404
    
class ForbiddenError(CRUDError):
    """Raised when a user doesn't have permission to perform an action."""
    status_code = 403
    
class ValidationError(CRUDError):
    """Raised when input validation fails."""
    status_code = 422

class DatabaseError(CRUDError):
    """Raised for database-related errors."""
    status_code = 500

class CRUDFlashcard:
    def _handle_db_error(self, error: Exception, context: str = None) -> None:
        """Handle database errors and raise appropriate exceptions."""
        context = f" in {context}" if context else ""
        logger.error(f"Database error{context}: {str(error)}", exc_info=True)
        
        if isinstance(error, IntegrityError):
            if "duplicate key" in str(error).lower():
                raise ValidationError("A flashcard with this identifier already exists")
            raise DatabaseError("Database integrity error")
        elif isinstance(error, NoResultFound):
            raise NotFoundError("Requested resource not found")
        elif isinstance(error, MultipleResultsFound):
            raise DatabaseError("Multiple results found when one was expected")
        else:
            raise DatabaseError(f"Database operation failed: {str(error)}")

    async def get(
        self, 
        db: Session, 
        id: str, 
        user_id: Optional[str] = None,
        include_note: bool = False
    ) -> Flashcard:
        """Get a flashcard by ID with optional ownership check.
        
        Args:
            db: Database session
            id: Flashcard ID (UUID string)
            user_id: If provided, verifies the flashcard belongs to this user
            include_note: If True, eager loads the related note
            
        Returns:
            Flashcard: The flashcard if found and accessible
            
        Raises:
            NotFoundError: If the flashcard doesn't exist
            ForbiddenError: If user_id is provided and doesn't match the flashcard's owner
            DatabaseError: For database-related errors
        """
        try:
            # Start building the query
            query = select(Flashcard).where(Flashcard.id == id)
            
            # Add user filter if user_id is provided
            if user_id:
                query = query.where(Flashcard.user_id == user_id)
                
            # Eager load relationships if needed
            if include_note:
                query = query.options(
                    selectinload(Flashcard.note),
                    selectinload(Flashcard.user)
                )
            
            # Execute query
            result = await db.execute(query)
            flashcard = result.scalar_one_or_none()
            
            if not flashcard:
                if user_id:
                    raise ForbiddenError("You don't have permission to access this flashcard")
                raise NotFoundError("Flashcard not found")
                
            # Verify ownership if user_id is provided
            if user_id and str(flashcard.user_id) != user_id:
                raise ForbiddenError("You don't have permission to access this flashcard")
                
            return flashcard
            
        except SQLAlchemyError as e:
            self._handle_db_error(e, "get flashcard")
            
        return result

    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        user_id: Optional[str] = None
    ) -> Tuple[List[Flashcard], int]:
        """Get multiple flashcards with pagination and optional user filter.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            user_id: If provided, only return flashcards for this user
            
        Returns:
            Tuple containing:
                - List of flashcards
                - Total count of matching flashcards
        """
        query = select(Flashcard)
        count_query = select(func.count()).select_from(Flashcard)
        
        if user_id:
            query = query.where(Flashcard.user_id == user_id)
            count_query = count_query.where(Flashcard.user_id == user_id)
            
        total = db.scalar(count_query)
        results = db.execute(
            query.order_by(Flashcard.due_date.asc())
                 .offset(skip)
                 .limit(limit)
                 .options(joinedload(Flashcard.note))
        ).scalars().all()
        
        return results, total

    def get_by_user(
        self, 
        db: Session, 
        user_id: str, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        due_only: bool = False
    ) -> Tuple[List[Flashcard], int]:
        """Get flashcards for a specific user with pagination.
        
        Args:
            db: Database session
            user_id: ID of the user to get flashcards for
            skip: Number of records to skip
            limit: Maximum number of records to return
            due_only: If True, only return cards that are due for review
            
        Returns:
            Tuple containing:
                - List of flashcards
                - Total count of user's flashcards
        """
        query = select(Flashcard).where(Flashcard.user_id == user_id)
        count_query = select(func.count()).where(Flashcard.user_id == user_id)
        
        if due_only:
            now = datetime.utcnow()
            query = query.where(Flashcard.due_date <= now)
            count_query = count_query.where(Flashcard.due_date <= now)
        
        total = db.scalar(count_query)
        results = db.execute(
            query.order_by(Flashcard.due_date.asc())
                 .offset(skip)
                 .limit(limit)
                 .options(joinedload(Flashcard.note))
        ).scalars().all()
        
        return results, total

    def get_due_cards(
        self, 
        db: Session, 
        *, 
        user_id: str, 
        limit: int = 20,
        include_early: bool = False,
        min_interval: int = 0
    ) -> Tuple[List[Flashcard], int]:
        """Get flashcards that are due for review with additional filtering options.
        
        Args:
            db: Database session
            user_id: ID of the user to get due cards for
            limit: Maximum number of cards to return
            include_early: If True, include cards that are not yet due
            min_interval: Minimum interval (in days) for cards to include
            
        Returns:
            Tuple containing:
                - List of due flashcards
                - Total count of due flashcards
        """
        now = datetime.utcnow()
        
        # Base query
        query = select(Flashcard).where(
            Flashcard.user_id == user_id,
            Flashcard.interval >= min_interval
        )
        
        # Filter by due date unless including early reviews
        if not include_early:
            query = query.where(Flashcard.due_date <= now)
        
        # Get total count for pagination
        count_query = select(func.count()).where(
            Flashcard.user_id == user_id,
            Flashcard.interval >= min_interval
        )
        if not include_early:
            count_query = count_query.where(Flashcard.due_date <= now)
            
        total = db.scalar(count_query)
        
        # Get the actual results
        results = db.execute(
            query.order_by(Flashcard.due_date.asc())
                 .limit(limit)
                 .options(joinedload(Flashcard.note))
        ).scalars().all()
        
        return results, total

    def create(
        self, 
        db: Session, 
        *, 
        obj_in: FlashcardCreate, 
        user_id: str
    ) -> Flashcard:
        """Create a new flashcard with validation and error handling.
        
        Args:
            db: Database session
            obj_in: Flashcard creation data
            user_id: ID of the user creating the flashcard
            
        Returns:
            Flashcard: The created flashcard
            
        Raises:
            HTTPException: If validation fails or database error occurs
        """
        try:
            # Check for duplicate flashcard
            existing = db.execute(
                select(Flashcard)
                .where(
                    Flashcard.user_id == user_id,
                    Flashcard.front_text == obj_in.front_text
                )
            ).scalar_one_or_none()
            
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A flashcard with this front text already exists"
                )
            
            # Create the flashcard
            db_obj = Flashcard(
                **obj_in.dict(exclude_unset=True),
                user_id=user_id,
                due_date=datetime.utcnow()  # Set initial due date to now
            )
            
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
            
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database integrity error creating flashcard: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create flashcard due to a database constraint violation"
            )
        except Exception as e:
            db.rollback()
            logger.error(f"Unexpected error creating flashcard: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while creating the flashcard"
            )

    def update(
        self, 
        db: Session, 
        *, 
        db_obj: Flashcard, 
        obj_in: FlashcardUpdate,
        user_id: Optional[str] = None
    ) -> Flashcard:
        """Update a flashcard with validation and error handling.
        
        Args:
            db: Database session
            db_obj: The flashcard to update
            obj_in: Update data
            user_id: Optional user ID for ownership verification
            
        Returns:
            Flashcard: The updated flashcard
            
        Raises:
            ForbiddenError: If user_id is provided and doesn't match the flashcard's owner
            HTTPException: If update fails
        """
        if user_id and db_obj.user_id != user_id:
            raise ForbiddenError("You don't have permission to update this flashcard")
            
        try:
            update_data = obj_in.dict(exclude_unset=True)
            
            # Check for duplicate front text if it's being updated
            if 'front_text' in update_data:
                existing = db.execute(
                    select(Flashcard)
                    .where(
                        Flashcard.user_id == db_obj.user_id,
                        Flashcard.front_text == update_data['front_text'],
                        Flashcard.id != db_obj.id
                    )
                ).scalar_one_or_none()
                
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="A flashcard with this front text already exists"
                    )
            
            # Update the fields
            for field, value in update_data.items():
                setattr(db_obj, field, value)
                
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error updating flashcard: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update flashcard due to a database error"
            )

    def record_review(
        self, db: Session, db_obj: Flashcard, review: FlashcardReview
    ) -> Flashcard:
        """Record a flashcard review and update spaced repetition parameters."""
        # Update flashcard with review data
        db_obj.update_spaced_repetition(quality=review.quality)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: str, user_id: Optional[str] = None) -> bool:
        """Delete a flashcard with ownership check.
        
        Args:
            db: Database session
            id: ID of the flashcard to delete
            user_id: Optional user ID for ownership verification
            
        Returns:
            bool: True if deleted, False if not found
            
        Raises:
            ForbiddenError: If user_id is provided and doesn't match the flashcard's owner
        """
        try:
            stmt = delete(Flashcard).where(Flashcard.id == id)
            if user_id:
                stmt = stmt.where(Flashcard.user_id == user_id)
                
            result = db.execute(stmt)
            db.commit()
            
            if result.rowcount == 0:
                if user_id:
                    # If we got here with a user_id, it means the flashcard exists but belongs to another user
                    raise ForbiddenError("You don't have permission to delete this flashcard")
                return False
                
            return True
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error deleting flashcard: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete flashcard due to a database error"
            )

    def get_stats(
        self, 
        db: Session, 
        *, 
        user_id: str
    ) -> Dict[str, Any]:
        """Get comprehensive flashcard statistics for a user.
        
        Args:
            db: Database session
            user_id: ID of the user to get stats for
            
        Returns:
            Dictionary containing various flashcard statistics
        """
        now = datetime.utcnow()
        one_week_ago = now - timedelta(days=7)
        # Average ease factor (converted back to decimal)
        avg_ease = (
            db.query(func.avg(Flashcard.ease_factor))
            .filter(Flashcard.user_id == user_id)
            .scalar()
        )
        
        return {
            "total_cards": total_cards or 0,
            "due_cards": due_cards or 0,
            "average_ease": round((avg_ease or 250) / 100, 2) if avg_ease else 2.5,
        }


flashcard = CRUDFlashcard()
