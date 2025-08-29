"""
Common validation patterns and utilities for Pydantic models.
"""
import re
from typing import Any, TypeVar, Type, Optional, Union, List, Dict
from pydantic import BaseModel, Field, validator, root_validator, constr, conint, confloat
from datetime import datetime, date
import uuid

# Type variables for generic validation
T = TypeVar('T')

# Common regex patterns
USERNAME_PATTERN = r'^[a-zA-Z0-9_\-.]{3,50}$'
PASSWORD_PATTERN = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
SLUG_PATTERN = r'^[a-z0-9]+(?:-[a-z0-9]+)*$'

class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
            uuid.UUID: lambda v: str(v),
        }
        extra = 'forbid'  # Reject extra fields
        validate_assignment = True  # Validate on attribute assignment
        anystr_strip_whitespace = True  # Strip whitespace from strings

class PaginationParams(BaseSchema):
    """Pagination parameters."""
    skip: int = Field(0, ge=0, description="Number of items to skip")
    limit: int = Field(100, ge=1, le=1000, description="Maximum number of items to return")

class SortingParams(BaseSchema):
    """Sorting parameters."""
    sort_by: Optional[str] = Field(None, description="Field to sort by")
    sort_order: str = Field("asc", regex="^(asc|desc)$", description="Sort order (asc or desc)")

class SearchParams(BaseSchema):
    """Search parameters."""
    query: Optional[str] = Field(None, min_length=1, max_length=255, description="Search query")

class TimeRangeParams(BaseSchema):
    """Time range parameters."""
    start_date: Optional[date] = Field(None, description="Start date (inclusive)")
    end_date: Optional[date] = Field(None, description="End date (inclusive)")

    @root_validator
    def validate_date_range(cls, values):
        start_date = values.get('start_date')
        end_date = values.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise ValueError('start_date must be before or equal to end_date')
            
        return values

def validate_enum(enum_class: Type[Any]):
    """Create a validator for enum values."""
    def validator(value: Any) -> Any:
        if not hasattr(enum_class, value.upper()):
            valid_values = [e.name.lower() for e in enum_class]
            raise ValueError(f"Invalid value. Must be one of: {', '.join(valid_values)}")
        return getattr(enum_class, value.upper())
    return validator

def validate_uuid(value: str) -> str:
    """Validate UUID string."""
    try:
        uuid.UUID(value)
        return value
    except ValueError:
        raise ValueError("Invalid UUID format")

def validate_slug(value: str) -> str:
    """Validate URL-friendly slug."""
    if not re.match(SLUG_PATTERN, value):
        raise ValueError("Invalid slug format. Use lowercase letters, numbers, and hyphens.")
    return value

class UsernameMixin:
    """Mixin for username validation."""
    username: str = Field(..., min_length=3, max_length=50, regex=USERNAME_PATTERN)

class EmailMixin:
    """Mixin for email validation."""
    email: str = Field(..., regex=EMAIL_PATTERN)

class PasswordMixin:
    """Mixin for password validation."""
    password: str = Field(..., min_length=8, regex=PASSWORD_PATTERN)

class PaginatedResponse(BaseModel):
    """Generic paginated response schema."""
    items: List[Any]
    total: int
    page: int
    pages: int
    size: int

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
        }
