"""WebSocket server implementation."""
import json
import logging
from typing import Dict, List, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, client_id: str, user_id: str):
        """Register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(client_id)
        
        logger.info(f"Client connected: {client_id} (User: {user_id})")

    def disconnect(self, client_id: str, user_id: str):
        """Remove a WebSocket connection."""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(client_id)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        logger.info(f"Client disconnected: {client_id} (User: {user_id})")

    async def send_personal_message(self, message: dict, client_id: str):
        """Send a message to a specific client."""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")

    async def broadcast_to_user(self, message: dict, user_id: str, exclude_client_id: Optional[str] = None):
        """Send a message to all connections of a specific user."""
        if user_id in self.user_connections:
            for client_id in list(self.user_connections[user_id]):
                if client_id != exclude_client_id and client_id in self.active_connections:
                    try:
                        await self.active_connections[client_id].send_json(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting to {client_id}: {e}")

    async def broadcast(self, message: dict, exclude_client_id: Optional[str] = None):
        """Send a message to all connected clients."""
        for client_id, connection in list(self.active_connections.items()):
            if client_id != exclude_client_id:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {client_id}: {e}")

# Global connection manager
manager = ConnectionManager()

class WebSocketMessage(BaseModel):
    """Base WebSocket message model."""
    type: str
    payload: dict

async def websocket_endpoint(websocket: WebSocket, client_id: str, user_id: str):
    """Handle WebSocket connections."""
    await manager.connect(websocket, client_id, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Handle incoming WebSocket messages here
                logger.debug(f"Received message from {client_id}: {message}")
                
                # Example: Echo the message back
                response = WebSocketMessage(
                    type="echo",
                    payload={"message": "Message received", "original": message}
                )
                await manager.send_personal_message(response.dict(), client_id)
                
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from {client_id}")
                await websocket.send_json({
                    "type": "error",
                    "payload": {"error": "Invalid JSON format"}
                })
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {client_id}")
    finally:
        manager.disconnect(client_id, user_id)
