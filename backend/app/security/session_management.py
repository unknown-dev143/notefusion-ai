"""Advanced Session Management System."""
import secrets
import json
import logging
from typing import Dict, List, Optional, Any, Set
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from fastapi import HTTPException, status, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import redis
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class SessionStatus(Enum):
    """Session status types."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXPIRED = "expired"
    TERMINATED = "terminated"
    SUSPICIOUS = "suspicious"

@dataclass
class SessionData:
    """Session data structure."""
    session_id: str
    user_id: int
    created_at: datetime
    last_accessed: datetime
    expires_at: datetime
    ip_address: str
    user_agent: str
    device_info: Dict[str, str]
    location: Optional[str] = None
    is_active: bool = True
    security_flags: List[str] = None
    
    def __post_init__(self):
        if self.security_flags is None:
            self.security_flags = []

@dataclass
class SessionConfig:
    """Session configuration."""
    default_timeout_minutes: int = 30
    extended_timeout_minutes: int = 120
    max_concurrent_sessions: int = 5
    require_device_verification: bool = True
    track_location: bool = False
    auto_extend_on_activity: bool = True
    suspicious_activity_threshold: int = 3

class RedisSessionStore:
    """Redis-based session storage."""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        try:
            self.redis_client = redis.from_url(redis_url)
            self.redis_client.ping()  # Test connection
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
            # Fallback to in-memory storage
            self._memory_store = {}
    
    def store_session(self, session_data: SessionData) -> bool:
        """Store session data."""
        try:
            if self.redis_client:
                session_json = json.dumps(asdict(session_data), default=str)
                self.redis_client.setex(
                    f"session:{session_data.session_id}",
                    int((session_data.expires_at - datetime.utcnow()).total_seconds()),
                    session_json
                )
            else:
                # Fallback to memory
                self._memory_store[session_data.session_id] = session_data
            
            return True
        except Exception as e:
            logger.error(f"Failed to store session: {e}")
            return False
    
    def get_session(self, session_id: str) -> Optional[SessionData]:
        """Retrieve session data."""
        try:
            if self.redis_client:
                session_json = self.redis_client.get(f"session:{session_id}")
                if session_json:
                    session_dict = json.loads(session_json)
                    return SessionData(**session_dict)
            else:
                # Fallback to memory
                return self._memory_store.get(session_id)
            
            return None
        except Exception as e:
            logger.error(f"Failed to retrieve session: {e}")
            return None
    
    def update_session(self, session_data: SessionData) -> bool:
        """Update session data."""
        return self.store_session(session_data)
    
    def delete_session(self, session_id: str) -> bool:
        """Delete session."""
        try:
            if self.redis_client:
                self.redis_client.delete(f"session:{session_id}")
            else:
                # Fallback to memory
                self._memory_store.pop(session_id, None)
            
            return True
        except Exception as e:
            logger.error(f"Failed to delete session: {e}")
            return False
    
    def get_user_sessions(self, user_id: int) -> List[SessionData]:
        """Get all sessions for a user."""
        try:
            if self.redis_client:
                pattern = "session:*"
                keys = self.redis_client.keys(pattern)
                user_sessions = []
                
                for key in keys:
                    session_json = self.redis_client.get(key)
                    if session_json:
                        session_dict = json.loads(session_json)
                        if session_dict.get('user_id') == user_id:
                            user_sessions.append(SessionData(**session_dict))
                
                return user_sessions
            else:
                # Fallback to memory
                return [
                    session for session in self._memory_store.values()
                    if session.user_id == user_id
                ]
        except Exception as e:
            logger.error(f"Failed to get user sessions: {e}")
            return []
    
    def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions."""
        try:
            if self.redis_client:
                # Redis handles expiration automatically
                return 0
            else:
                # Fallback to memory cleanup
                now = datetime.utcnow()
                expired_sessions = [
                    session_id for session_id, session in self._memory_store.items()
                    if session.expires_at < now
                ]
                
                for session_id in expired_sessions:
                    del self._memory_store[session_id]
                
                return len(expired_sessions)
        except Exception as e:
            logger.error(f"Failed to cleanup expired sessions: {e}")
            return 0

