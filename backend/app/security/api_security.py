"""API Security and Input Validation System."""
import re
import json
import logging
from typing import Dict, List, Optional, Any, Union, Set
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import hashlib
import secrets
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from pydantic import BaseModel, validator
import html
import bleach
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class ValidationType(Enum):
    """Input validation types."""
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    EMAIL = "email"
    URL = "url"
    PHONE = "phone"
    DATE = "date"
    JSON = "json"
    UUID = "uuid"
    SLUG = "slug"
    PASSWORD = "password"

class ThreatLevel(Enum):
    """API threat levels."""
    SAFE = "safe"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class ValidationRule:
    """Input validation rule."""
    name: str
    type: ValidationType
    required: bool = True
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    pattern: Optional[str] = None
    allowed_values: Optional[List[str]] = None
    sanitize: bool = True
    error_message: Optional[str] = None

@dataclass
class SecurityEvent:
    """Security event data."""
    event_type: str
    threat_level: ThreatLevel
    source_ip: str
    endpoint: str
    method: str
    user_agent: str
    timestamp: datetime
    details: Dict[str, Any]
    blocked: bool = False

class InputValidator:
    """Input validation and sanitization."""
    
    def __init__(self):
        self.validation_patterns = {
            ValidationType.EMAIL: r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
            ValidationType.URL: r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$',
            ValidationType.PHONE: r'^\+?[\d\s\-\(\)]{10,}$',
            ValidationType.UUID: r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
            ValidationType.SLUG: r'^[a-z0-9-]+$',
            ValidationType.PASSWORD: r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$'
        }
        
        self.dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'eval\s*\(',
            r'exec\s*\(',
            r'system\s*\(',
            r'shell_exec\s*\(',
            r'passthru\s*\(',
            r'file_get_contents\s*\(',
            r'fopen\s*\(',
            r'unlink\s*\(',
            r'mkdir\s*\(',
            r'rmdir\s*\(',
            r'chmod\s*\(',
            r'chown\s*\(',
            r'\.\./',
            r'\.\.\\',
            r'union\s+select',
            r'drop\s+table',
            r'delete\s+from',
            r'insert\s+into',
            r'update\s+set',
            r'create\s+table',
            r'alter\s+table',
            r'exec\s*\(',
            r'sp_executesql',
            r'xp_cmdshell',
            r'waitfor\s+delay',
            r'benchmark\s*\(',
            r'sleep\s*\(',
            r'hex\s*\(',
            r'char\s*\(',
            r'ascii\s*\(',
            r'concat\s*\(',
            r'substring\s*\(',
            r'length\s*\(',
            r'cast\s*\(',
            r'convert\s*\('
        ]
    
    def validate_input(self, data: Any, rules: List[ValidationRule]) -> Dict[str, Any]:
        """Validate input data against rules."""
        errors = []
        sanitized_data = {}
        
        for rule in rules:
            field_name = rule.name
            field_value = data.get(field_name)
            
            try:
                # Check if required
                if rule.required and field_value is None:
                    errors.append(f"{field_name} is required")
                    continue
                
                # Skip validation if not required and value is None
                if not rule.required and field_value is None:
                    sanitized_data[field_name] = None
                    continue
                
                # Validate based on type
                validated_value = self._validate_field(field_value, rule)
                
                # Sanitize if required
                if rule.sanitize:
                    validated_value = self._sanitize_input(validated_value, rule.type)
                
                sanitized_data[field_name] = validated_value
                
            except ValueError as e:
                error_msg = rule.error_message or str(e)
                errors.append(f"{field_name}: {error_msg}")
        
        if errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"validation_errors": errors}
            )
        
        return sanitized_data
    
    def _validate_field(self, value: Any, rule: ValidationRule) -> Any:
        """Validate a single field."""
        # Type validation
        if rule.type == ValidationType.STRING:
            if not isinstance(value, str):
                raise ValueError("Must be a string")
            
            # Length validation
            if rule.min_length and len(value) < rule.min_length:
                raise ValueError(f"Must be at least {rule.min_length} characters")
            
            if rule.max_length and len(value) > rule.max_length:
                raise ValueError(f"Must be at most {rule.max_length} characters")
        
        elif rule.type == ValidationType.INTEGER:
            try:
                value = int(value)
            except (ValueError, TypeError):
                raise ValueError("Must be an integer")
        
        elif rule.type == ValidationType.FLOAT:
            try:
                value = float(value)
            except (ValueError, TypeError):
                raise ValueError("Must be a number")
        
        elif rule.type == ValidationType.BOOLEAN:
            if isinstance(value, str):
                value = value.lower() in ['true', '1', 'yes', 'on']
            else:
                value = bool(value)
        
        elif rule.type == ValidationType.EMAIL:
            if not re.match(self.validation_patterns[ValidationType.EMAIL], str(value)):
                raise ValueError("Must be a valid email address")
        
        elif rule.type == ValidationType.URL:
            if not re.match(self.validation_patterns[ValidationType.URL], str(value)):
                raise ValueError("Must be a valid URL")
        
        elif rule.type == ValidationType.PHONE:
            if not re.match(self.validation_patterns[ValidationType.PHONE], str(value)):
                raise ValueError("Must be a valid phone number")
        
        elif rule.type == ValidationType.UUID:
            if not re.match(self.validation_patterns[ValidationType.UUID], str(value)):
                raise ValueError("Must be a valid UUID")
        
        elif rule.type == ValidationType.SLUG:
            if not re.match(self.validation_patterns[ValidationType.SLUG], str(value)):
                raise ValueError("Must be a valid slug (lowercase, numbers, hyphens only)")
        
        elif rule.type == ValidationType.PASSWORD:
            if not re.match(self.validation_patterns[ValidationType.PASSWORD], str(value)):
                raise ValueError("Password must be at least 12 characters with uppercase, lowercase, number, and special character")
        
        elif rule.type == ValidationType.JSON:
            try:
                if isinstance(value, str):
                    json.loads(value)
                else:
                    json.dumps(value)
            except (ValueError, TypeError):
                raise ValueError("Must be valid JSON")
        
        # Pattern validation
        if rule.pattern and isinstance(value, str):
            if not re.match(rule.pattern, value):
                raise ValueError("Format is invalid")
        
        # Allowed values validation
        if rule.allowed_values and value not in rule.allowed_values:
            raise ValueError(f"Must be one of: {', '.join(rule.allowed_values)}")
        
        return value
    
    def _sanitize_input(self, value: Any, input_type: ValidationType) -> Any:
        """Sanitize input value."""
        if not isinstance(value, str):
            return value
        
        # HTML sanitization
        if input_type in [ValidationType.STRING, ValidationType.EMAIL, ValidationType.URL]:
            value = html.escape(value)
        
        # Remove dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00', '\n', '\r', '\t']
        for char in dangerous_chars:
            value = value.replace(char, '')
        
        # SQL injection protection
        for pattern in self.dangerous_patterns:
            if re.search(pattern, value, re.IGNORECASE):
                logger.warning(f"Potentially dangerous input detected: {value[:100]}")
                value = re.sub(pattern, '', value, flags=re.IGNORECASE)
        
        return value
    
    def detect_threats(self, data: Union[str, Dict, List]) -> List[SecurityEvent]:
        """Detect potential threats in input data."""
        threats = []
        
        if isinstance(data, str):
            threats.extend(self._check_string_threats(data))
        elif isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str):
                    string_threats = self._check_string_threats(value)
                    for threat in string_threats:
                        threat.details['field'] = key
                        threats.append(threat)
        elif isinstance(data, list):
            for i, item in enumerate(data):
                if isinstance(item, str):
                    string_threats = self._check_string_threats(item)
                    for threat in string_threats:
                        threat.details['index'] = i
                        threats.append(threat)
        
        return threats
    
    def _check_string_threats(self, text: str) -> List[SecurityEvent]:
        """Check for threats in string input."""
        threats = []
        
        # Check for dangerous patterns
        for pattern in self.dangerous_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                threat_level = self._determine_threat_level(pattern)
                threats.append(SecurityEvent(
                    event_type="Dangerous Pattern Detected",
                    threat_level=threat_level,
                    source_ip="",  # Will be filled by middleware
                    endpoint="",  # Will be filled by middleware
                    method="",    # Will be filled by middleware
                    user_agent="", # Will be filled by middleware
                    timestamp=datetime.utcnow(),
                    details={
                        "pattern": pattern,
                        "sample": text[:100]
                    }
                ))
        
        return threats
    
    def _determine_threat_level(self, pattern: str) -> ThreatLevel:
        """Determine threat level based on pattern."""
        critical_patterns = ['<script', 'javascript:', 'eval(', 'exec(', 'xp_cmdshell']
        high_patterns = ['union select', 'drop table', 'delete from', 'insert into']
        medium_patterns = ['file_get_contents', 'fopen', '../', '..\\']
        
        pattern_lower = pattern.lower()
        
        if any(cp in pattern_lower for cp in critical_patterns):
            return ThreatLevel.CRITICAL
        elif any(hp in pattern_lower for hp in high_patterns):
            return ThreatLevel.HIGH
        elif any(mp in pattern_lower for mp in medium_patterns):
            return ThreatLevel.MEDIUM
        else:
            return ThreatLevel.LOW

