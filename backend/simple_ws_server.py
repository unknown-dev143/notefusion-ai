from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"Client connected: {client_id}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            print(f"Client disconnected: {client_id}")

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                print(f"Received message from {client_id}: {message}")
                
                if message.get('type') == 'AUTH' and 'token' in message:
                    # In a real app, validate the token here
                    user_id = message.get('user_id', 'anonymous')
                    await manager.send_personal_message(
                        json.dumps({
                            'type': 'AUTH_SUCCESS',
                            'message': 'Authentication successful',
                            'user_id': user_id
                        }),
                        client_id
                    )
                else:
                    # Echo back the message for testing
                    await manager.send_personal_message(
                        json.dumps({
                            'type': 'ECHO',
                            'message': 'Message received',
                            'your_message': message
                        }),
                        client_id
                    )
            except json.JSONDecodeError:
                await manager.send_personal_message(
                    json.dumps({
                        'type': 'ERROR',
                        'message': 'Invalid JSON format'
                    }),
                    client_id
                )
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(client_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
