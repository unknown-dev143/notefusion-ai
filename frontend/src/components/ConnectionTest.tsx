import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

const ConnectionTest: React.FC = () => {
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const [status, setStatus] = useState('Checking connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      setStatus('✅ Connected to WebSocket');
      setError(null);
      
      // Send a test message
      sendMessage({
        type: 'test',
        message: 'Hello from client',
        timestamp: new Date().toISOString()
      });
    } else {
      setStatus('❌ Disconnected from WebSocket');
      setError('Trying to reconnect...');
    }
  }, [isConnected, sendMessage]);

  useEffect(() => {
    if (lastMessage) {
      console.log('Received message:', lastMessage);
      setStatus(`✅ Received: ${JSON.stringify(lastMessage)}`);
    }
  }, [lastMessage]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Connection Test</h2>
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="font-medium">Status:</span>
          <span className="ml-2">{status}</span>
        </div>
        {error && (
          <div className="text-red-600">
            {error}
          </div>
        )}
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              isConnected,
              lastMessage,
              time: new Date().toISOString()
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
