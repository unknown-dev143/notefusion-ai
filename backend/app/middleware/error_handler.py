import logging
import traceback
from typing import Callable, Awaitable, Any
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)

class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware for handling exceptions and standardizing error responses"""
    
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        try:
            return await call_next(request)
            
        except ValidationError as e:
            logger.warning(f"Request validation error: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "error": {
                        "code": "validation_error",
                        "message": "Invalid request data",
                        "details": e.errors(),
                    }
                },
            )
            
        except HTTPException as e:
            logger.warning(f"HTTP error: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": {
                        "code": e.__class__.__name__,
                        "message": str(e.detail) if hasattr(e, "detail") else str(e),
                    }
                },
            )
            
        except Exception as e:
            # Log the full exception with traceback
            error_id = f"err_{hash(traceback.format_exc())}"
            logger.error(
                f"Unhandled exception (ID: {error_id}): {str(e)}",
                exc_info=True,
                extra={
                    "error_id": error_id,
                    "path": request.url.path,
                    "method": request.method,
                },
            )
            
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": {
                        "code": "internal_server_error",
                        "message": "An unexpected error occurred",
                        "error_id": error_id,
                        "request_id": request.state.request_id if hasattr(request.state, "request_id") else None,
                    }
                },
            )

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses"""
    
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Log request
        request_id = request.headers.get("X-Request-ID") or f"req_{hash(str(request.url) + str(datetime.utcnow()))}"
        request.state.request_id = request_id
        
        logger.info(
            "Request received",
            extra={
                "request_id": request_id,
                "method": request.method,
                "url": str(request.url),
                "client": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            },
        )
        
        # Process request
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            "Request completed",
            extra={
                "request_id": request_id,
                "status_code": response.status_code,
                "process_time": f"{process_time:.4f}s",
            },
        )
        
        # Add performance headers
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = request_id
        
        return response

def setup_error_handling(app: ASGIApp):
    """Set up error handling and request logging middleware"""
    # Add request ID middleware first
    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or f"req_{hash(str(request.url) + str(datetime.utcnow()))}"
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
    
    # Add other middleware
    app.add_middleware(ExceptionHandlerMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    
    # Add exception handlers
    @app.exception_handler(404)
    async def not_found_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=404,
            content={
                "error": {
                    "code": "not_found",
                    "message": "The requested resource was not found",
                }
            },
        )
    
    @app.exception_handler(405)
    async def method_not_allowed_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=405,
            content={
                "error": {
                    "code": "method_not_allowed",
                    "message": f"Method {request.method} not allowed for this endpoint",
                }
            },
        )
    
    logger.info("Error handling and request logging middleware initialized")
