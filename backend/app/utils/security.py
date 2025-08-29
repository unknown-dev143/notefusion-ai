"""Security utilities for input sanitization and validation"""
import re
import html
from typing import Any, Dict, List, Optional, Union, TypeVar, Type
from pydantic import BaseModel, validator
import bleach
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# Type variable for generic type hints
T = TypeVar('T', bound=BaseModel)

# Regular expressions for validation
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
USERNAME_REGEX = r'^[a-zA-Z0-9_-]{3,50}$'
PASSWORD_REGEX = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'

# Allowed HTML tags and attributes for rich text content
ALLOWED_TAGS = [
    'p', 'br', 'b', 'i', 'u', 'em', 'strong', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
    'hr', 'div', 'span', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id', 'style'],
    'table': ['border', 'cellpadding', 'cellspacing'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan', 'scope']
}

# Allowed URL schemes
ALLOWED_SCHEMES = ['http', 'https', 'mailto', 'tel']

class SanitizationError(ValueError):
    """Raised when input fails sanitization"""
    pass

def sanitize_input(input_data: Any, field_type: Type = str) -> Any:
    """
    Sanitize input data based on its type.
    
    Args:
        input_data: The input data to sanitize
        field_type: The expected type of the input data
        
    Returns:
        The sanitized input data
        
    Raises:
        SanitizationError: If the input cannot be properly sanitized
    """
    if input_data is None:
        return None
        
    try:
        if field_type == str:
            return sanitize_string(input_data)
        elif field_type == int:
            return int(input_data)
        elif field_type == float:
            return float(input_data)
        elif field_type == bool:
            return bool(input_data)
        elif hasattr(field_type, '__origin__') and field_type.__origin__ == list:
            if not isinstance(input_data, list):
                raise SanitizationError("Expected a list")
            item_type = field_type.__args__[0]
            return [sanitize_input(item, item_type) for item in input_data]
        elif hasattr(field_type, '__origin__') and field_type.__origin__ == dict:
            if not isinstance(input_data, dict):
                raise SanitizationError("Expected a dictionary")
            key_type, value_type = field_type.__args__
            return {
                sanitize_input(k, key_type): sanitize_input(v, value_type)
                for k, v in input_data.items()
            }
        elif issubclass(field_type, BaseModel):
            # Recursively sanitize Pydantic models
            return sanitize_pydantic(input_data, field_type)
        else:
            # For custom types, try to convert to the target type
            return field_type(input_data)
    except (ValueError, TypeError, AttributeError) as e:
        raise SanitizationError(f"Invalid input: {str(e)}")

def sanitize_string(value: str, allow_html: bool = False, max_length: int = 10000) -> str:
    """
    Sanitize a string input.
    
    Args:
        value: The input string to sanitize
        allow_html: Whether to allow HTML content (with whitelisted tags)
        max_length: Maximum allowed length of the string
        
    Returns:
        The sanitized string
    """
    if not isinstance(value, str):
        value = str(value)
    
    # Trim whitespace
    value = value.strip()
    
    # Check length
    if len(value) > max_length:
        raise SanitizationError(f"Input too long (max {max_length} characters)")
    
    # Handle empty string
    if not value:
        return value
    
    # Decode HTML entities
    value = html.unescape(value)
    
    # Clean HTML if allowed
    if allow_html:
        value = bleach.clean(
            value,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
            protocols=ALLOWED_SCHEMES,
            strip=True
        )
    else:
        # Remove all HTML tags
        value = bleach.clean(value, tags=[], attributes={}, strip=True)
    
    return value

def sanitize_pydantic(data: Union[Dict, BaseModel], model: Type[T]) -> T:
    """
    Sanitize input data against a Pydantic model.
    
    Args:
        data: The input data (dict or Pydantic model instance)
        model: The Pydantic model class
        
    Returns:
        An instance of the model with sanitized data
    """
    if isinstance(data, model):
        return data
        
    if not isinstance(data, dict):
        data = data.dict()
    
    # Get field types from the model
    field_types = {
        name: field.outer_type_ 
        for name, field in model.__annotations__.items()
    }
    
    # Sanitize each field
    sanitized_data = {}
    for field_name, field_type in field_types.items():
        if field_name in data:
            try:
                sanitized_data[field_name] = sanitize_input(
                    data[field_name], 
                    field_type
                )
            except SanitizationError as e:
                raise SanitizationError(f"{field_name}: {str(e)}")
    
    # Create model instance with sanitized data
    return model(**sanitized_data)

def validate_email(email: str) -> str:
    """Validate and sanitize an email address"""
    if not re.match(EMAIL_REGEX, email):
        raise SanitizationError("Invalid email format")
    return email.lower().strip()

def validate_username(username: str) -> str:
    """Validate and sanitize a username"""
    username = username.strip()
    if not re.match(USERNAME_REGEX, username):
        raise SanitizationError(
            "Username must be 3-50 characters long and contain only letters, "
            "numbers, underscores, and hyphens"
        )
    return username

def validate_password(password: str) -> str:
    """Validate password strength"""
    if not re.match(PASSWORD_REGEX, password):
        raise SanitizationError(
            "Password must be at least 8 characters long and contain at least "
            "one uppercase letter, one lowercase letter, one number, and one special character"
        )
    return password

def sanitize_endpoint(endpoint: str) -> str:
    """Sanitize URL endpoint"""
    if not endpoint.startswith('/'):
        endpoint = '/' + endpoint
    return endpoint.strip('/')

def sanitize_url(url: str) -> str:
    """Sanitize and validate a URL"""
    from urllib.parse import urlparse
    
    url = url.strip()
    if not url:
        raise SanitizationError("URL cannot be empty")
    
    # Add scheme if missing
    if '://' not in url:
        url = 'https://' + url
    
    # Parse URL
    parsed = urlparse(url)
    
    # Validate scheme
    if parsed.scheme not in ALLOWED_SCHEMES:
        raise SanitizationError(f"URL scheme must be one of: {', '.join(ALLOWED_SCHEMES)}")
    
    # Reconstruct URL with only allowed parts
    sanitized = parsed._replace(
        netloc=parsed.netloc.lower(),
        params='',
        query='',
        fragment=''
    ).geturl()
    
    return sanitized

def sanitize_rich_text(html_content: str) -> str:
    """Sanitize rich text HTML content"""
    if not html_content:
        return ""
    
    # Clean HTML with allowed tags and attributes
    cleaned = bleach.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_SCHEMES,
        strip=True
    )
    
    # Remove potentially dangerous protocols from URLs
    cleaned = bleach.linkify(cleaned, parse_email=True)
    
    return cleaned

