"""Core functionality for the NoteFusion AI application."""

from .config import settings, get_settings
from .database import SessionLocal, engine, Base, get_db
from .security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_current_active_user,
    get_current_active_superuser,
    has_required_roles,
    oauth2_scheme,
    TOKEN_TYPE,
)
from .logging import logger, log_error, log_info, log_warning, LoggingMiddleware

__all__ = [
    # Config
    'settings',
    'get_settings',
    
    # Database
    'SessionLocal',
    'engine',
    'Base',
    'get_db',
    
    # Security
    'get_password_hash',
    'verify_password',
    'create_access_token',
    'create_refresh_token',
    'get_current_user',
    'get_current_active_user',
    'get_current_active_superuser',
    'has_required_roles',
    'oauth2_scheme',
    'TOKEN_TYPE',
    
    # Logging
    'logger',
    'log_error',
    'log_info',
    'log_warning',
    'LoggingMiddleware',
]
