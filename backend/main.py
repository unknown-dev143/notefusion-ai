import os
import uuid
import tempfile
import json
import time
from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Dict, Optional
from datetime import timedelta

import sys
import os
sys.path.append(os.path.dirname(__file__))
import schemas
import auth
from routers import users
from database import engine, get_db
from config import settings

# Import models after database setup
from models import User, Note, Base

# Create database tables
Base.metadata.create_all(bind=engine)

# Import other modules after database initialization
from transcription import transcribe_chunk, extract_text_from_pdf
from fusion_engine import generate_fused_notes
from export_utils import markdown_to_pdf

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, str] = {}  # user_id -> client_id

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"Client connected: {client_id}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            # Remove from user_connections if exists
            user_id = next((uid for uid, cid in self.user_connections.items() if cid == client_id), None)
            if user_id:
                del self.user_connections[user_id]
        print(f"Client disconnected: {client_id}")

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

    async def authenticate_user(self, client_id: str, user_id: str):
        self.user_connections[user_id] = client_id
        print(f"User {user_id} authenticated with client {client_id}")

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.user_connections:
            client_id = self.user_connections[user_id]
            if client_id in self.active_connections:
                await self.active_connections[client_id].send_text(json.dumps(message))

app = FastAPI()

# CORS middleware configuration
# List of allowed origins (frontend URLs)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "ws://localhost:3000",
    "ws://127.0.0.1:3000",
    "ws://localhost:5173",
    "ws://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):(3000|5173|8000)$"
)

# Include routers
app.include_router(users.router)

# Initialize WebSocket manager
websocket_manager = ConnectionManager()

SESSIONS = {}

@app.get("/")
def read_root():
    return {"message": "Backend is working!"}

@app.post("/upload-files")
async def upload_files(
    module_code: str = Form(...),
    chapters: str = Form(...),
    detail_level: str = Form("standard"),
    files: List[UploadFile] = File(...),
    session_id: str = Form(None),
):
    if not session_id:
        session_id = str(uuid.uuid4())
    if session_id not in SESSIONS:
        SESSIONS[session_id] = {"transcript": "", "textbook": "", "diagrams": []}

    for f in files:
        ext = os.path.splitext(f.filename)[1].lower()
        content = await f.read()
        if ext == ".pdf":
            text = extract_text_from_pdf(content)
            SESSIONS[session_id]["transcript"] += f"\n\n[Lecture from PDF: {f.filename}]\n" + text
        elif ext in [".mp4", ".mkv", ".wav", ".mp3"]:
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(content)
                tmp.flush()
                text = transcribe_chunk(tmp.name)
                SESSIONS[session_id]["transcript"] += f"\n\n[Lecture from Audio: {f.filename}]\n" + text
        else:
            try:
                SESSIONS[session_id]["transcript"] += content.decode("utf-8", errors="ignore")
            except:
                continue

    notes = generate_fused_notes(
        module_code=module_code,
        chapters=chapters,
        lecture_transcript=SESSIONS[session_id]["transcript"],
        textbook_content=SESSIONS[session_id].get("textbook", ""),
        detail_level=detail_level,
    )
    return {"session_id": session_id, "notes": notes}

@app.post("/transcribe-chunk")
async def chunk_transcribe(chunk: UploadFile = File(...), session_id: str = Form(...)):
    if session_id not in SESSIONS:
        SESSIONS[session_id] = {"transcript": "", "textbook": "", "diagrams": []}
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        content = await chunk.read()
        tmp.write(content)
        tmp.flush()
        text = transcribe_chunk(tmp.name)
        SESSIONS[session_id]["transcript"] += f"\n[Live audio chunk]\n" + text
    return {"transcript": text, "full_transcript": SESSIONS[session_id]["transcript"]}

@app.post("/add-textbook")
async def add_textbook(session_id: str = Form(...), textbook_excerpt: str = Form(...)):
    if session_id not in SESSIONS:
        return {"error": "invalid session"}
    SESSIONS[session_id]["textbook"] = textbook_excerpt
    return {"status": "added"}

@app.post("/generate-notes")
async def generate_notes(session_id: str = Form(...), module_code: str = Form(...), chapters: str = Form(...), detail_level: str = Form("standard")):
    session = SESSIONS.get(session_id)
    if not session:
        return {"error": "session not found"}
    notes = generate_fused_notes(
        module_code=module_code,
        chapters=chapters,
        lecture_transcript=session.get("transcript", ""),
        textbook_content=session.get("textbook", ""),
        detail_level=detail_level,
    )
    return {"notes": notes}

