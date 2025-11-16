from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from typing import Optional, Dict, List
import PyPDF2
import io
import os
import json
import uuid
from websocket_manager import manager as ws_manager

app = FastAPI(title="NoteFusion API", version="1.0.0")

# List of allowed origins (update this in production)
origins = [
    "http://localhost:4001",
    "http://localhost:3000",
    "http://127.0.0.1:4001",
    "http://127.0.0.1:3000",
]

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Minimal FastAPI backend is working!"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify the API is running"""
    return {
        "status": "ok",
        "message": "Backend is healthy",
        "version": "1.0.0",
        "websocket_connections": len(ws_manager.active_connections)
    }

# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await ws_manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo the message back to the client
            await ws_manager.send_personal_message(f"Echo: {data}", client_id)
    except WebSocketDisconnect:
        ws_manager.disconnect(client_id)
        await ws_manager.broadcast(f"Client #{client_id} left the chat")

# WebSocket test page
@app.get("/ws-test")
async def websocket_test():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
        <head>
            <title>WebSocket Test</title>
        </head>
        <body>
            <h1>WebSocket Test</h1>
            <div id="messages"></div>
            <input type="text" id="message" placeholder="Type a message">
            <button onclick="sendMessage()">Send</button>
            <script>
                const clientId = Math.random().toString(36).substring(7);
                const ws = new WebSocket(`ws://${window.location.host}/ws/${clientId}`);
                
                ws.onmessage = function(event) {
                    const messages = document.getElementById('messages');
                    const message = document.createElement('div');
                    message.textContent = event.data;
                    messages.appendChild(message);
                };
                
                function sendMessage() {
                    const input = document.getElementById('message');
                    ws.send(input.value);
                    input.value = '';
                }
            </script>
        </body>
    </html>
    """)

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Handle file uploads and extract text from PDFs.
    
    Args:
        file: The uploaded file (PDF or text)
        
    Returns:
        dict: Contains filename, content (extracted text), and file type
    """
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
            
        # Read the file
        contents = await file.read()
        
        # If it's a PDF, extract text
        if file.filename.lower().endswith('.pdf'):
            try:
                reader = PyPDF2.PdfReader(io.BytesIO(contents))
                text = ""
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                
                return {
                    "status": "success",
                    "filename": file.filename,
                    "content": text.strip(),
                    "type": "pdf",
                    "page_count": len(reader.pages)
                }
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")
        
        # For text files
        elif file.filename.lower().endswith(('.txt', '.md')):
            return {
                "status": "success",
                "filename": file.filename,
                "content": contents.decode('utf-8'),
                "type": "text"
            }
            
        # Unsupported file type
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable or use default 8000
    port = int(os.getenv("PORT", 8000))
    
    # Run the FastAPI app
    uvicorn.run(
        "minimal_main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        workers=1
    )