class APIKeyManager:
    """API key management and validation."""
    
    def __init__(self, db: Session):
        self.db = db
        self.security = HTTPBearer()
    
    def generate_api_key(self, user_id: int, name: str, permissions: List[str]) -> str:
        """Generate new API key."""
        # Generate secure API key
        key_prefix = "nf_"
        key_secret = secrets.token_urlsafe(32)
        api_key = f"{key_prefix}{key_secret}"
        
        # Hash for storage
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Store in database (implementation depends on your models)
        # api_key_record = APIKey(
        #     user_id=user_id,
        #     name=name,
        #     key_hash=key_hash,
        #     permissions=permissions,
        #     created_at=datetime.utcnow(),
        #     expires_at=datetime.utcnow() + timedelta(days=365)
        # )
        # self.db.add(api_key_record)
        # self.db.commit()
        
        return api_key
    
    def validate_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """Validate API key and return user info."""
        if not api_key.startswith("nf_"):
            return None
        
        # Hash the key
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Check in database (implementation depends on your models)
        # api_key_record = self.db.query(APIKey).filter(
        #     APIKey.key_hash == key_hash,
        #     APIKey.is_active == True,
        #     APIKey.expires_at > datetime.utcnow()
        # ).first()
        
        # if api_key_record:
        #     return {
        #         "user_id": api_key_record.user_id,
        #         "permissions": api_key_record.permissions,
        #         "key_name": api_key_record.name
        #     }
        
        return None
    
    def revoke_api_key(self, api_key: str) -> bool:
        """Revoke API key."""
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Mark as inactive in database
        # api_key_record = self.db.query(APIKey).filter(
        #     APIKey.key_hash == key_hash
        # ).first()
        
        # if api_key_record:
        #     api_key_record.is_active = False
        #     api_key_record.revoked_at = datetime.utcnow()
        #     self.db.commit()
        #     return True
        
        return False

