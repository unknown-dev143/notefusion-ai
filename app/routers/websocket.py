from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List, Any
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected. Total active: {len(self.active_connections)}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected. Total active: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                logger.info(f"Received message from {client_id}: {message}")
                
                # Echo or handle specific message types
                if message.get("type") == "AUTH":
                    await websocket.send_text(json.dumps({
                        "type": "AUTH_SUCCESS",
                        "client_id": client_id,
                        "message": "Neural synchronization established"
                    }))
                else:
                    # Generic response
                    await websocket.send_text(json.dumps({
                        "type": "PONG",
                        "data": message
                    }))
            except json.JSONDecodeError:
                logger.warning(f"Received non-JSON data from {client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error for {client_id}: {e}")
        manager.disconnect(client_id)

@router.websocket("/notifications")
async def notifications_websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("Notifications WebSocket connected")
    try:
        while True:
            # Keep connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info("Notifications WebSocket disconnected")
    except Exception as e:
        logger.error(f"Notifications WebSocket error: {e}")
