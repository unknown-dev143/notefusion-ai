import logging
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional
import traceback

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Create logs directory if it doesn't exist
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_DIR / 'app.log')
    ]
)

# Get logger instance
logger = logging.getLogger("notefusion")

# Custom JSON formatter for structured logging
class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'name': record.name,
            'message': record.getMessage(),
            'pathname': record.pathname,
            'lineno': record.lineno,
            'function': record.funcName,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_record['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, 'extra'):
            log_record.update(record.extra)
            
        return json.dumps(log_record, ensure_ascii=False)

# Configure JSON logging for production
json_handler = logging.FileHandler(LOG_DIR / 'app-json.log')
json_handler.setFormatter(JsonFormatter())
logger.addHandler(json_handler)

# Request logging middleware
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Log request
        logger.info(
            "Request started",
            extra={
                "request": {
                    "method": request.method,
                    "url": str(request.url),
                    "headers": dict(request.headers),
                    "client": {"host": request.client.host if request.client else None},
                }
            },
        )
        
        try:
            response = await call_next(request)
            
            # Log response
            logger.info(
                "Request completed",
                extra={
                    "response": {
                        "status_code": response.status_code,
                        "headers": dict(response.headers),
                    },
                    "request": {"url": str(request.url), "method": request.method},
                },
            )
            
            return response
            
        except Exception as e:
            logger.error(
                "Request failed",
                exc_info=True,
                extra={
                    "request": {
                        "url": str(request.url),
                        "method": request.method,
                        "path_params": request.path_params,
                        "query_params": dict(request.query_params),
                    },
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                },
            )
            raise

def log_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> None:
    """Helper function to log errors with context"""
    extra = {"error": str(error), "error_type": error.__class__.__name__}
    if context:
        extra.update(context)
    logger.error("An error occurred", exc_info=True, extra=extra)

def log_info(message: str, context: Optional[Dict[str, Any]] = None) -> None:
    """Helper function to log info messages with context"""
    extra = context or {}
    logger.info(message, extra=extra)

def log_warning(message: str, context: Optional[Dict[str, Any]] = None) -> None:
    """Helper function to log warning messages with context"""
    extra = context or {}
    logger.warning(message, extra=extra)