@app.post("/export")
async def export_notes(session_id: str = Form(...), module_code: str = Form(...), chapters: str = Form(...), format: str = Form("pdf")):
    session = SESSIONS.get(session_id)
    if not session:
        return {"error": "session not found"}
    notes = generate_fused_notes(
        module_code=module_code,
        chapters=chapters,
        lecture_transcript=session.get("transcript", ""),
        textbook_content=session.get("textbook", ""),
        detail_level="standard",
    )
    if format == "pdf":
        out_path = f"/tmp/{session_id}.pdf"
        markdown_to_pdf(notes, out_path)
        return {"pdf_path": out_path}
    else:
        return {"markdown": notes}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    # Accept the WebSocket connection
    await websocket.accept()
    
    # Send initial connection message
    try:
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "message": "WebSocket connection established",
            "client_id": client_id,
            "timestamp": int(time.time() * 1000)
        })
    except Exception as e:
        print(f"Error sending initial message to {client_id}: {e}")
        return
    
    # Add to connection manager
    await websocket_manager.connect(websocket, client_id)
    
    try:
        while True:
            # Receive message from client
            try:
                data = await websocket.receive_text()
                
                # Parse the message
                try:
                    message = json.loads(data)
                    message_type = message.get('type')
                    
                    # Handle authentication
                    if message_type == 'AUTH':
                        token = message.get('token')
                        user_id = message.get('user_id', 'anonymous')
                        
                        # In a real app, validate the token here
                        if token:
                            await websocket_manager.authenticate_user(client_id, user_id)
                            await websocket_manager.send_personal_message(
                                json.dumps({
                                    'type': 'AUTH_SUCCESS',
                                    'message': 'Authentication successful',
                                    'user_id': user_id,
                                    'client_id': client_id,
                                    'timestamp': int(time.time() * 1000)
                                }),
                                client_id
                            )
                        else:
                            await websocket_manager.send_personal_message(
                                json.dumps({
                                    'type': 'AUTH_ERROR',
                                    'message': 'Authentication failed: No token provided',
                                    'timestamp': int(time.time() * 1000)
                                }),
                                client_id
                            )
                    
                    # Handle ping/pong for keep-alive
                    elif message_type == 'PING':
                        await websocket_manager.send_personal_message(
                            json.dumps({
                                'type': 'PONG',
                                'timestamp': message.get('timestamp', int(time.time() * 1000)),
                                'original_timestamp': message.get('timestamp')
                            }),
                            client_id
                        )
                    
                    # Echo back other messages for testing
                    else:
                        await websocket_manager.send_personal_message(
                            json.dumps({
                                'type': 'ECHO',
                                'message': 'Message received',
                                'your_message': message,
                                'timestamp': int(time.time() * 1000)
                            }),
                            client_id
                        )
                        
                except json.JSONDecodeError as e:
                    error_msg = f"Invalid JSON format: {str(e)}"
                    print(f"{error_msg} from client {client_id}")
                    await websocket_manager.send_personal_message(
                        json.dumps({
                            'type': 'ERROR',
                            'message': 'Invalid message format',
                            'error': error_msg,
                            'timestamp': int(time.time() * 1000)
                        }),
                        client_id
                    )
                
            except Exception as e:
                error_msg = f"Error processing message: {str(e)}"
                print(error_msg)
                try:
                    await websocket_manager.send_personal_message(
                        json.dumps({
                            'type': 'ERROR',
                            'message': 'Error processing message',
                            'error': error_msg,
                            'timestamp': int(time.time() * 1000)
                        }),
                        client_id
                    )
                except:
                    print(f"Could not send error message to client {client_id}")
                
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
        websocket_manager.disconnect(client_id)
        
    except Exception as e:
        error_msg = f"WebSocket error for client {client_id}: {str(e)}"
        print(error_msg)
        try:
            await websocket_manager.send_personal_message(
                json.dumps({
                    'type': 'ERROR',
                    'message': 'WebSocket connection error',
                    'error': error_msg,
                    'timestamp': int(time.time() * 1000)
                }),
                client_id
            )
        except:
            print(f"Could not send final error message to client {client_id}")
        websocket_manager.disconnect(client_id)
