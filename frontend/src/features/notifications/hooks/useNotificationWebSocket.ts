import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Notification } from '../types';

interface WebSocketMessage {
  type: string;
  payload: any;
}

export const useNotificationWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseDelay = 1000; // Start with 1 second

  // WebSocket event handlers
  const handleOpen = useCallback(() => {
    console.log('WebSocket connected');
    reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
    
    // Authenticate with the server
    if (ws.current && user?.token) {
      ws.current.send(JSON.stringify({
        type: 'auth',
        token: user.token
      }));
    }
  }, [user?.token]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'notification':
          // Handle new notification
          queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => {
            // Don't add duplicates
            if (old.some(n => n.id === message.payload.id)) return old;
            return [message.payload, ...old];
          });
          
          // Update unread count
          queryClient.setQueryData(['notificationCounts'], (old: any) => ({
            ...old,
            unread: (old?.unread || 0) + 1,
            total: (old?.total || 0) + 1
          }));
          
          // Play notification sound
          playNotificationSound();
          break;
          
        case 'notification_update':
          // Handle notification update (e.g., marked as read)
          queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => 
            old.map(n => 
              n.id === message.payload.id 
                ? { ...n, ...message.payload }
                : n
            )
          );
          
          // Update counts if needed
          if (message.payload.status === 'read') {
            queryClient.setQueryData(['notificationCounts'], (old: any) => ({
              ...old,
              unread: Math.max(0, (old?.unread || 1) - 1),
              read: (old?.read || 0) + 1
            }));
          }
          break;
          
        case 'notification_deleted':
          // Handle notification deletion
          queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => 
            old.filter(n => n.id !== message.payload.id)
          );
          
          // Update counts
          queryClient.setQueryData(['notificationCounts'], (old: any) => ({
            ...old,
            total: Math.max(0, (old?.total || 1) - 1),
            unread: message.payload.wasUnread 
              ? Math.max(0, (old?.unread || 1) - 1) 
              : old?.unread || 0
          }));
          break;
          
        case 'pong':
          // Handle pong response to keep the connection alive
          // Reset the ping timer if you have one
          break;
          
        default:
          console.log('Unhandled WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, [queryClient]);

  const handleClose = useCallback((event: CloseEvent) => {
    console.log('WebSocket disconnected:', event.code, event.reason);
    
    // Clear any existing reconnect timeout
    if (reconnectTimeout.current) {
      window.clearTimeout(reconnectTimeout.current);
    }
    
    // Attempt to reconnect if we're still authenticated and haven't exceeded max attempts
    if (isAuthenticated && reconnectAttempts.current < maxReconnectAttempts) {
      const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff with max 30s
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
      
      reconnectTimeout.current = window.setTimeout(() => {
        reconnectAttempts.current += 1;
        connectWebSocket();
      }, delay);
    } else if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
    }
  }, [isAuthenticated]);

  const handleError = useCallback((error: Event) => {
    console.error('WebSocket error:', error);
  }, []);

  // Function to connect to WebSocket
  const connectWebSocket = useCallback(() => {
    // Only connect if we have a user token and we're not already connected
    if (!user?.token || (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING))) {
      return;
    }
    
    // Close existing connection if any
    if (ws.current) {
      ws.current.close();
    }
    
    try {
      // Create new WebSocket connection
      const wsUrl = process.env.REACT_APP_WS_URL || `wss://${window.location.host}/ws`;
      ws.current = new WebSocket(`${wsUrl}?token=${encodeURIComponent(user.token)}`);
      
      // Set up event listeners
      ws.current.onopen = handleOpen;
      ws.current.onmessage = handleMessage;
      ws.current.onclose = handleClose;
      ws.current.onerror = handleError;
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [user?.token, handleOpen, handleMessage, handleClose, handleError]);

  // Function to send a ping to keep the connection alive
  const sendPing = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify({ type: 'ping' }));
      } catch (error) {
        console.error('Error sending ping:', error);
      }
    }
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(e => console.warn('Failed to play notification sound:', e));
    } catch (e) {
      console.warn('Error playing notification sound:', e);
    }
  };

  // Set up the WebSocket connection when the component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      connectWebSocket();
      
      // Set up ping interval (every 30 seconds)
      const pingInterval = setInterval(sendPing, 30000);
      
      // Clean up on unmount
      return () => {
        if (ws.current) {
          ws.current.close();
          ws.current = null;
        }
        
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        
        clearInterval(pingInterval);
      };
    }
  }, [isAuthenticated, user?.token, connectWebSocket, sendPing]);

  // Return the WebSocket connection status and methods
  return {
    isConnected: ws.current?.readyState === WebSocket.OPEN,
    sendMessage: useCallback((message: any) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
        return true;
      }
      return false;
    }, []),
    reconnect: connectWebSocket
  };
};
