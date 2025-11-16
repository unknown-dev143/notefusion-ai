"""
Input validation and sanitization utilities.
"""
import re
import html
from typing import Any, Dict, List, Optional, Union, Callable, TypeVar, Type
from pydantic import BaseModel, ValidationError, validator
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Type variable for generic function return
T = TypeVar('T')

class InputValidator:
    """Utility class for input validation and sanitization."""
    
    # Common regex patterns
    EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    PASSWORD_REGEX = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
    USERNAME_REGEX = r'^[a-zA-Z0-9_-]{3,50}$'
    
    @classmethod
    def sanitize_input(cls, input_data: Any) -> Any:
        """Recursively sanitize input data to prevent XSS and injection attacks."""
        if isinstance(input_data, str):
            # Remove potentially dangerous characters and escape HTML
            return html.escape(input_data.strip())
        elif isinstance(input_data, dict):
            return {k: cls.sanitize_input(v) for k, v in input_data.items()}
        elif isinstance(input_data, list):
            return [cls.sanitize_input(item) for item in input_data]
        return input_data
    
    @classmethod
    def validate_email(cls, email: str) -> bool:
        """Validate email format."""
        return bool(re.match(cls.EMAIL_REGEX, email))
    
    @classmethod
    def validate_password_strength(cls, password: str) -> bool:
        """Validate password strength."""
        return bool(re.match(cls.PASSWORD_REGEX, password))
    
    @classmethod
    def validate_username(cls, username: str) -> bool:
        """Validate username format."""
        return bool(re.match(cls.USERNAME_REGEX, username))
    
    @classmethod
    def validate_input_model(
        cls, 
        model: Type[BaseModel], 
        data: Union[Dict[str, Any], Any],
        context: Optional[Dict[str, Any]] = None
    ) -> T:
        """
        Validate input data against a Pydantic model.
        
        Args:
            model: The Pydantic model to validate against
            data: The input data to validate
            context: Additional context for validation
            
        Returns:
            The validated and sanitized data as an instance of the model
            
        Raises:
            HTTPException: If validation fails
        """
        try:
            # Sanitize input data
            sanitized_data = cls.sanitize_input(data)
            
            # Create model instance with validation
            if isinstance(sanitized_data, dict):
                return model(**(sanitized_data or {}), **(context or {}))
            return model(sanitized_data, **(context or {}))
            
        except ValidationError as e:
            # Format validation errors
            errors = []
            for error in e.errors():
                field = ".".join(str(loc) for loc in error['loc'])
                errors.append(f"{field}: {error['msg']}")
            
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "error": "validation_error",
                    "message": "Invalid input data",
                    "details": errors
                }
            )

# Middleware for input validation
class ValidationMiddleware:
    """Middleware for request validation and sanitization."""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
            
        request = Request(scope, receive)
        
        # Skip validation for certain paths
        if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return await self.app(scope, receive, send)
        
        # Get request body for validation
        body = {}
        content_type = request.headers.get("content-type", "")
        
        if content_type == "application/json":
            try:
                body = await request.json()
            except Exception:
                pass
        
        # Sanitize all input data
        try:
            # Sanitize path parameters
            if scope.get("path_params"):
                scope["path_params"] = InputValidator.sanitize_input(scope["path_params"])
                
            # Sanitize query parameters
            if scope.get("query_string"):
                query_params = {}
                for param in scope["query_string"].decode().split("&"):
                    if "=" in param:
                        key, value = param.split("=", 1)
                        query_params[key] = value
                scope["query_params"] = InputValidator.sanitize_input(query_params)
                
            # Sanitize headers
            headers = {}
            for key, value in scope.get("headers", []):
                headers[key.decode()] = value.decode()
            scope["headers"] = [(k.encode(), v.encode()) for k, v in InputValidator.sanitize_input(headers).items()]
            
            # Sanitize body
            if body:
                scope["body"] = InputValidator.sanitize_input(body)
                
        except Exception as e:
            response = JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "invalid_input", "message": "Failed to process input data"}
            )
            await response(scope, receive, send)
            return
            
        return await self.app(scope, receive, send)
