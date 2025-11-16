<<<<<<< HEAD
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import json
import asyncio
from typing import List, Optional
import aiofiles
import sqlite3
from datetime import datetime
import uuid

from app.services.transcription_service import TranscriptionService
from app.services.fusion_service import FusionService
from app.services.pdf_service import PDFService
from app.models.database import init_db, get_db
from app.api.routes import router
from config import Config

app = FastAPI(title="NoteFusion AI", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# Initialize services
transcription_service = TranscriptionService()
fusion_service = FusionService()
pdf_service = PDFService()

# Create necessary directories
Config.create_directories()

@app.on_event("startup")
async def startup_event():
=======
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import json
import asyncio
from typing import List, Optional
import aiofiles
import sqlite3
from datetime import datetime
import uuid

from app.services.transcription_service import TranscriptionService
from app.services.fusion_service import FusionService
from app.services.pdf_service import PDFService
from app.models.database import init_db, get_db
from app.api.routes import router
from config import Config

app = FastAPI(title="NoteFusion AI", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# Initialize services
transcription_service = TranscriptionService()
fusion_service = FusionService()
pdf_service = PDFService()

# Create necessary directories
Config.create_directories()

@app.on_event("startup")
async def startup_event():
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    """Initialize database and services on startup"""
    await init_db()
    print("NoteFusion AI Backend Started!")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "NoteFusion AI Backend", "status": "running"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload file (PDF, audio, video) for processing"""
    try:
        file_id = str(uuid.uuid4())
        file_path = f"{Config.UPLOAD_DIR}/{file_id}_{file.filename}"
        
        # Check if file exists and generate new ID if needed
        while os.path.exists(file_path):
            file_id = str(uuid.uuid4())
            file_path = f"{Config.UPLOAD_DIR}/{file_id}_{file.filename}"
        
        # Validate file type
        allowed_types = [
            "application/pdf", "audio/", "video/", 
            "text/plain", "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ]
        
        if not any(file.content_type.startswith(t) for t in allowed_types):
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Process based on file type
        if file.content_type == "application/pdf":
            text_content = await pdf_service.extract_text(file_path)
            return {
                "file_id": file_id,
                "filename": file.filename,
                "content_type": file.content_type,
                "text_content": text_content,
                "status": "processed"
            }
        elif file.content_type.startswith("audio/") or file.content_type.startswith("video/"):
            # Start transcription
            transcript = await transcription_service.transcribe_audio(file_path)
            return {
                "file_id": file_id,
                "filename": file.filename,
                "content_type": file.content_type,
                "transcript": transcript,
                "status": "transcribed"
            }
        else:
            # Text file
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                text_content = await f.read()
            return {
                "file_id": file_id,
                "filename": file.filename,
                "content_type": file.content_type,
                "text_content": text_content,
                "status": "processed"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio/video file"""
    try:
        file_id = str(uuid.uuid4())
        file_path = f"{Config.UPLOAD_DIR}/{file_id}_{file.filename}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        transcript = await transcription_service.transcribe_audio(file_path)
        
        return {
            "file_id": file_id,
            "transcript": transcript,
            "status": "completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/api/fuse")
async def fuse_content(
    lecture_content: str = Form(...),
    textbook_content: str = Form(...),
    module_code: str = Form(...),
    chapters: str = Form(...),
    detail_level: str = Form("standard"),
    session_id: Optional[str] = Form(None)
):
    try:
        if not session_id:
            session_id = str(uuid.uuid4())
            
        # Check if session exists
        db = await get_db()
        cursor = await db.execute("""
            SELECT session_id FROM sessions WHERE session_id = ?
        """, (session_id,))
        existing_session = await cursor.fetchone()
        
        if existing_session:
            # Update existing session
            await db.execute("""
                UPDATE sessions 
                SET module_code = ?, chapters = ?, detail_level = ?,
                    lecture_content = ?, textbook_content = ?, 
                    fused_notes = ?, created_at = ?
                WHERE session_id = ?
            """, (module_code, chapters, detail_level, lecture_content,
                  textbook_content, json.dumps(fused_notes), datetime.now(),
                  session_id))
        else:
            # Insert new session
            await db.execute("""
                INSERT INTO sessions (session_id, module_code, chapters, 
                    detail_level, lecture_content, textbook_content, 
                    fused_notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (session_id, module_code, chapters, detail_level,
                  lecture_content, textbook_content, json.dumps(fused_notes),
                  datetime.now()))
        
        await db.commit()
        await db.close()
        
        return {
            "session_id": session_id,
            "fused_notes": fused_notes,
            "status": "completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fusion failed: {str(e)}")

@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session data"""
    try:
        db = await get_db()
        cursor = await db.execute("""
            SELECT * FROM sessions WHERE session_id = ?
        """, (session_id,))
        session = await cursor.fetchone()
        
        if not session:
            await db.close()
            raise HTTPException(status_code=404, detail="Session not found")
        
        result = {
            "session_id": session[0],
            "module_code": session[1],
            "chapters": session[2],
            "detail_level": session[3],
            "lecture_content": session[4],
            "textbook_content": session[5],
            "fused_notes": json.loads(session[6]),
            "created_at": session[7]
        }
        await db.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")

@app.get("/api/sessions")
async def list_sessions():
    """List all sessions"""
    try:
        db = await get_db()
        cursor = await db.execute("""
            SELECT session_id, module_code, chapters, detail_level, created_at 
            FROM sessions ORDER BY created_at DESC
        """)
        sessions = await cursor.fetchall()
        await db.close()
        
        return {
            "sessions": [
                {
                    "session_id": session[0],
                    "module_code": session[1],
                    "chapters": session[2],
                    "detail_level": session[3],
                    "created_at": session[4]
                }
                for session in sessions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")

@app.websocket("/ws/recording")
async def websocket_recording(websocket: WebSocket):
    """WebSocket endpoint for live audio recording"""
    await websocket.accept()
    
    # Send initial status
    await websocket.send_text(json.dumps({
        "status": "connected",
        "whisper_available": transcription_service.whisper_available,
        "message": "WebSocket connection established"
    }))
    
    try:
        session_id = str(uuid.uuid4())
        transcript_chunks = []
        
        # Ensure upload directory exists
        os.makedirs(Config.UPLOAD_DIR, exist_ok=True)
        
        while True:
            # Receive audio chunk
            try:
                audio_data = await websocket.receive_bytes()
            except Exception as e:
                print(f"Error receiving audio data: {e}")
                break
            
            # Save audio chunk
            chunk_id = str(uuid.uuid4())
            chunk_path = f"{Config.UPLOAD_DIR}/{session_id}_{chunk_id}.wav"
            
            try:
                async with aiofiles.open(chunk_path, 'wb') as f:
                    await f.write(audio_data)
                
                # Transcribe chunk with error handling
                transcript_chunk = await transcription_service.transcribe_audio(chunk_path)
                
                # Clean up temporary file
                try:
                    os.remove(chunk_path)
                except:
                    pass  # Ignore cleanup errors
                
                transcript_chunks.append(transcript_chunk)
                
                # Send transcript back
                await websocket.send_text(json.dumps({
                    "chunk_id": chunk_id,
                    "transcript": transcript_chunk,
                    "full_transcript": " ".join(transcript_chunks),
                    "status": "success"
                }))
                
            except Exception as transcription_error:
                print(f"Transcription error: {transcription_error}")
                # Send error but continue processing
                await websocket.send_text(json.dumps({
                    "chunk_id": chunk_id,
                    "error": f"Transcription failed: {str(transcription_error)}",
                    "status": "error"
                }))
            
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.send_text(json.dumps({
                "error": str(e),
                "status": "fatal_error"
            }))
        except:
            pass  # Connection might be closed

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=True
    )