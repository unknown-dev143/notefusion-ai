import { Notification } from '../types';

type NotificationCallback = (notification: Notification) => void;
type ConnectionStatusCallback = (isConnected: boolean) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private notificationCallbacks: NotificationCallback[] = [];
  private connectionStatusCallbacks: ConnectionStatusCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private isConnected = false;
  private connectionPromise: Promise<boolean> | null = null;

  constructor() {
    this.connect();
  }

  public connect = (): Promise<boolean> => {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve) => {
      try {
        // Get the WebSocket URL from environment variables or use a default
        const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsUrl = process.env.REACT_APP_WS_URL || `${wsProtocol}${window.location.host}`;
        
        this.socket = new WebSocket(`${wsUrl}/ws/notifications`);

        this.socket.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyConnectionStatus(true);
          console.log('WebSocket connected');
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              this.notifyCallbacks(data.payload);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        };

        this.socket.onclose = () => {
          this.isConnected = false;
          this.notifyConnectionStatus(false);
          this.connectionPromise = null;
          console.log('WebSocket disconnected');
          this.handleReconnect();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.socket?.close();
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        this.connectionPromise = null;
        resolve(false);
      }
    });

    return this.connectionPromise;
  };

  private handleReconnect = () => {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().then(success => {
          if (!success) {
            this.handleReconnect();
          }
        });
      }, Math.min(delay, 30000)); // Max 30 seconds delay
    } else {
      console.error('Max reconnection attempts reached');
    }
  };

  public disconnect = () => {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      this.notifyConnectionStatus(false);
    }
  };

  public onNotification = (callback: NotificationCallback): (() => void) => {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  };

  public onConnectionStatusChange = (callback: ConnectionStatusCallback): (() => void) => {
    this.connectionStatusCallbacks.push(callback);
    // Immediately notify current status
    callback(this.isConnected);
    return () => {
      this.connectionStatusCallbacks = this.connectionStatusCallbacks.filter(cb => cb !== callback);
    };
  };

  public send = (data: any) => {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  };

  private notifyCallbacks = (notification: Notification) => {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  };

  private notifyConnectionStatus = (isConnected: boolean) => {
    this.connectionStatusCallbacks.forEach(callback => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('Error in connection status callback:', error);
      }
    });
  };
}

// Create a single instance of the WebSocket service
export const webSocketService = new WebSocketService();

// Export a hook for components to use
export const useWebSocket = () => {
  return webSocketService;
};
