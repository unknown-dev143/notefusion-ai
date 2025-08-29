import { Notification, NotificationUpdate, NotificationDelete } from '../types';

type NotificationCallback = (notification: Notification) => void;
type NotificationUpdateCallback = (update: NotificationUpdate) => void;
type NotificationDeleteCallback = (deleted: NotificationDelete) => void;
type ConnectionStatusCallback = (isConnected: boolean) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseDelay = 1000; // Start with 1 second
  private reconnectTimeout: number | null = null;
  private pingInterval: number | null = null;
  
  private notificationCallbacks: NotificationCallback[] = [];
  private updateCallbacks: NotificationUpdateCallback[] = [];
  private deleteCallbacks: NotificationDeleteCallback[] = [];
  private connectionStatusCallbacks: ConnectionStatusCallback[] = [];
  
  private token: string | null = null;
  
  constructor() {
    this.connect = this.connect.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
    this.sendPing = this.sendPing.bind(this);
  }
  
  async connect(token: string): Promise<boolean> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return true;
    }
    
    this.token = token;
    
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || `wss://${window.location.host}/ws`;
      this.ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
      
      this.ws.onopen = this.handleOpen;
      this.ws.onmessage = this.handleMessage;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;
      
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            resolve(true);
          } else if (this.ws?.readyState === WebSocket.CLOSED) {
            resolve(false);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      return false;
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    this.reconnectAttempts = 0;
  }
  
  private handleOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.notifyConnectionStatus(true);
    
    // Set up ping interval (every 30 seconds)
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = window.setInterval(this.sendPing, 30000);
  }
  
  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'notification':
          this.notificationCallbacks.forEach(callback => callback(message.payload));
          break;
          
        case 'notification_update':
          this.updateCallbacks.forEach(callback => callback(message.payload));
          break;
          
        case 'notification_deleted':
          this.deleteCallbacks.forEach(callback => callback(message.payload));
          break;
          
        case 'pong':
          // Handle pong response
          break;
          
        default:
          console.log('Unhandled WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }
  
  private handleClose(event: CloseEvent) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.notifyConnectionStatus(false);
    
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // Attempt to reconnect if we have a token and haven't exceeded max attempts
    if (this.token && this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(this.baseDelay * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = window.setTimeout(() => {
        this.reconnectAttempts += 1;
        this.connect(this.token!);
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
    }
  }
  
  private handleError(error: Event) {
    console.error('WebSocket error:', error);
  }
  
  private sendPing() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'ping' }).catch(console.error);
    }
  }
  
  private notifyConnectionStatus(isConnected: boolean) {
    this.connectionStatusCallbacks.forEach(callback => callback(isConnected));
  }
  
  // Public methods
  
  async send(message: any): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    
    // If not connected, try to reconnect once
    if (this.token) {
      const connected = await this.connect(this.token);
      if (connected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
        return true;
      }
    }
    
    return false;
  }
  
  // Subscription methods
  
  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }
  
  onNotificationUpdate(callback: NotificationUpdateCallback): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  onNotificationDelete(callback: NotificationDeleteCallback): () => void {
    this.deleteCallbacks.push(callback);
    return () => {
      this.deleteCallbacks = this.deleteCallbacks.filter(cb => cb !== callback);
    };
  }
  
  onConnectionStatusChange(callback: ConnectionStatusCallback): () => void {
    this.connectionStatusCallbacks.push(callback);
    return () => {
      this.connectionStatusCallbacks = this.connectionStatusCallbacks.filter(cb => cb !== callback);
    };
  }
  
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();