class SessionManager:
    """Main session management service."""
    
    def __init__(self, config: SessionConfig, redis_url: str = "redis://localhost:6379"):
        self.config = config
        self.store = RedisSessionStore(redis_url)
        self.suspicious_activities: Dict[str, int] = {}
    
    def create_session(self, user_id: int, request: Request, 
                      device_info: Optional[Dict[str, str]] = None) -> SessionData:
        """Create new user session."""
        try:
            # Check concurrent session limit
            user_sessions = self.store.get_user_sessions(user_id)
            active_sessions = [
                s for s in user_sessions 
                if s.is_active and s.expires_at > datetime.utcnow()
            ]
            
            if len(active_sessions) >= self.config.max_concurrent_sessions:
                # Terminate oldest session
                oldest_session = min(active_sessions, key=lambda s: s.created_at)
                self.terminate_session(oldest_session.session_id)
            
            # Generate session ID
            session_id = secrets.token_urlsafe(32)
            
            # Get request information
            client_ip = self._get_client_ip(request)
            user_agent = request.headers.get("user-agent", "")
            
            # Parse device info
            if not device_info:
                device_info = self._parse_user_agent(user_agent)
            
            # Create session data
            session_data = SessionData(
                session_id=session_id,
                user_id=user_id,
                created_at=datetime.utcnow(),
                last_accessed=datetime.utcnow(),
                expires_at=datetime.utcnow() + timedelta(minutes=self.config.default_timeout_minutes),
                ip_address=client_ip,
                user_agent=user_agent,
                device_info=device_info,
                location=self._get_location_from_ip(client_ip) if self.config.track_location else None
            )
            
            # Store session
            if not self.store.store_session(session_data):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create session"
                )
            
            logger.info(f"Created session {session_id} for user {user_id}")
            return session_data
            
        except Exception as e:
            logger.error(f"Failed to create session: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Session creation failed"
            )
    
    def validate_session(self, session_id: str, request: Request) -> Optional[SessionData]:
        """Validate and update session."""
        try:
            session_data = self.store.get_session(session_id)
            
            if not session_data:
                return None
            
            # Check if session is expired
            if datetime.utcnow() > session_data.expires_at:
                session_data.is_active = False
                self.store.update_session(session_data)
                return None
            
            # Check for suspicious activity
            current_ip = self._get_client_ip(request)
            current_user_agent = request.headers.get("user-agent", "")
            
            if self._is_suspicious_activity(session_data, current_ip, current_user_agent):
                self._flag_suspicious_activity(session_id)
                session_data.security_flags.append("suspicious_activity")
                session_data.is_active = False
                self.store.update_session(session_data)
                return None
            
            # Update last accessed time
            session_data.last_accessed = datetime.utcnow()
            
            # Auto-extend session if enabled
            if self.config.auto_extend_on_activity:
                session_data.expires_at = datetime.utcnow() + timedelta(minutes=self.config.default_timeout_minutes)
            
            self.store.update_session(session_data)
            return session_data
            
        except Exception as e:
            logger.error(f"Failed to validate session: {e}")
            return None
    
    def terminate_session(self, session_id: str) -> bool:
        """Terminate specific session."""
        try:
            session_data = self.store.get_session(session_id)
            if session_data:
                session_data.is_active = False
                session_data.expires_at = datetime.utcnow()
                self.store.update_session(session_data)
            
            return self.store.delete_session(session_id)
        except Exception as e:
            logger.error(f"Failed to terminate session: {e}")
            return False
    
    def terminate_all_user_sessions(self, user_id: int, except_session: Optional[str] = None) -> int:
        """Terminate all sessions for a user."""
        try:
            user_sessions = self.store.get_user_sessions(user_id)
            terminated_count = 0
            
            for session in user_sessions:
                if session.session_id != except_session:
                    if self.terminate_session(session.session_id):
                        terminated_count += 1
            
            logger.info(f"Terminated {terminated_count} sessions for user {user_id}")
            return terminated_count
        except Exception as e:
            logger.error(f"Failed to terminate user sessions: {e}")
            return 0
    
    def extend_session(self, session_id: str, minutes: int = None) -> bool:
        """Extend session expiration."""
        try:
            session_data = self.store.get_session(session_id)
            if not session_data or not session_data.is_active:
                return False
            
            extend_minutes = minutes or self.config.extended_timeout_minutes
            session_data.expires_at = datetime.utcnow() + timedelta(minutes=extend_minutes)
            session_data.last_accessed = datetime.utcnow()
            
            return self.store.update_session(session_data)
        except Exception as e:
            logger.error(f"Failed to extend session: {e}")
            return False
    
    def get_user_sessions_info(self, user_id: int) -> List[Dict[str, Any]]:
        """Get user sessions with security info."""
        try:
            sessions = self.store.get_user_sessions(user_id)
            sessions_info = []
            
            for session in sessions:
                session_info = {
                    "session_id": session.session_id,
                    "created_at": session.created_at.isoformat(),
                    "last_accessed": session.last_accessed.isoformat(),
                    "expires_at": session.expires_at.isoformat(),
                    "ip_address": session.ip_address,
                    "device_info": session.device_info,
                    "location": session.location,
                    "is_active": session.is_active,
                    "security_flags": session.security_flags,
                    "status": self._get_session_status(session)
                }
                sessions_info.append(session_info)
            
            return sessions_info
        except Exception as e:
            logger.error(f"Failed to get user sessions info: {e}")
            return []
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address."""
        # Check for forwarded headers
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _parse_user_agent(self, user_agent: str) -> Dict[str, str]:
        """Parse user agent string for device info."""
        device_info = {
            "browser": "Unknown",
            "os": "Unknown",
            "device": "Unknown"
        }
        
        user_agent_lower = user_agent.lower()
        
        # Detect browser
        if "chrome" in user_agent_lower:
            device_info["browser"] = "Chrome"
        elif "firefox" in user_agent_lower:
            device_info["browser"] = "Firefox"
        elif "safari" in user_agent_lower:
            device_info["browser"] = "Safari"
        elif "edge" in user_agent_lower:
            device_info["browser"] = "Edge"
        elif "opera" in user_agent_lower:
            device_info["browser"] = "Opera"
        
        # Detect OS
        if "windows" in user_agent_lower:
            device_info["os"] = "Windows"
        elif "mac" in user_agent_lower:
            device_info["os"] = "macOS"
        elif "linux" in user_agent_lower:
            device_info["os"] = "Linux"
        elif "android" in user_agent_lower:
            device_info["os"] = "Android"
        elif "ios" in user_agent_lower:
            device_info["os"] = "iOS"
        
        # Detect device type
        if "mobile" in user_agent_lower:
            device_info["device"] = "Mobile"
        elif "tablet" in user_agent_lower:
            device_info["device"] = "Tablet"
        else:
            device_info["device"] = "Desktop"
        
        return device_info
    
    def _get_location_from_ip(self, ip: str) -> Optional[str]:
        """Get location from IP address."""
        try:
            # Use IP geolocation service (e.g., ip-api.com, maxmind)
            # For now, return None
            return None
        except Exception:
            return None
    
    def _is_suspicious_activity(self, session: SessionData, current_ip: str, 
                               current_user_agent: str) -> bool:
        """Check for suspicious activity patterns."""
        # IP address change
        if session.ip_address != current_ip:
            return True
        
        # User agent change
        if session.user_agent != current_user_agent:
            return True
        
        # Check for rapid session creation
        recent_sessions = self.store.get_user_sessions(session.user_id)
        recent_active = [
            s for s in recent_sessions 
            if s.created_at > datetime.utcnow() - timedelta(minutes=5)
        ]
        
        if len(recent_active) > 2:
            return True
        
        return False
    
    def _flag_suspicious_activity(self, session_id: str):
        """Flag suspicious activity."""
        self.suspicious_activities[session_id] = self.suspicious_activities.get(session_id, 0) + 1
        
        if self.suspicious_activities[session_id] >= self.config.suspicious_activity_threshold:
            logger.warning(f"Suspicious activity threshold reached for session {session_id}")
    
    def _get_session_status(self, session: SessionData) -> SessionStatus:
        """Get session status."""
        if not session.is_active:
            return SessionStatus.TERMINATED
        
        if datetime.utcnow() > session.expires_at:
            return SessionStatus.EXPIRED
        
        if "suspicious_activity" in session.security_flags:
            return SessionStatus.SUSPICIOUS
        
        if (datetime.utcnow() - session.last_accessed).total_seconds() > 3600:  # 1 hour
            return SessionStatus.INACTIVE
        
        return SessionStatus.ACTIVE
    
    def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions."""
        return self.store.cleanup_expired_sessions()
    
    def get_session_statistics(self) -> Dict[str, Any]:
        """Get session statistics."""
        try:
            # This would need to be implemented based on your storage backend
            return {
                "total_sessions": 0,
                "active_sessions": 0,
                "expired_sessions": 0,
                "suspicious_sessions": len(self.suspicious_activities),
                "last_cleanup": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to get session statistics: {e}")
            return {}

class SessionMiddleware(BaseHTTPMiddleware):
    """Session management middleware."""
    
    def __init__(self, app, session_manager: SessionManager, session_cookie_name: str = "session_id"):
        super().__init__(app)
        self.session_manager = session_manager
        self.session_cookie_name = session_cookie_name
    
    async def dispatch(self, request: Request, call_next):
        """Process request with session management."""
        # Get session ID from cookie
        session_id = request.cookies.get(self.session_cookie_name)
        
        if session_id:
            # Validate session
            session_data = self.session_manager.validate_session(session_id, request)
            if session_data:
                # Add session to request state
                request.state.session = session_data
                request.state.user_id = session_data.user_id
            else:
                # Clear invalid session cookie
                response = await call_next(request)
                response.delete_cookie(self.session_cookie_name)
                return response
        
        # Process request
        response = await call_next(request)
        
        # Add session cookie if new session was created
        if hasattr(request.state, 'session') and request.state.session:
            session_data = request.state.session
            response.set_cookie(
                key=self.session_cookie_name,
                value=session_data.session_id,
                expires=session_data.expires_at,
                httponly=True,
                secure=True,
                samesite="strict"
            )
        
        return response