class RateLimiter:
    """API rate limiting."""
    
    def __init__(self):
        self.rate_limits = {
            'default': 100,      # requests per minute
            'auth': 5,           # auth endpoints
            'upload': 10,        # file uploads
            'search': 50,        # search endpoints
            'export': 20         # data export
        }
        self.request_counts: Dict[str, List[datetime]] = {}
    
    def is_rate_limited(self, key: str, endpoint: str) -> Tuple[bool, Dict[str, Any]]:
        """Check if request should be rate limited."""
        now = datetime.utcnow()
        window = timedelta(minutes=1)
        
        # Get appropriate rate limit
        if '/auth/' in endpoint:
            limit = self.rate_limits['auth']
        elif '/upload' in endpoint:
            limit = self.rate_limits['upload']
        elif '/search' in endpoint:
            limit = self.rate_limits['search']
        elif '/export' in endpoint:
            limit = self.rate_limits['export']
        else:
            limit = self.rate_limits['default']
        
        # Clean old requests
        if key not in self.request_counts:
            self.request_counts[key] = []
        
        self.request_counts[key] = [
            req_time for req_time in self.request_counts[key]
            if now - req_time < window
        ]
        
        # Check limit
        current_count = len(self.request_counts[key])
        if current_count >= limit:
            return True, {
                "limit": limit,
                "current": current_count,
                "reset_time": (now + window).isoformat()
            }
        
        # Add current request
        self.request_counts[key].append(now)
        return False, {}