def sanitize_file_upload(filename: str) -> str:
    """Sanitize a file upload filename"""
    import os
    from werkzeug.utils import secure_filename
    
    # Secure the filename
    secure_name = secure_filename(filename)
    
    # Limit filename length
    max_length = 100
    name, ext = os.path.splitext(secure_name)
    if len(name) > max_length - len(ext):
        name = name[:max_length - len(ext)]
    
    return name + ext.lower()

def sanitize_sql_query(query: str) -> str:
    """Basic SQL injection prevention"""
    # This is a very basic check and should be used with parameterized queries
    forbidden = [';', '--', '/*', '*/', 'xp_', 'sp_', 'exec', 'union select', 'drop ', 'insert ', 'update ', 'delete ', 'truncate ']
    
    query_lower = query.lower()
    for pattern in forbidden:
        if pattern in query_lower:
            raise SanitizationError("Invalid SQL query")
    
    return query

def sanitize_headers(headers: Dict[str, str]) -> Dict[str, str]:
    """Sanitize HTTP headers"""
    sanitized = {}
    for key, value in headers.items():
        if not key or not value:
            continue
            
        # Simple header name validation
        if not re.match(r'^[a-zA-Z0-9_-]+$', key):
            continue
            
        # Sanitize header value
        sanitized[key] = sanitize_string(str(value), allow_html=False)
    
    return sanitized

def sanitize_telephone(number: str) -> str:
    """Sanitize and validate a telephone number"""
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', str(number))
    
    # Basic validation
    if not 8 <= len(digits) <= 15:
        raise SanitizationError("Invalid phone number length")
    
    return f"+{digits}" if not digits.startswith('+') else digits

