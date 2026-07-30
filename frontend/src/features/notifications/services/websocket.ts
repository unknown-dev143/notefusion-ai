import { Notification } from '../types';
import { WS_BASE_URL } from '../../../api';

type NotificationCallback = (notification: Notification) => void;
type ConnectionStatusCallback = (isConnected: boolean) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private notificationCallbacks: NotificationCallback[] = [];
  private notificationUpdateCallbacks: ((update: any) => void)[] = [];
  private notificationDeleteCallbacks: ((deleted: any) => void)[] = [];
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
        const wsUrl = WS_BASE_URL || 'ws://localhost:8000/ws';
        
        this.socket = new WebSocket(`${wsUrl.replace(/\/$/, '')}/notifications`);

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
            } else if (data.type === 'notification_update') {
              this.notifyUpdateCallbacks(data.payload);
            } else if (data.type === 'notification_delete') {
              this.notifyDeleteCallbacks(data.payload);
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

  public onNotificationUpdate = (callback: (update: any) => void): (() => void) => {
    this.notificationUpdateCallbacks.push(callback);
    return () => {
      this.notificationUpdateCallbacks = this.notificationUpdateCallbacks.filter(cb => cb !== callback);
    };
  };

  public onNotificationDelete = (callback: (deleted: any) => void): (() => void) => {
    this.notificationDeleteCallbacks.push(callback);
    return () => {
      this.notificationDeleteCallbacks = this.notificationDeleteCallbacks.filter(cb => cb !== callback);
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

  private notifyUpdateCallbacks = (update: any) => {
    this.notificationUpdateCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in notification update callback:', error);
      }
    });
  };

  private notifyDeleteCallbacks = (deleted: any) => {
    this.notificationDeleteCallbacks.forEach(callback => {
      try {
        callback(deleted);
      } catch (error) {
        console.error('Error in notification delete callback:', error);
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