class APISecurityMiddleware(BaseHTTPMiddleware):
    """API security middleware."""
    
    def __init__(self, app, db: Session):
        super().__init__(app)
        self.db = db
        self.validator = InputValidator()
        self.api_key_manager = APIKeyManager(db)
        self.rate_limiter = RateLimiter()
        self.security_events: List[SecurityEvent] = []
    
    async def dispatch(self, request: Request, call_next):
        """Process request with security checks."""
        start_time = datetime.utcnow()
        client_ip = self._get_client_ip(request)
        endpoint = request.url.path
        method = request.method
        user_agent = request.headers.get("user-agent", "")
        
        try:
            # API key validation for protected endpoints
            if self._requires_auth(endpoint):
                api_key_info = await self._validate_api_key(request)
                if not api_key_info:
                    await self._log_security_event(SecurityEvent(
                        event_type="Invalid API Key",
                        threat_level=ThreatLevel.MEDIUM,
                        source_ip=client_ip,
                        endpoint=endpoint,
                        method=method,
                        user_agent=user_agent,
                        timestamp=start_time,
                        details={"error": "Invalid or missing API key"},
                        blocked=True
                    ))
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid API key"
                    )
                
                request.state.user_info = api_key_info
            
            # Rate limiting
            rate_limit_key = f"{client_ip}:{endpoint}"
            is_limited, limit_info = self.rate_limiter.is_rate_limited(rate_limit_key, endpoint)
            
            if is_limited:
                await self._log_security_event(SecurityEvent(
                    event_type="Rate Limit Exceeded",
                    threat_level=ThreatLevel.MEDIUM,
                    source_ip=client_ip,
                    endpoint=endpoint,
                    method=method,
                    user_agent=user_agent,
                    timestamp=start_time,
                    details=limit_info,
                    blocked=True
                ))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded"
                )
            
            # Input validation for POST/PUT requests
            if method in ["POST", "PUT", "PATCH"]:
                await self._validate_request_input(request)
            
            # Process request
            response = await call_next(request)
            
            # Add security headers
            self._add_security_headers(response)
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            await self._log_security_event(SecurityEvent(
                event_type="Security Middleware Error",
                threat_level=ThreatLevel.LOW,
                source_ip=client_ip,
                endpoint=endpoint,
                method=method,
                user_agent=user_agent,
                timestamp=start_time,
                details={"error": str(e)},
                blocked=False
            ))
            raise
    
    def _requires_auth(self, endpoint: str) -> bool:
        """Check if endpoint requires authentication."""
        public_endpoints = [
            '/health',
            '/docs',
            '/openapi.json',
            '/auth/login',
            '/auth/register'
        ]
        return not any(endpoint.startswith(ep) for ep in public_endpoints)
    
    async def _validate_api_key(self, request: Request) -> Optional[Dict[str, Any]]:
        """Validate API key from request."""
        # Check Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            api_key = auth_header[7:]  # Remove "Bearer " prefix
            return self.api_key_manager.validate_api_key(api_key)
        
        # Check query parameter
        api_key = request.query_params.get("api_key")
        if api_key:
            return self.api_key_manager.validate_api_key(api_key)
        
        return None
    
    async def _validate_request_input(self, request: Request):
        """Validate and sanitize request input."""
        try:
            body = await request.body()
            if body:
                body_str = body.decode('utf-8', errors='ignore')
                
                # Parse JSON if applicable
                if 'application/json' in request.headers.get('content-type', ''):
                    try:
                        data = json.loads(body_str)
                        
                        # Detect threats
                        threats = self.validator.detect_threats(data)
                        for threat in threats:
                            threat.source_ip = self._get_client_ip(request)
                            threat.endpoint = request.url.path
                            threat.method = request.method
                            threat.user_agent = request.headers.get("user-agent", "")
                            threat.timestamp = datetime.utcnow()
                            
                            await self._log_security_event(threat)
                            
                            # Block critical threats
                            if threat.threat_level == ThreatLevel.CRITICAL:
                                threat.blocked = True
                                raise HTTPException(
                                    status_code=status.HTTP_400_BAD_REQUEST,
                                    detail="Dangerous input detected"
                                )
                    
                    except json.JSONDecodeError:
                        pass  # Not JSON, skip validation
                
        except Exception as e:
            logger.error(f"Input validation error: {e}")
    
    def _add_security_headers(self, response: Response):
        """Add security headers to response."""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address."""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    async def _log_security_event(self, event: SecurityEvent):
        """Log security event."""
        self.security_events.append(event)
        
        # Log to file/monitoring
        log_level = {
            ThreatLevel.SAFE: "info",
            ThreatLevel.LOW: "warning",
            ThreatLevel.MEDIUM: "warning",
            ThreatLevel.HIGH: "error",
            ThreatLevel.CRITICAL: "critical"
        }.get(event.threat_level, "info")
        
        getattr(logger, log_level)(
            f"Security Event: {event.event_type} from {event.source_ip} "
            f"at {event.timestamp} - {event.details}"
        )
    
    def get_security_summary(self) -> Dict[str, Any]:
        """Get security events summary."""
        total_events = len(self.security_events)
        blocked_events = len([e for e in self.security_events if e.blocked])
        
        threat_counts = {}
        for threat_level in ThreatLevel:
            threat_counts[threat_level.value] = len([
                e for e in self.security_events 
                if e.threat_level == threat_level
            ])
        
        return {
            "total_events": total_events,
            "blocked_events": blocked_events,
            "threat_levels": threat_counts,
            "recent_events": [
                {
                    "type": e.event_type,
                    "threat_level": e.threat_level.value,
                    "timestamp": e.timestamp.isoformat(),
                    "blocked": e.blocked
                }
                for e in self.security_events[-10:]
            ]
        }
