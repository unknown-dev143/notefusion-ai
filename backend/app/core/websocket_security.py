"""
WebSocket security middleware and utilities.
"""
import json
import logging
from typing import Any, Callable, Dict, Optional, List
from fastapi import WebSocket, WebSocketDisconnect, status
from jose import jwt, JWTError

from ..config import settings
from .validation import InputValidator

logger = logging.getLogger(__name__)

class WebSocketSecurity:
    """WebSocket security utilities and middleware."""
    
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.token_prefix = "Bearer "
    
    async def authenticate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate a JWT token.
        
        Args:
            token: The JWT token to authenticate
            
        Returns:
            Optional[Dict]: The decoded token payload if valid, None otherwise
        """
        if not token or not token.startswith(self.token_prefix):
            return None
            
        token = token[len(self.token_prefix):].strip()
        
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={"verify_aud": False}
            )
            return payload
        except JWTError as e:
            logger.warning(f"JWT validation failed: {str(e)}")
            return None
    
    async def get_websocket_user(
        self, 
        websocket: WebSocket,
        token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get the authenticated user from WebSocket connection.
        
        Args:
            websocket: The WebSocket connection
            token: Optional token to use for authentication
            
        Returns:
            Optional[Dict]: The authenticated user or None if not authenticated
        """
        # Try to get token from query parameters
        if not token:
            token = websocket.query_params.get("token")
        
        # Try to get token from headers
        if not token:
            auth_header = websocket.headers.get("authorization")
            if auth_header and auth_header.startswith(self.token_prefix):
                token = auth_header[len(self.token_prefix):].strip()
        
        if not token:
            return None
            
        return await self.authenticate_token(token)
    
    async def websocket_auth_required(
        self, 
        websocket: WebSocket,
        roles: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Require authentication for a WebSocket connection.
        
        Args:
            websocket: The WebSocket connection
            roles: Optional list of required roles
            
        Returns:
            Dict: The authenticated user
            
        Raises:
            WebSocketDisconnect: If authentication fails
        """
        user = await self.get_websocket_user(websocket)
        
        if not user:
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Authentication required"
            )
            raise WebSocketDisconnect()
        
        if roles and user.get("role") not in roles:
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Insufficient permissions"
            )
            raise WebSocketDisconnect()
            
        return user
    
    def validate_websocket_message(self, message: Any) -> bool:
        """
        Validate a WebSocket message.
        
        Args:
            message: The message to validate
            
        Returns:
            bool: True if the message is valid, False otherwise
        """
        if not isinstance(message, (str, bytes, dict)):
            return False
            
        try:
            # If message is bytes, decode to string
            if isinstance(message, bytes):
                message = message.decode("utf-8")
            
            # If message is string, try to parse as JSON
            if isinstance(message, str):
                message = json.loads(message)
            
            # Validate message structure
            if not isinstance(message, dict):
                return False
                
            # Basic validation of message fields
            if "type" not in message:
                return False
                
            # Sanitize message data
            message["data"] = InputValidator.sanitize_input(message.get("data", {}))
            
            return True
            
        except (json.JSONDecodeError, UnicodeDecodeError):
            return False
    
    async def websocket_rate_limit(
        self,
        websocket: WebSocket,
        user_id: str,
        max_messages: int = 100,
        time_window: int = 60
    ) -> bool:
        """
        Rate limit WebSocket messages.
        
        Args:
            websocket: The WebSocket connection
            user_id: The user ID for rate limiting
            max_messages: Maximum number of messages allowed in the time window
            time_window: Time window in seconds
            
        Returns:
            bool: True if rate limit is not exceeded, False otherwise
        """
        # Implementation would depend on your rate limiting strategy
        # This is a simplified example
        current_time = int(time.time())
        rate_key = f"ws_rate_limit:{user_id}"
        
        # In a real implementation, you would use Redis or similar
        # to track message counts and enforce rate limits
        
        return True

# Global instance
websocket_security = WebSocketSecurity(
    secret_key=settings.SECRET_KEY,
    algorithm=settings.ALGORITHM
)

# WebSocket manager with security
class WebSocketManager:
    """Manages WebSocket connections with security features."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        """Remove a WebSocket connection."""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: str, user_id: str):
        """Send a message to a specific user."""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_text(message)
    
    async def broadcast(self, message: str, exclude: Optional[List[str]] = None):
        """Broadcast a message to all connected users."""
        exclude = exclude or []
        for user_id, connection in self.active_connections.items():
            if user_id not in exclude:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error sending message to {user_id}: {str(e)}")
                    self.disconnect(user_id)

# Global WebSocket manager
websocket_manager = WebSocketManager()
