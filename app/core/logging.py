"""
app/core/logging.py
--------------------
Structured logging configuration using structlog.
Configures stdout and file logging with standard and JSON processors.
"""

import logging
import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional
import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Create logs directory if it doesn't exist
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Standard logging config (intercepts stdlib log messages)
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_DIR / "app.log")
    ]
)

# Structlog processors list
# Note: in structlog >= 21.2, add_logger_name lives in structlog.stdlib
processors = [
    structlog.contextvars.merge_contextvars,
    structlog.stdlib.add_logger_name,
    structlog.processors.add_log_level,
    structlog.processors.TimeStamper(fmt="iso"),
    structlog.processors.StackInfoRenderer(),
    structlog.processors.format_exc_info,
]

# Set renderer based on terminal / environment
if sys.stdout.isatty():
    processors.append(structlog.dev.ConsoleRenderer())
else:
    processors.append(structlog.processors.JSONRenderer())

structlog.configure(
    processors=processors,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger("notefusion")

# Request logging middleware using structlog
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        logger.info(
            "request_started",
            method=request.method,
            url=str(request.url),
            client_ip=request.client.host if request.client else None,
        )
        
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            logger.info(
                "request_completed",
                method=request.method,
                url=str(request.url),
                status_code=response.status_code,
                duration=f"{duration:.4f}s"
            )
            return response
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                "request_failed",
                method=request.method,
                url=str(request.url),
                error=str(e),
                duration=f"{duration:.4f}s",
                exc_info=True
            )
            raise

def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
    """Helper function to log errors with context"""
    extra = context or {}
    logger.error(
        "error_occurred",
        error=str(error),
        error_type=error.__class__.__name__,
        **extra,
        exc_info=True
    )

def log_info(message: str, context: Optional[Dict[str, Any]] = None) -> None:
    """Helper function to log info messages with context"""
    extra = context or {}
    logger.info(message, **extra)

def log_warning(message: str, context: Optional[Dict[str, Any]] = None) -> None:
    """Helper function to log warning messages with context"""
    extra = context or {}
    logger.warning(message, **extra)
