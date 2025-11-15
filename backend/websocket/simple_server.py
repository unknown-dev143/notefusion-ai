import asyncio
import websockets
import json
from typing import Set, Dict

class SimpleWebSocketServer:
    def __init__(self):
        self.connected_clients: Set[websockets.WebSocketServerProtocol] = set()
        self.rooms: Dict[str, Set[websockets.WebSocketServerProtocol]] = {}

    async def handle_connection(self, websocket, path):
        # Register client
        self.connected_clients.add(websocket)
        print(f"New connection: {websocket.remote_address}")
        
        try:
            # Send welcome message
            await websocket.send(json.dumps({
                "type": "system",
                "message": "Connected to WebSocket server"
            }))

            # Handle incoming messages
            async for message in websocket:
                try:
                    data = json.loads(message)
                    print(f"Received: {data}")

                    # Echo the message back to the client
                    response = {
                        "type": "echo",
                        "message": data.get("content", ""),
                        "timestamp": asyncio.get_event_loop().time()
                    }
                    await websocket.send(json.dumps(response))

                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "message": "Invalid JSON received"
                    }))

        except websockets.exceptions.ConnectionClosed:
            print("Client disconnected")
        finally:
            # Unregister client
            self.connected_clients.remove(websocket)

    async def start(self, host='0.0.0.0', port=8007):
        server = await websockets.serve(
            self.handle_connection,
            host,
            port,
            ping_interval=20,
            ping_timeout=20
        )
        print(f"WebSocket server started on ws://{host}:{port}")
        return server

if __name__ == "__main__":
    server = SimpleWebSocketServer()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(server.start())
    loop.run_forever()
