"""Logging configuration for the application."""
import logging
import logging.config
import logging.handlers
import os
import sys
from pathlib import Path
from typing import Any, Dict, Optional

from ..config import settings


def setup_logging() -> None:
    """Set up logging configuration."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Base logging config
    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": log_format,
                "datefmt": date_format,
            },
            "json": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "format": """
                    asctime: %(asctime)s
                    name: %(name)s
                    levelname: %(levelname)s
                    message: %(message)s
                    pathname: %(pathname)s
                    funcName: %(funcName)s
                    lineno: %(lineno)d
                """,
                "datefmt": date_format,
            },
        },
        "handlers": {
            "console": {
                "level": log_level,
                "class": "logging.StreamHandler",
                "formatter": "standard",
                "stream": sys.stdout,
            },
            "file": {
                "level": log_level,
                "class": "logging.handlers.RotatingFileHandler",
                "filename": log_dir / "app.log",
                "maxBytes": 10 * 1024 * 1024,  # 10MB
                "backupCount": 5,
                "formatter": "standard",
                "encoding": "utf8",
            },
            "error_file": {
                "level": logging.ERROR,
                "class": "logging.handlers.RotatingFileHandler",
                "filename": log_dir / "error.log",
                "maxBytes": 10 * 1024 * 1024,  # 10MB
                "backupCount": 5,
                "formatter": "standard",
                "encoding": "utf8",
            },
        },
        "loggers": {
            "": {  # root logger
                "handlers": ["console", "file", "error_file"],
                "level": log_level,
                "propagate": True,
            },
            "uvicorn": {
                "handlers": ["console", "file"],
                "level": log_level,
                "propagate": False,
            },
            "uvicorn.error": {
                "handlers": ["console", "file"],
                "level": log_level,
                "propagate": False,
            },
            "sqlalchemy": {
                "handlers": ["console", "file"],
                "level": logging.WARNING,
                "propagate": False,
            },
        },
    }
    
    # In production, use JSON format for structured logging
    if settings.ENV == "production":
        logging_config["handlers"]["file"]["formatter"] = "json"
        logging_config["handlers"]["error_file"]["formatter"] = "json"
    
    # Apply the configuration
    logging.config.dictConfig(logging_config)


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get a logger with the given name.
    
    Args:
        name: The name of the logger. If None, returns the root logger.
        
    Returns:
        A configured logger instance.
    """
    return logging.getLogger(name)


# Set up logging when this module is imported
setup_logging()

# Create a default logger
logger = get_logger(__name__)


class RequestIdFilter(logging.Filter):
    """Add request ID to log records."""
    
    def __init__(self, name: str = ""):
        super().__init__(name=name)
        self._request_id: Optional[str] = None
    
    def set_request_id(self, request_id: str) -> None:
        """Set the current request ID."""
        self._request_id = request_id
    
    def filter(self, record: logging.LogRecord) -> bool:
        """Add request ID to the log record if available."""
        record.request_id = self._request_id or "-"
        return True


# Create a global request ID filter
request_id_filter = RequestIdFilter()


def setup_request_logging(app: Any) -> None:
    """Set up request logging middleware."""
    logger = get_logger("request")
    
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        # Generate a unique ID for this request
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request_id_filter.set_request_id(request_id)
        
        # Log the request
        logger.info(
            "Request started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "url": str(request.url),
                "client": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            },
        )
        
        try:
            # Process the request
            start_time = time.time()
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            
            # Log the response
            logger.info(
                "Request completed",
                extra={
                    "request_id": request_id,
                    "status_code": response.status_code,
                    "process_time_ms": process_time,
                },
            )
            
            # Add request ID to the response headers
            response.headers["X-Request-ID"] = request_id
            return response
            
        except Exception as e:
            # Log any unhandled exceptions
            logger.exception(
                "Request failed",
                extra={
                    "request_id": request_id,
                    "error": str(e),
                    "error_type": e.__class__.__name__,
                },
            )
            raise
