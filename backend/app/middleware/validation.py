from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import json
import re
from typing import Dict, Any, Callable, Awaitable
import logging

logger = logging.getLogger(__name__)

class RequestValidator:
    def __init__(self):
        # Define validation rules for different endpoints
        self.endpoint_validations = {
            "/api/v1/ai/generate": {
                "methods": ["POST"],
                "required_fields": ["prompt"],
                "field_rules": {
                    "prompt": {
                        "type": str,
                        "min_length": 10,
                        "max_length": 1000,
                        "pattern": r'^[\w\s\-.,!?]+$'
                    },
                    "max_tokens": {
                        "type": int,
                        "min": 1,
                        "max": 4000
                    }
                }
            },
            "/api/v1/upload": {
                "methods": ["POST"],
                "required_fields": ["file"],
                "max_file_size": 50 * 1024 * 1024,  # 50MB
                "allowed_mime_types": [
                    "application/pdf",
                    "text/plain",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ]
            }
        }
    
    async def validate_request(self, request: Request, call_next):
        # Skip validation for non-API routes
        if not request.url.path.startswith("/api/"):
            return await call_next(request)
            
        # Get validation rules for the current endpoint
        endpoint_rules = self._get_endpoint_rules(request)
        if not endpoint_rules:
            return await call_next(request)
            
        # Validate HTTP method
        if "methods" in endpoint_rules and request.method not in endpoint_rules["methods"]:
            raise HTTPException(
                status_code=405,
                detail=f"Method {request.method} not allowed for this endpoint"
            )
        
        # Validate request body
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.json()
                await self._validate_body(body, endpoint_rules, request)
                # Store validated body in request state for later use
                request.state.validated_body = body
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON in request body")
        
        # Validate file uploads if needed
        if "file" in (endpoint_rules.get("required_fields") or []):
            await self._validate_file_upload(request, endpoint_rules)
        
        # Proceed with the request
        return await call_next(request)
    
    def _get_endpoint_rules(self, request: Request) -> Dict[str, Any]:
        """Get validation rules for the current endpoint"""
        for path, rules in self.endpoint_validations.items():
            if request.url.path.startswith(path):
                return rules
        return {}
    
    async def _validate_body(self, body: Dict[str, Any], rules: Dict[str, Any], request: Request):
        """Validate request body against defined rules"""
        # Check required fields
        for field in rules.get("required_fields", []):
            if field not in body:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required field: {field}"
                )
        
        # Validate field rules
        field_rules = rules.get("field_rules", {})
        for field, rules in field_rules.items():
            if field not in body:
                continue
                
            value = body[field]
            
            # Type checking
            if "type" in rules and not isinstance(value, rules["type"]):
                try:
                    # Try to convert to the expected type
                    body[field] = rules["type"](value)
                except (ValueError, TypeError):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Field '{field}' must be of type {rules['type'].__name__}"
                    )
            
            # Length validations
            if "min_length" in rules and len(str(value)) < rules["min_length"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Field '{field}' must be at least {rules['min_length']} characters long"
                )
                
            if "max_length" in rules and len(str(value)) > rules["max_length"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Field '{field}' must not exceed {rules['max_length']} characters"
                )
            
            # Pattern matching
            if "pattern" in rules and not re.match(rules["pattern"], str(value)):
                raise HTTPException(
                    status_code=400,
                    detail=f"Field '{field}' contains invalid characters"
                )
    
    async def _validate_file_upload(self, request: Request, rules: Dict[str, Any]):
        """Validate file uploads"""
        content_type = request.headers.get("content-type", "")
        
        if not content_type.startswith("multipart/form-data"):
            raise HTTPException(
                status_code=400,
                detail="File upload must be sent as multipart/form-data"
            )
        
        # Check file size
        content_length = int(request.headers.get("content-length", 0))
        if "max_file_size" in rules and content_length > rules["max_file_size"]:
            max_size_mb = rules["max_file_size"] / (1024 * 1024)
            raise HTTPException(
                status_code=413,
                detail=f"File size exceeds maximum allowed size of {max_size_mb}MB"
            )
        
        # Check MIME type if specified
        if "allowed_mime_types" in rules:
            content_type = request.headers.get("content-type", "")
            if not any(mime in content_type for mime in rules["allowed_mime_types"]):
                raise HTTPException(
                    status_code=415,
                    detail=f"Unsupported file type. Allowed types: {', '.join(rules['allowed_mime_types'])}"
                )

def setup_validation_middleware(app):
    """Set up request validation middleware"""
    validator = RequestValidator()
    app.middleware("http")(validator.validate_request)
