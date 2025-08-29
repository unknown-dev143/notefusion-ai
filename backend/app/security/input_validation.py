"""
Input validation and sanitization utilities.

This module provides functions to validate and sanitize user input to prevent
common web application vulnerabilities like XSS, SQL injection, etc.
"""
import re
import html
from typing import Any, Dict, List, Optional, Union, TypeVar, Type, Callable
from pydantic import BaseModel, validator, root_validator
from pydantic.fields import ModelField

T = TypeVar('T')

def sanitize_input(input_data: Any) -> Any:
    """Recursively sanitize input data to prevent XSS and injection attacks.
    
    Args:
        input_data: The input data to sanitize (can be str, dict, list, etc.)
        
    Returns:
        The sanitized input data
    """
    if input_data is None:
        return None
        
    if isinstance(input_data, str):
        # Basic HTML escaping to prevent XSS
        return html.escape(input_data)
        
    if isinstance(input_data, dict):
        return {k: sanitize_input(v) for k, v in input_data.items()}
        
    if isinstance(input_data, (list, tuple, set)):
        return type(input_data)(sanitize_input(item) for item in input_data)
        
    return input_data

def validate_email(email: str) -> bool:
    """Validate an email address.
    
    Args:
        email: The email address to validate
        
    Returns:
        bool: True if the email is valid, False otherwise
    """
    if not email:
        return False
        
    # Simple regex for basic email validation
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_regex, email))

def validate_username(username: str) -> bool:
    """Validate a username.
    
    Args:
        username: The username to validate
        
    Returns:
        bool: True if the username is valid, False otherwise
    """
    if not username:
        return False
        
    # Username requirements: 3-30 chars, alphanumeric + _ and -
    username_regex = r'^[a-zA-Z0-9_-]{3,30}$'
    return bool(re.match(username_regex, username))

def validate_password_strength(password: str) -> Dict[str, Union[bool, List[str]]]:
    """Check if a password meets strength requirements.
    
    Args:
        password: The password to check
        
    Returns:
        Dict containing:
            - valid: bool indicating if the password meets all requirements
            - messages: List of error messages for any failed requirements
    """
    if not password:
        return {"valid": False, "messages": ["Password cannot be empty"]}
    
    errors = []
    
    # Minimum length
    if len(password) < 12:
        errors.append("Password must be at least 12 characters long")
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    # Check for at least one digit
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one digit")
    
    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")
    
    # Check for common passwords
    common_passwords = [
        'password', '123456', '123456789', '12345678', '12345', '1234567',
        'password1', '1234567890', 'qwerty', 'abc123', 'football', 'monkey',
        'letmein', 'dragon', 'baseball', 'trustno1', 'welcome', 'princess'
    ]
    
    if password.lower() in common_passwords:
        errors.append("Password is too common")
    
    return {
        "valid": len(errors) == 0,
        "messages": errors
    }

def prevent_xss(field_name: str) -> classmethod:
    """Pydantic validator factory to prevent XSS in string fields."""
    def validate_xss(v: str, field: ModelField, **kwargs) -> str:
        if not v or not isinstance(v, str):
            return v
            
        # Check for potential XSS patterns
        xss_patterns = [
            r'<script[^>]*>.*<\/script>',  # Basic script tags
            r'javascript:',                 # JavaScript protocol
            r'on\w+\s*=',                  # Event handlers
            r'data:',                       # Data URIs
            r'vbscript:',                   # VBScript
            r'expression\s*\('             # CSS expressions
        ]
        
        for pattern in xss_patterns:
            if re.search(pattern, v, re.IGNORECASE | re.DOTALL):
                raise ValueError(f"Potential XSS attack detected in {field_name}")
                
        return html.escape(v)
        
    return validator(field_name, allow_reuse=True, check_fields=True)(validate_xss)

def validate_url(url: str) -> bool:
    """Validate a URL.
    
    Args:
        url: The URL to validate
        
    Returns:
        bool: True if the URL is valid, False otherwise
    """
    if not url:
        return False
        
    url_regex = re.compile(
        r'^(?:http|ftp)s?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/\S*)?$',  # path
        re.IGNORECASE
    )
    
    return bool(re.match(url_regex, url))

def validate_phone(phone: str) -> bool:
    """Validate a phone number.
    
    Args:
        phone: The phone number to validate
        
    Returns:
        bool: True if the phone number is valid, False otherwise
    """
    if not phone:
        return False
        
    # Basic phone number validation (supports international format)
    phone_regex = r'^\+?[1-9]\d{1,14}$'  # E.164 format
    return bool(re.match(phone_regex, phone))

def sanitize_sql(input_str: str) -> str:
    """Sanitize SQL input to prevent SQL injection.
    
    Note: This is a basic protection and should be used with parameterized queries.
    
    Args:
        input_str: The input string to sanitize
        
    Returns:
        str: The sanitized string
    """
    if not input_str:
        return ""
        
    # Remove SQL comment sequences
    input_str = re.sub(r'--.*?\n|/\*.*?\*/', '', input_str, flags=re.DOTALL)
    
    # Remove common SQL injection patterns
    sql_keywords = [
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION', 'WHERE', 'OR', 'AND',
        'EXEC', 'EXECUTE', 'TRUNCATE', 'CREATE', 'ALTER', 'GRANT', 'REVOKE', 'DENY'
    ]
    
    for keyword in sql_keywords:
        input_str = re.sub(rf'\b{keyword}\b', '', input_str, flags=re.IGNORECASE)
    
    # Remove potentially dangerous characters
    input_str = re.sub(r'[;\'"`]', '', input_str)
    
    return input_str.strip()

def validate_input(
    model: Type[BaseModel], 
    input_data: Dict[str, Any], 
    exclude_unset: bool = False
) -> BaseModel:
    """Validate input data against a Pydantic model with additional security checks.
    
    Args:
        model: The Pydantic model to validate against
        input_data: The input data to validate
        exclude_unset: Whether to exclude unset fields from validation
        
    Returns:
        The validated and sanitized model instance
        
    Raises:
        ValueError: If validation fails
    """
    try:
        # Create model instance to trigger Pydantic validation
        instance = model(**(input_data if not exclude_unset else 
                          {k: v for k, v in input_data.items() if v is not None}))
        
        # Additional security validation for string fields
        for field_name, field_value in instance.dict().items():
            if isinstance(field_value, str):
                # Check for potential XSS
                prevent_xss(field_name)(instance, field_value)
                
                # If field is a URL, validate it
                if field_name.endswith('_url') or 'url' in field_name.lower():
                    if field_value and not validate_url(field_value):
                        raise ValueError(f"Invalid URL in field '{field_name}'")
        
        return instance
        
    except Exception as e:
        raise ValueError(f"Input validation failed: {str(e)}")
