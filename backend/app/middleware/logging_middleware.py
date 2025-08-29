import time
import logging
import json
from typing import Dict, Any, Optional, Callable, Awaitable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp
import uuid
import re

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for structured request/response logging"""
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Generate request ID if not present
        request_id = request.headers.get('X-Request-ID') or str(uuid.uuid4())
        
        # Store start time
        start_time = time.time()
        
        # Log request
        await self._log_request(request, request_id)
        
        # Process request
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            await self._log_response(
                request=request,
                response=response,
                request_id=request_id,
                process_time=process_time
            )
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            await self._log_exception(
                request=request,
                error=e,
                request_id=request_id,
                process_time=process_time
            )
            raise
    
    async def _log_request(self, request: Request, request_id: str):
        """Log incoming request"""
        try:
            # Skip logging for health checks and metrics
            if request.url.path in ['/health', '/metrics']:
                return
                
            # Get client info
            client_host = request.client.host if request.client else None
            user_agent = request.headers.get('user-agent')
            
            # Get request body if it's JSON and not too large
            body = {}
            if request.method in ['POST', 'PUT', 'PATCH'] and 'application/json' in request.headers.get('content-type', ''):
                try:
                    body = await request.json()
                    # Redact sensitive fields
                    body = self._redact_sensitive_data(body)
                except Exception:
                    body = {'error': 'Unable to parse JSON body'}
            
            # Prepare log data
            log_data = {
                'request_id': request_id,
                'method': request.method,
                'url': str(request.url),
                'client_host': client_host,
                'user_agent': user_agent,
                'headers': dict(request.headers),
                'query_params': dict(request.query_params),
                'body': body,
            }
            
            # Log the request
            logger.info(
                "Request received",
                extra={'request': log_data}
            )
            
        except Exception as e:
            logger.error(f"Error logging request: {str(e)}", exc_info=True)
    
    async def _log_response(
        self,
        request: Request,
        response: Response,
        request_id: str,
        process_time: float
    ):
        """Log outgoing response"""
        try:
            # Skip logging for health checks and metrics
            if request.url.path in ['/health', '/metrics']:
                return
                
            # Get response body if it's JSON and not too large
            response_body = None
            if hasattr(response, 'body') and hasattr(response, 'headers') and 'application/json' in response.headers.get('content-type', ''):
                try:
                    response_body = json.loads(response.body.decode())
                    # Redact sensitive fields
                    response_body = self._redact_sensitive_data(response_body)
                except Exception:
                    response_body = {'error': 'Unable to parse JSON response'}
            
            # Prepare log data
            log_data = {
                'request_id': request_id,
                'method': request.method,
                'url': str(request.url),
                'status_code': response.status_code,
                'process_time': f"{process_time:.4f}s",
                'response_headers': dict(response.headers) if hasattr(response, 'headers') else {},
                'response_body': response_body,
            }
            
            # Log the response
            if 400 <= response.status_code < 600:
                logger.error(
                    f"Request failed with status {response.status_code}",
                    extra={'response': log_data}
                )
            else:
                logger.info(
                    "Request completed successfully",
                    extra={'response': log_data}
                )
                
        except Exception as e:
            logger.error(f"Error logging response: {str(e)}", exc_info=True)
    
    async def _log_exception(
        self,
        request: Request,
        error: Exception,
        request_id: str,
        process_time: float
    ):
        """Log exceptions"""
        try:
            log_data = {
                'request_id': request_id,
                'method': request.method,
                'url': str(request.url),
                'error': str(error),
                'error_type': error.__class__.__name__,
                'process_time': f"{process_time:.4f}s",
            }
            
            logger.error(
                f"Unhandled exception: {str(error)}",
                exc_info=True,
                extra={
                    'error': log_data,
                    'stack_trace': self._get_stack_trace(error)
                }
            )
            
        except Exception as e:
            logger.error(f"Error logging exception: {str(e)}", exc_info=True)
    
    def _redact_sensitive_data(self, data: Any) -> Any:
        """Redact sensitive data from logs"""
        if isinstance(data, dict):
            return {
                key: '***REDACTED***' if self._is_sensitive_key(key) 
                else self._redact_sensitive_data(value)
                for key, value in data.items()
            }
        elif isinstance(data, list):
            return [self._redact_sensitive_data(item) for item in data]
        return data
    
    @staticmethod
    def _is_sensitive_key(key: str) -> bool:
        """Check if a key contains sensitive information"""
        sensitive_terms = [
            'password', 'secret', 'token', 'key', 'api_key',
            'apikey', 'auth', 'credential', 'passwd', 'pwd'
        ]
        key_lower = key.lower()
        return any(term in key_lower for term in sensitive_terms)
    
    @staticmethod
    def _get_stack_trace(error: Exception) -> str:
        """Get formatted stack trace from exception"""
        import traceback
        return ''.join(traceback.format_exception(
            type(error), error, error.__traceback__
        ))

def setup_logging_middleware(app: ASGIApp):
    """Set up logging middleware"""
    app.add_middleware(LoggingMiddleware)
    logger.info("Logging middleware initialized")
    return app
