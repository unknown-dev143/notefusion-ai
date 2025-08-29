"""Custom exceptions and exception handlers for the application."""
from typing import Any, Dict, Optional, Union

from fastapi import HTTPException, status
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field
from starlette.requests import Request
from starlette.responses import JSONResponse

class ErrorResponse(BaseModel):
    """Standard error response model."""
    success: bool = Field(False, description="Indicates if the request was successful")
    error: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code for programmatic handling")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


class AppException(Exception):
    """Base exception for application-specific exceptions."""
    
    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error: str = "An unexpected error occurred",
        error_code: str = "internal_server_error",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.status_code = status_code
        self.error = error
        self.error_code = error_code
        self.details = details or {}
        super().__init__(error)


class NotFoundException(AppException):
    """Raised when a requested resource is not found."""
    
    def __init__(self, resource: str, identifier: Any, **kwargs):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            error=f"{resource} not found",
            error_code=f"{resource.lower()}_not_found",
            details={"id": identifier, **kwargs}
        )


class UnauthorizedException(AppException):
    """Raised when authentication is required and has failed or has not been provided."""
    
    def __init__(self, error: str = "Not authenticated", **kwargs):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error=error,
            error_code="unauthorized",
            details=kwargs
        )


class ForbiddenException(AppException):
    """Raised when a user doesn't have permission to access a resource."""
    
    def __init__(self, error: str = "Insufficient permissions", **kwargs):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error=error,
            error_code="forbidden",
            details=kwargs
        )


class BadRequestException(AppException):
    """Raised when the request is malformed or contains invalid data."""
    
    def __init__(self, error: str = "Invalid request", **kwargs):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error=error,
            error_code="bad_request",
            details=kwargs
        )


class ConflictException(AppException):
    """Raised when a resource conflict occurs (e.g., duplicate entry)."""
    
    def __init__(self, error: str = "Resource already exists", **kwargs):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            error=error,
            error_code="conflict",
            details=kwargs
        )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions with a standardized error response."""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            error_code=getattr(exc, "error_code", "http_error"),
            details=getattr(exc, "details", None)
        ).dict()
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle validation errors with a standardized error response."""
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"][1:])  # Skip the 'body' prefix
        errors.append({
            "field": field,
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="Validation error",
            error_code="validation_error",
            details={"errors": errors}
        ).dict()
    )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle application-specific exceptions with a standardized error response."""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.error,
            error_code=exc.error_code,
            details=exc.details
        ).dict()
    )


def register_exception_handlers(app) -> None:
    """Register all exception handlers with the FastAPI application."""
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(AppException, app_exception_handler)
    
    # Add more exception handlers as needed
    # app.add_exception_handler(SomeOtherException, some_other_handler)
