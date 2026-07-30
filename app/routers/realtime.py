"""
app/routers/realtime.py
------------------------
WebSocket-based real-time collaboration router for NoteFusion AI.
Authenticates clients, tracks active user sessions per note,
synchronizes changes via the CRDT resolver, and updates the database.
"""

import json
import logging
import time
from typing import Dict, Set, Any, List, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User
from app.models.note import Note
from app.utils.crdt import CRDTResolver

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/realtime", tags=["collaboration"])

class CollaborationRoom:
    def __init__(self, note_id: int, initial_title: str, initial_content: str):
        self.note_id = note_id
        self.connections: Set[WebSocket] = set()
        
        # Initialize in-memory CRDT states from database values
        self.title_state = {
            "value": initial_title,
            "timestamp": time.time(),
            "client_id": "server"
        }
        
        # Convert initial plain text content to character-level CRDT state
        self.content_state = [
            {
                "id": f"0.{i:05d}",
                "value": char,
                "timestamp": time.time(),
                "client_id": "server",
                "deleted": False
            }
            for i, char in enumerate(initial_content or "")
        ]

    def merge_update(self, title_update: Optional[Dict[str, Any]], content_update: Optional[List[Dict[str, Any]]]):
        if title_update:
            self.title_state = CRDTResolver.merge_titles(self.title_state, title_update)
        if content_update:
            self.content_state = CRDTResolver.merge_text_states(self.content_state, content_update)

    def get_current_text(self) -> str:
        return CRDTResolver.state_to_text(self.content_state)

    def get_current_title(self) -> str:
        return self.title_state["value"]

    def to_sync_message(self) -> str:
        return json.dumps({
            "type": "SYNC_STATE",
            "note_id": self.note_id,
            "title": self.title_state,
            "content": self.content_state
        })


class CollaborationManager:
    def __init__(self):
        self.rooms: Dict[int, CollaborationRoom] = {}

    async def get_or_create_room(self, note_id: int, db: AsyncSession) -> CollaborationRoom:
        if note_id not in self.rooms:
            # Load note from database
            result = await db.execute(select(Note).filter(Note.id == note_id))
            note = result.scalars().first()
            if not note:
                raise ValueError(f"Note with ID {note_id} not found")
            self.rooms[note_id] = CollaborationRoom(note_id, note.title, note.content or "")
        return self.rooms[note_id]

    async def connect(self, note_id: int, websocket: WebSocket, db: AsyncSession) -> CollaborationRoom:
        room = await self.get_or_create_room(note_id, db)
        await websocket.accept()
        room.connections.add(websocket)
        logger.info(f"WebSocket connected to Note Room {note_id}. Total users in room: {len(room.connections)}")
        return room

    def disconnect(self, note_id: int, websocket: WebSocket):
        if note_id in self.rooms:
            room = self.rooms[note_id]
            if websocket in room.connections:
                room.connections.remove(websocket)
            logger.info(f"WebSocket disconnected from Note Room {note_id}. Remaining: {len(room.connections)}")
            if not room.connections:
                # Clean up empty rooms to conserve memory
                del self.rooms[note_id]
                logger.info(f"Note Room {note_id} closed as it has no active connections")

    async def broadcast(self, note_id: int, message: str, exclude_websocket: Optional[WebSocket] = None):
        if note_id in self.rooms:
            room = self.rooms[note_id]
            for connection in list(room.connections):
                if connection == exclude_websocket:
                    continue
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.warning(f"Error broadcasting to connection in room {note_id}: {e}")
                    self.disconnect(note_id, connection)


manager = CollaborationManager()


async def get_ws_user(token: Optional[str] = Query(None), db: AsyncSession = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = verify_token(token)
        if not payload or payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        result = await db.execute(select(User).filter(User.username == user_id))
        user = result.scalars().first()
        if not user:
            try:
                user_id_int = int(user_id)
                result = await db.execute(select(User).filter(User.id == user_id_int))
                user = result.scalars().first()
            except ValueError:
                pass
        return user
    except Exception as e:
        logger.error(f"WebSocket auth error: {e}")
        return None


@router.websocket("/{note_id}")
async def sync_note_endpoint(
    websocket: WebSocket,
    note_id: int,
    token: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    # Authenticate the user connection
    user = await get_ws_user(token, db)
    if not user:
        # In demo-mode, permit unauthenticated connections with a mock user
        logger.info(f"WebSocket connection for room {note_id} lacks auth; allowing in Demo/Scholar mode.")
        client_name = "guest"
    else:
        client_name = user.username

    try:
        room = await manager.connect(note_id, websocket, db)
    except ValueError as e:
        logger.warning(f"WebSocket connection rejected: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Send initial CRDT document state to client
    await websocket.send_text(room.to_sync_message())

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                msg_type = msg.get("type")

                if msg_type == "EDIT":
                    # Extract client updates
                    title_update = msg.get("title")
                    content_update = msg.get("content")

                    # Merge client updates with in-memory CRDT state
                    room.merge_update(title_update, content_update)

                    # Update database content
                    result = await db.execute(select(Note).filter(Note.id == note_id))
                    note = result.scalars().first()
                    if note:
                        note.title = room.get_current_title()
                        note.content = room.get_current_text()
                        await db.commit()

                    # Broadcast the new state to all other room members
                    await manager.broadcast(note_id, room.to_sync_message(), exclude_websocket=websocket)

                elif msg_type == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))

            except json.JSONDecodeError:
                logger.warning(f"WebSocket client {client_name} sent invalid JSON")
            except Exception as e:
                logger.error(f"Error handling collaboration message: {e}", exc_info=True)

    except WebSocketDisconnect:
        manager.disconnect(note_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error in room {note_id} for user {client_name}: {e}")
        manager.disconnect(note_id, websocket)
