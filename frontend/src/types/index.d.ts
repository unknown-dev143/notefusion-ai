// Custom type declarations

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// WebSocket related types
declare interface WebSocketMessage {
  type: string;
  content?: any;
  sender?: string;
  room_id?: string;
  timestamp?: string;
  [key: string]: any;
}

declare interface WebSocketContextType {
  sendMessage: (message: WebSocketMessage) => void;
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

// React component props
declare interface WebSocketTestProps {
  // Add any props if needed
}

// Global window extensions
declare global {
  interface Window {
    // Add any global window properties if needed
  }
}

export {}; // This file needs to be a module
