import { io, Socket } from 'socket.io-client';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: {
    position: number;
    selection?: { start: number; end: number };
  };
}

export interface CollaborationOperation {
  type: 'insert' | 'delete' | 'retain' | 'format';
  position?: number;
  length?: number;
  content?: string;
  attributes?: Record<string, any>;
  userId: string;
  timestamp: number;
}

export interface CollaborationSession {
  id: string;
  documentId: string;
  users: CollaborationUser[];
  operations: CollaborationOperation[];
  lastSync: number;
}

export interface DocumentVersion {
  id: string;
  content: string;
  timestamp: number;
  userId: string;
  operations: CollaborationOperation[];
}

class CollaborationService {
  private socket: Socket | null = null;
  private currentSession: CollaborationSession | null = null;
  private documentVersions: Map<string, DocumentVersion[]> = new Map();
  private isConnected = false;

  // Event callbacks
  private onUserJoinedCallbacks: ((user: CollaborationUser) => void)[] = [];
  private onUserLeftCallbacks: ((userId: string) => void)[] = [];
  private onOperationReceivedCallbacks: ((op: CollaborationOperation) => void)[] = [];
  private onCursorUpdateCallbacks: ((user: CollaborationUser) => void)[] = [];
  private onDocumentUpdatedCallbacks: ((content: string) => void)[] = [];

  async connect(documentId: string, user: Omit<CollaborationUser, 'color'>): Promise<void> {
    try {
      this.socket = io('ws://localhost:8001', {
        transports: ['websocket'],
        upgrade: false
      });

      // Assign a random color to the user
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
      const userWithColor: CollaborationUser = {
        ...user,
        color: colors[Math.floor(Math.random() * colors.length)]
      };

      this.socket.emit('join-document', {
        documentId,
        user: userWithColor
      });

      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        this.socket!.once('joined-session', (session: CollaborationSession) => {
          this.currentSession = session;
          this.isConnected = true;
          resolve();
        });

        this.socket!.once('error', (error: any) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Failed to connect to collaboration service:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('user-joined', (user: CollaborationUser) => {
      this.onUserJoinedCallbacks.forEach(cb => cb(user));
    });

    this.socket.on('user-left', (userId: string) => {
      this.onUserLeftCallbacks.forEach(cb => cb(userId));
    });

    this.socket.on('operation-received', (operation: CollaborationOperation) => {
      this.handleRemoteOperation(operation);
    });

    this.socket.on('cursor-update', (user: CollaborationUser) => {
      this.onCursorUpdateCallbacks.forEach(cb => cb(user));
    });

    this.socket.on('document-updated', (content: string) => {
      this.onDocumentUpdatedCallbacks.forEach(cb => cb(content));
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });
  }

  private handleRemoteOperation(operation: CollaborationOperation): void {
    if (this.currentSession && operation.userId !== this.getCurrentUserId()) {
      this.currentSession.operations.push(operation);
      this.onOperationReceivedCallbacks.forEach(cb => cb(operation));
    }
  }

  sendOperation(operation: Omit<CollaborationOperation, 'userId' | 'timestamp'>): void {
    if (!this.socket || !this.isConnected || !this.currentSession) return;

    const fullOperation: CollaborationOperation = {
      ...operation,
      userId: this.getCurrentUserId(),
      timestamp: Date.now()
    };

    this.socket.emit('send-operation', fullOperation);
    this.currentSession.operations.push(fullOperation);
  }

  updateCursor(position: number, selection?: { start: number; end: number }): void {
    if (!this.socket || !this.isConnected || !this.currentSession) return;

    const currentUser = this.currentSession.users.find(u => u.id === this.getCurrentUserId());
    if (currentUser) {
      currentUser.cursor = { position, selection };
      this.socket.emit('cursor-update', {
        documentId: this.currentSession.documentId,
        userId: currentUser.id,
        cursor: currentUser.cursor
      });
    }
  }

  private getCurrentUserId(): string {
    // This should get the current user from auth context
    return localStorage.getItem('userId') || 'anonymous';
  }

  // Event subscription methods
  onUserJoined(callback: (user: CollaborationUser) => void): void {
    this.onUserJoinedCallbacks.push(callback);
  }

  onUserLeft(callback: (userId: string) => void): void {
    this.onUserLeftCallbacks.push(callback);
  }

  onOperationReceived(callback: (op: CollaborationOperation) => void): void {
    this.onOperationReceivedCallbacks.push(callback);
  }

  onCursorUpdate(callback: (user: CollaborationUser) => void): void {
    this.onCursorUpdateCallbacks.push(callback);
  }

  onDocumentUpdated(callback: (content: string) => void): void {
    this.onDocumentUpdatedCallbacks.push(callback);
  }

  // Document version management
  saveDocumentVersion(documentId: string, content: string): void {
    const version: DocumentVersion = {
      id: `v${Date.now()}`,
      content,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      operations: [...(this.currentSession?.operations || [])]
    };

    if (!this.documentVersions.has(documentId)) {
      this.documentVersions.set(documentId, []);
    }
    
    const versions = this.documentVersions.get(documentId)!;
    versions.push(version);
    
    // Keep only last 50 versions
    if (versions.length > 50) {
      versions.splice(0, versions.length - 50);
    }
  }

  getDocumentVersions(documentId: string): DocumentVersion[] {
    return this.documentVersions.get(documentId) || [];
  }

  // Conflict resolution
  resolveConflicts(operations: CollaborationOperation[]): CollaborationOperation[] {
    // Operational Transformation logic
    const resolved: CollaborationOperation[] = [];
    const sortedOps = operations.sort((a, b) => a.timestamp - b.timestamp);

    for (const op of sortedOps) {
      let transformedOp = { ...op };
      
      // Transform operation against previous operations
      for (const prevOp of resolved) {
        transformedOp = this.transformOperation(transformedOp, prevOp);
      }
      
      resolved.push(transformedOp);
    }

    return resolved;
  }

  private transformOperation(op: CollaborationOperation, against: CollaborationOperation): CollaborationOperation {
    // Simplified operational transformation
    if (op.type === 'insert' && against.type === 'insert') {
      if (op.position! <= against.position!) {
        return op;
      } else {
        return { ...op, position: op.position! + against.content!.length };
      }
    }
    
    if (op.type === 'delete' && against.type === 'insert') {
      if (op.position! <= against.position!) {
        return op;
      } else {
        return { ...op, position: op.position! + against.content!.length };
      }
    }
    
    if (op.type === 'insert' && against.type === 'delete') {
      if (op.position! <= against.position!) {
        return op;
      } else {
        return { ...op, position: op.position! - against.length! };
      }
    }
    
    return op;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentSession = null;
  }

  isConnectedToSession(): boolean {
    return this.isConnected && this.currentSession !== null;
  }

  getCurrentSession(): CollaborationSession | null {
    return this.currentSession;
  }

  getActiveUsers(): CollaborationUser[] {
    return this.currentSession?.users || [];
  }
}

export const collaborationService = new CollaborationService();
