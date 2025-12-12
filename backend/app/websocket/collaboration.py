"""
WebSocket server for real-time collaboration
"""

import asyncio
import json
import logging
from typing import Dict, List, Set, Optional, Any
from datetime import datetime, timezone
from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from ..core.database import get_db
from ..models.user import User
from ..core.security import decode_access_token

logger = logging.getLogger(__name__)

# Connection manager for collaboration sessions
class CollaborationManager:
    def __init__(self):
        # session_id -> {user_id: WebSocket}
        self.sessions: Dict[str, Dict[str, WebSocket]] = {}
        # session_id -> set of user_ids
        self.session_users: Dict[str, Set[str]] = {}
        # user_id -> session_id
        self.user_sessions: Dict[str, str] = {}
        # session_id -> session data
        self.session_data: Dict[str, Dict[str, Any]] = {}
        # WebSocket -> user_id
        self.ws_users: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, session_id: str, token: str):
        """Connect a user to a collaboration session"""
        try:
            # Verify token and get user
            user = await self.authenticate_user(token)
            if not user:
                await websocket.close(code=4001, reason="Invalid token")
                return False

            user_id = str(user.id)
            
            # Initialize session if it doesn't exist
            if session_id not in self.sessions:
                self.sessions[session_id] = {}
                self.session_users[session_id] = set()
                self.session_data[session_id] = {
                    'created_at': datetime.now(timezone.utc).isoformat(),
                    'last_activity': datetime.now(timezone.utc).isoformat(),
                    'document_content': '',
                    'operations': [],
                    'users': {}
                }

            # Check if user is already connected
            if user_id in self.sessions[session_id]:
                # Disconnect existing connection
                existing_ws = self.sessions[session_id][user_id]
                await existing_ws.close(code=4000, reason="New connection")
                del self.sessions[session_id][user_id]

            # Add user to session
            self.sessions[session_id][user_id] = websocket
            self.session_users[session_id].add(user_id)
            self.user_sessions[user_id] = session_id
            self.ws_users[websocket] = user_id

            # Update session data
            self.session_data[session_id]['users'][user_id] = {
                'id': user_id,
                'name': user.full_name or user.email,
                'email': user.email,
                'joined_at': datetime.now(timezone.utc).isoformat(),
                'cursor': {'position': 0},
                'is_online': True
            }

            # Send session state to new user
            await self.send_session_state(websocket, session_id, user_id)

            # Notify other users
            await self.broadcast_to_session(session_id, {
                'type': 'user_joined',
                'user': self.session_data[session_id]['users'][user_id],
                'timestamp': datetime.now(timezone.utc).isoformat()
            }, exclude_user=user_id)

            logger.info(f"User {user_id} connected to session {session_id}")
            return True

        except Exception as e:
            logger.error(f"Error connecting user to session: {e}")
            await websocket.close(code=4000, reason="Connection error")
            return False

    async def disconnect(self, websocket: WebSocket):
        """Disconnect a user from their session"""
        user_id = self.ws_users.get(websocket)
        if not user_id:
            return

        session_id = self.user_sessions.get(user_id)
        if not session_id:
            return

        # Remove from session
        if session_id in self.sessions and user_id in self.sessions[session_id]:
            del self.sessions[session_id][user_id]
            self.session_users[session_id].discard(user_id)

        # Update user status
        if session_id in self.session_data and user_id in self.session_data[session_id]['users']:
            self.session_data[session_id]['users'][user_id]['is_online'] = False
            self.session_data[session_id]['users'][user_id]['left_at'] = datetime.now(timezone.utc).isoformat()

        # Clean up mappings
        del self.user_sessions[user_id]
        del self.ws_users[websocket]

        # Notify other users
        await self.broadcast_to_session(session_id, {
            'type': 'user_left',
            'user_id': user_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })

        # Clean up empty session
        if len(self.sessions[session_id]) == 0:
            await self.cleanup_session(session_id)

        logger.info(f"User {user_id} disconnected from session {session_id}")

    async def handle_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """Handle incoming message from user"""
        user_id = self.ws_users.get(websocket)
        if not user_id:
            return

        session_id = self.user_sessions.get(user_id)
        if not session_id:
            return

        message_type = message.get('type')
        timestamp = datetime.now(timezone.utc).isoformat()

        # Update last activity
        self.session_data[session_id]['last_activity'] = timestamp

        if message_type == 'operation':
            await self.handle_operation(session_id, user_id, message, timestamp)
        elif message_type == 'cursor_update':
            await self.handle_cursor_update(session_id, user_id, message, timestamp)
        elif message_type == 'message':
            await self.handle_chat_message(session_id, user_id, message, timestamp)
        elif message_type == 'typing':
            await self.handle_typing_indicator(session_id, user_id, message, timestamp)
        else:
            logger.warning(f"Unknown message type: {message_type}")

    async def handle_operation(self, session_id: str, user_id: str, message: Dict[str, Any], timestamp: str):
        """Handle document operation (insert, delete, format)"""
        operation = {
            'id': f"op_{timestamp}_{user_id}",
            'user_id': user_id,
            'type': message.get('operation_type'),
            'position': message.get('position'),
            'content': message.get('content'),
            'length': message.get('length'),
            'attributes': message.get('attributes', {}),
            'timestamp': timestamp
        }

        # Apply operation to document
        await self.apply_operation(session_id, operation)

        # Store operation
        self.session_data[session_id]['operations'].append(operation)

        # Broadcast to other users
        await self.broadcast_to_session(session_id, {
            'type': 'operation',
            'operation': operation,
            'timestamp': timestamp
        }, exclude_user=user_id)

    async def handle_cursor_update(self, session_id: str, user_id: str, message: Dict[str, Any], timestamp: str):
        """Handle cursor position update"""
        cursor_data = {
            'position': message.get('position', 0),
            'selection': message.get('selection'),
            'timestamp': timestamp
        }

        # Update cursor in session data
        if session_id in self.session_data and user_id in self.session_data[session_id]['users']:
            self.session_data[session_id]['users'][user_id]['cursor'] = cursor_data

        # Broadcast to other users
        await self.broadcast_to_session(session_id, {
            'type': 'cursor_update',
            'user_id': user_id,
            'cursor': cursor_data,
            'timestamp': timestamp
        }, exclude_user=user_id)

    async def handle_chat_message(self, session_id: str, user_id: str, message: Dict[str, Any], timestamp: str):
        """Handle chat message"""
        chat_message = {
            'id': f"msg_{timestamp}_{user_id}",
            'user_id': user_id,
            'content': message.get('content', ''),
            'type': message.get('message_type', 'text'),
            'timestamp': timestamp
        }

        # Broadcast to all users in session
        await self.broadcast_to_session(session_id, {
            'type': 'message',
            'message': chat_message,
            'timestamp': timestamp
        })

    async def handle_typing_indicator(self, session_id: str, user_id: str, message: Dict[str, Any], timestamp: str):
        """Handle typing indicator"""
        is_typing = message.get('is_typing', False)

        # Update typing status
        if session_id in self.session_data and user_id in self.session_data[session_id]['users']:
            self.session_data[session_id]['users'][user_id]['is_typing'] = is_typing

        # Broadcast to other users
        await self.broadcast_to_session(session_id, {
            'type': 'typing',
            'user_id': user_id,
            'is_typing': is_typing,
            'timestamp': timestamp
        }, exclude_user=user_id)

    async def apply_operation(self, session_id: str, operation: Dict[str, Any]):
        """Apply operation to document content"""
        if session_id not in self.session_data:
            return

        content = self.session_data[session_id]['document_content']
        op_type = operation.get('type')
        position = operation.get('position', 0)

        if op_type == 'insert':
            insert_content = operation.get('content', '')
            self.session_data[session_id]['document_content'] = (
                content[:position] + insert_content + content[position:]
            )
        elif op_type == 'delete':
            length = operation.get('length', 0)
            self.session_data[session_id]['document_content'] = (
                content[:position] + content[position + length:]
            )
        elif op_type == 'format':
            # Format operations would need more complex handling
            # For now, just store the operation
            pass

    async def send_session_state(self, websocket: WebSocket, session_id: str, user_id: str):
        """Send current session state to a user"""
        if session_id not in self.session_data:
            return

        session_data = self.session_data[session_id]
        
        await websocket.send_json({
            'type': 'session_state',
            'session_id': session_id,
            'document_content': session_data['document_content'],
            'users': session_data['users'],
            'recent_operations': session_data['operations'][-50:],  # Last 50 operations
            'timestamp': datetime.now(timezone.utc).isoformat()
        })

    async def broadcast_to_session(self, session_id: str, message: Dict[str, Any], exclude_user: Optional[str] = None):
        """Broadcast message to all users in a session"""
        if session_id not in self.sessions:
            return

        disconnected_users = []
        
        for user_id, websocket in self.sessions[session_id].items():
            if exclude_user and user_id == exclude_user:
                continue

            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                disconnected_users.append(user_id)

        # Clean up disconnected users
        for user_id in disconnected_users:
            await self.disconnect(self.sessions[session_id][user_id])

    async def cleanup_session(self, session_id: str):
        """Clean up empty session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
        if session_id in self.session_users:
            del self.session_users[session_id]
        if session_id in self.session_data:
            del self.session_data[session_id]

        logger.info(f"Cleaned up session {session_id}")

    async def authenticate_user(self, token: str) -> Optional[User]:
        """Authenticate user from JWT token"""
        try:
            payload = decode_access_token(token)
            if not payload:
                return None

            user_id = payload.get('sub')
            if not user_id:
                return None

            # Get user from database
            db = next(get_db())
            user = db.query(User).filter(User.id == user_id).first()
            db.close()

            return user
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None

    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session information"""
        if session_id not in self.session_data:
            return None

        return {
            'session_id': session_id,
            'user_count': len(self.session_users.get(session_id, set())),
            'created_at': self.session_data[session_id]['created_at'],
            'last_activity': self.session_data[session_id]['last_activity'],
            'users': list(self.session_data[session_id]['users'].values())
        }

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """Get information about all active sessions"""
        return [
            self.get_session_info(session_id)
            for session_id in self.session_data.keys()
        ]

# Global collaboration manager
collaboration_manager = CollaborationManager()

# WebSocket endpoint handler
async def websocket_collaboration(websocket: WebSocket, session_id: str, token: str):
    """Handle WebSocket connection for collaboration"""
    await websocket.accept()

    # Connect user to session
    connected = await collaboration_manager.connect(websocket, session_id, token)
    if not connected:
        return

    try:
        # Handle messages
        while True:
            try:
                message = await websocket.receive_json()
                await collaboration_manager.handle_message(websocket, message)
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error handling message: {e}")
                await websocket.send_json({
                    'type': 'error',
                    'message': 'Error processing message',
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })

    except WebSocketDisconnect:
        pass
    finally:
        # Clean up connection
        await collaboration_manager.disconnect(websocket)
