import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { WS_BASE_URL } from '../api';

interface WebSocketContextType {
  sendMessage: (message: any) => void;
  isConnected: boolean;
  lastMessage: any;
  connectionError: string | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000; // 3 seconds

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    } else {
      console.error('WebSocket is not connected');
      return false;
    }
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    sendMessage({ type: 'join_room', roomId });
  }, [sendMessage]);

  const leaveRoom = useCallback((roomId: string) => {
    sendMessage({ type: 'leave_room', roomId });
  }, [sendMessage]);

  const connect = useCallback(() => {
    try {
      const clientId = `client-${Math.random().toString(36).substr(2, 9)}`;
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      const wsUrl = `${WS_BASE_URL.replace(/\/ws\/?$/, '')}/ws/${clientId}`;
      console.log('Attempting to connect to WebSocket at:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Send authentication message to the server
        const authMessage = {
          type: 'AUTH',
          token: localStorage.getItem('authToken') || localStorage.getItem('accessToken'),
          user_id: 'guest',
          client_id: clientId
        };
        sendMessage(authMessage);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Message from server:', message);

          // Handle authentication success
          if (message.type === 'AUTH_SUCCESS') {
            console.log('Authentication successful:', message);
          } else if (message.type === 'ERROR') {
            console.error('WebSocket error from server:', message.message);
          }

          setLastMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          setTimeout(connect, reconnectInterval);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        // Don't throw error, just log it
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      // Set connected to false if connection fails
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Unknown WebSocket error');
    }
  }, [sendMessage, maxReconnectAttempts, reconnectInterval]);

  // Memoize the connect function to prevent unnecessary re-renders
  const memoizedConnect = useCallback(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    // Add a small delay to allow the component to render first
    const timer = setTimeout(() => {
      try {
        memoizedConnect();
      } catch (error) {
        console.error('Failed to initialize WebSocket connection:', error);
        setIsConnected(false);
      }
    }, 1000); // 1 second delay

    return () => {
      clearTimeout(timer);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [memoizedConnect]);

  return (
    <WebSocketContext.Provider value={{ sendMessage, isConnected, lastMessage, connectionError, joinRoom, leaveRoom }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
