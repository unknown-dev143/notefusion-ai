import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

const WebSocketTest: React.FC = () => {
  const { isConnected, lastMessage, sendMessage, joinRoom, leaveRoom } = useWebSocket();
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('room1');
  const [messages, setMessages] = useState<Array<{ text: string; sender: string; timestamp: string }>>([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    // Generate a client ID on component mount
    setClientId(`user-${Math.random().toString(36).substr(2, 6)}`);
  }, []);

  useEffect(() => {
    if (lastMessage) {
      console.log('Last message updated:', lastMessage);
      
      // Handle different message types
      switch (lastMessage.type) {
        case 'message':
          setMessages(prev => [
            ...prev, 
            { 
              text: lastMessage.content, 
              sender: lastMessage.sender || 'System',
              timestamp: new Date().toLocaleTimeString()
            }
          ]);
          break;
        case 'room_joined':
          setMessages(prev => [
            ...prev, 
            { 
              text: `You joined room: ${lastMessage.room_id}`,
              sender: 'System',
              timestamp: new Date().toLocaleTimeString()
            }
          ]);
          setIsInRoom(true);
          break;
        case 'room_left':
          setMessages(prev => [
            ...prev, 
            { 
              text: `You left room: ${lastMessage.room_id}`,
              sender: 'System',
              timestamp: new Date().toLocaleTimeString()
            }
          ]);
          setIsInRoom(false);
          break;
        default:
          // Handle other message types or log them
          console.log('Unhandled message type:', lastMessage.type);
      }
    }
  }, [lastMessage]);

  const handleSendMessage = () => {
    if (message.trim() && isConnected) {
      sendMessage({
        type: 'message',
        content: message,
        sender: clientId,
        room_id: roomId,
        timestamp: new Date().toISOString()
      });
      
      // Add the message to the local state immediately
      setMessages(prev => [
        ...prev, 
        { 
          text: message, 
          sender: 'You',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      
      setMessage('');
    }
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      joinRoom(roomId);
    }
  };

  const handleLeaveRoom = () => {
    if (isInRoom) {
      leaveRoom(roomId);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">WebSocket Test</h2>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span>Status: {isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="text-sm text-gray-600 mb-4">Client ID: {clientId}</div>
        
        <div className="flex mb-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID"
            className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!isInRoom ? (
            <button
              onClick={handleJoinRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Join Room
            </button>
          ) : (
            <button
              onClick={handleLeaveRoom}
              className="bg-red-500 text-white px-4 py-2 rounded-r hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Leave Room
            </button>
          )}
        </div>
        
        <div className="mb-4 border rounded p-3 h-64 overflow-y-auto bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-center mt-20">No messages yet. Join a room and start chatting!</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.sender === 'You' ? 'text-right' : ''}`}>
                <div className="text-xs text-gray-500">
                  {msg.sender} • {msg.timestamp}
                </div>
                <div 
                  className={`inline-block p-2 rounded-lg ${msg.sender === 'You' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-800'}`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            disabled={!isConnected || !isInRoom}
            className={`flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 ${!isConnected || !isInRoom ? 'bg-gray-100' : 'focus:ring-blue-500'}`}
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !isInRoom || !message.trim()}
            className={`px-4 py-2 rounded-r ${!isConnected || !isInRoom || !message.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            Send
          </button>
        </div>
        {!isInRoom && (
          <div className="text-sm text-red-500 mt-2">
            You must join a room before sending messages.
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded border">
        <h3 className="font-bold mb-2">Debug Information:</h3>
        <div className="text-sm">
          <p>Connection Status: <span className="font-mono">{isConnected ? '✅ Connected' : '❌ Disconnected'}</span></p>
          <p>Current Room: <span className="font-mono">{isInRoom ? roomId : 'None'}</span></p>
          <p>Last Message: <span className="font-mono">{JSON.stringify(lastMessage) || 'None'}</span></p>
        </div>
      </div>
    </div>
  );
};

export default WebSocketTest;