def sanitize_json(data: Union[dict, list, str]) -> Union[dict, list]:
    """Sanitize JSON data"""
    if isinstance(data, str):
        import json
        try:
            data = json.loads(data)
        except json.JSONDecodeError as e:
            raise SanitizationError(f"Invalid JSON: {str(e)}")
    
    if isinstance(data, dict):
        return {
            sanitize_string(k): sanitize_json(v) 
            for k, v in data.items()
        }
    elif isinstance(data, list):
        return [sanitize_json(item) for item in data]
    elif isinstance(data, str):
        return sanitize_string(data)
    elif isinstance(data, (int, float, bool)) or data is None:
        return data
    else:
        return str(data)

def sanitize_middleware():
    """Middleware to automatically sanitize request data"""
    from fastapi import Request, Response
    from fastapi.routing import APIRoute
    from starlette.types import ASGIApp, Receive, Scope, Send
    
    class SanitizationMiddleware:
        def __init__(self, app: ASGIApp):
            self.app = app
        
        async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
            if scope["type"] != "http":
                await self.app(scope, receive, send)
                return
            
            request = Request(scope, receive)
            
            # Skip for certain paths like /metrics, /health, etc.
            if any(request.url.path.startswith(p) for p in ['/metrics', '/health', '/docs', '/redoc']):
                await self.app(scope, receive, send)
                return
            
            # Get the route
            route = request.scope.get('route')
            if not route or not hasattr(route, 'endpoint'):
                await self.app(scope, receive, send)
                return
            
            # Get the endpoint function
            endpoint = route.endpoint
            
            # Skip if it's not a route with parameters
            if not hasattr(endpoint, '__annotations__'):
                await self.app(scope, receive, send)
                return
            
            # Get the expected parameter types
            params = endpoint.__annotations__
            
            try:
                # Sanitize query parameters
                if request.query_params:
                    sanitized_query = {}
                    for key, value in request.query_params.multi_items():
                        param_type = params.get(key, str)
                        sanitized_query[key] = sanitize_input(value, param_type)
                    request.scope["query_string"] = "&".join(
                        f"{k}={v}" for k, v in sanitized_query.items()
                    )
                
                # Sanitize path parameters
                if request.path_params:
                    for key, value in request.path_params.items():
                        if key in params:
                            request.path_params[key] = sanitize_input(value, params[key])
                
                # Sanitize form data
                if request.headers.get('content-type', '').startswith('multipart/form-data'):
                    form_data = await request.form()
                    sanitized_form = {}
                    for key, value in form_data.multi_items():
                        param_type = params.get(key, str)
                        if hasattr(value, 'filename'):
                            # Handle file uploads
                            value.filename = sanitize_file_upload(value.filename)
                            sanitized_form[key] = value
                        else:
                            sanitized_form[key] = sanitize_input(value, param_type)
                    
                    # Replace the form data in the request
                    request._form = sanitized_form
                
                # Sanitize JSON body
                elif request.headers.get('content-type') == 'application/json':
                    body = await request.body()
                    if body:
                        import json
                        try:
                            json_data = json.loads(body)
                            sanitized_json = sanitize_json(json_data)
                            # Replace the body in the request
                            request._body = json.dumps(sanitized_json).encode()
                        except json.JSONDecodeError:
                            pass
                
            except SanitizationError as e:
                from fastapi.responses import JSONResponse
                response = JSONResponse(
                    status_code=400,
                    content={"detail": str(e)}
                )
                await response(scope, receive, send)
                return
            
            await self.app(scope, receive, send)
    
    return SanitizationMiddleware

def sanitize_decorator(func):
    """Decorator to sanitize function arguments"""
    from functools import wraps
    import inspect
    
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Get the function signature
        sig = inspect.signature(func)
        bound_args = sig.bind(*args, **kwargs)
        
        # Sanitize each argument
        for name, value in bound_args.arguments.items():
            if name in sig.parameters:
                param_type = sig.parameters[name].annotation
                if param_type != inspect.Parameter.empty:
                    try:
                        bound_args.arguments[name] = sanitize_input(value, param_type)
                    except SanitizationError as e:
                        raise ValueError(f"Invalid {name}: {str(e)}")
        
        # Call the original function with sanitized arguments
        return await func(*bound_args.args, **bound_args.kwargs)
    
    return wrapper
