import { apiClient, ApiResponse } from './apiClient';
import { io, Socket } from 'socket.io-client';

export interface CollaborationSession {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  participants: CollaborationUser[];
  document_id?: string;
  document_type: 'note' | 'document' | 'whiteboard';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  settings: {
    allow_anonymous: boolean;
    require_approval: boolean;
    max_participants: number;
    auto_save: boolean;
  };
}

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  cursor?: {
    position: number;
    selection?: {
      start: number;
      end: number;
    };
  };
  is_online: boolean;
  last_seen: string;
}

export interface CollaborationOperation {
  id: string;
  session_id: string;
  user_id: string;
  type: 'insert' | 'delete' | 'format' | 'cursor';
  position: number;
  content?: string;
  length?: number;
  attributes?: Record<string, any>;
  timestamp: string;
  applied: boolean;
}

export interface CollaborationMessage {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  type: 'text' | 'file' | 'system';
  timestamp: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export interface CollaborationInvitation {
  id: string;
  session_id: string;
  invited_email: string;
  invited_by: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at: string;
}

class CollaborationAPI {
  private socket: Socket | null = null;
  private currentSession: string | null = null;

  // Session management
  async createSession(data: {
    name: string;
    description?: string;
    document_id?: string;
    document_type: 'note' | 'document' | 'whiteboard';
    settings?: Partial<CollaborationSession['settings']>;
  }): Promise<ApiResponse<CollaborationSession>> {
    return apiClient.post('/collaboration/sessions', data);
  }

  async getSessions(params?: {
    document_id?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ sessions: CollaborationSession[]; total: number; page: number }>> {
    return apiClient.get('/collaboration/sessions', params);
  }

  async getSession(sessionId: string): Promise<ApiResponse<CollaborationSession>> {
    return apiClient.get(`/collaboration/sessions/${sessionId}`);
  }

  async updateSession(sessionId: string, data: {
    name?: string;
    description?: string;
    settings?: Partial<CollaborationSession['settings']>;
  }): Promise<ApiResponse<CollaborationSession>> {
    return apiClient.put(`/collaboration/sessions/${sessionId}`, data);
  }

  async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/collaboration/sessions/${sessionId}`);
  }

  async joinSession(sessionId: string, password?: string): Promise<ApiResponse<CollaborationSession>> {
    return apiClient.post(`/collaboration/sessions/${sessionId}/join`, { password });
  }

  async leaveSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/collaboration/sessions/${sessionId}/leave`);
  }

  // Participant management
  async getParticipants(sessionId: string): Promise<ApiResponse<CollaborationUser[]>> {
    return apiClient.get(`/collaboration/sessions/${sessionId}/participants`);
  }

  async inviteParticipants(sessionId: string, invitations: Array<{
    email: string;
    role: 'editor' | 'viewer';
  }>): Promise<ApiResponse<{ invitations: CollaborationInvitation[] }>> {
    return apiClient.post(`/collaboration/sessions/${sessionId}/invite`, { invitations });
  }

  async updateParticipantRole(sessionId: string, userId: string, role: 'editor' | 'viewer'): Promise<ApiResponse<CollaborationUser>> {
    return apiClient.put(`/collaboration/sessions/${sessionId}/participants/${userId}`, { role });
  }

  async removeParticipant(sessionId: string, userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/collaboration/sessions/${sessionId}/participants/${userId}`);
  }

  // Invitations
  async getInvitations(params?: {
    status?: 'pending' | 'accepted' | 'rejected';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ invitations: CollaborationInvitation[]; total: number; page: number }>> {
    return apiClient.get('/collaboration/invitations', params);
  }

  async acceptInvitation(invitationId: string): Promise<ApiResponse<CollaborationSession>> {
    return apiClient.post(`/collaboration/invitations/${invitationId}/accept`);
  }

  async rejectInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/collaboration/invitations/${invitationId}/reject`);
  }

  async resendInvitation(invitationId: string): Promise<ApiResponse<CollaborationInvitation>> {
    return apiClient.post(`/collaboration/invitations/${invitationId}/resend`);
  }

  // Operations
  async getOperations(sessionId: string, params?: {
    from_timestamp?: string;
    limit?: number;
  }): Promise<ApiResponse<{ operations: CollaborationOperation[]; has_more: boolean }>> {
    return apiClient.get(`/collaboration/sessions/${sessionId}/operations`, params);
  }

  async applyOperation(sessionId: string, operation: Omit<CollaborationOperation, 'id' | 'timestamp' | 'applied'>): Promise<ApiResponse<CollaborationOperation>> {
    return apiClient.post(`/collaboration/sessions/${sessionId}/operations`, operation);
  }

  // Messages
  async getMessages(sessionId: string, params?: {
    from_timestamp?: string;
    limit?: number;
  }): Promise<ApiResponse<{ messages: CollaborationMessage[]; has_more: boolean }>> {
    return apiClient.get(`/collaboration/sessions/${sessionId}/messages`, params);
  }

  async sendMessage(sessionId: string, message: {
    content: string;
    type?: 'text' | 'file';
    file?: File;
  }): Promise<ApiResponse<CollaborationMessage>> {
    if (message.file) {
      const formData = new FormData();
      formData.append('content', message.content);
      formData.append('type', message.type || 'file');
      formData.append('file', message.file);

      const response = await fetch(`${apiClient['baseURL']}/collaboration/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: apiClient.getAuthHeaders(),
        body: formData,
      });

      return apiClient.handleResponse<CollaborationMessage>(response);
    } else {
      return apiClient.post(`/collaboration/sessions/${sessionId}/messages`, {
        content: message.content,
        type: message.type || 'text',
      });
    }
  }

  // File sharing
  async uploadFile(sessionId: string, file: File): Promise<ApiResponse<{ file_id: string; url: string }>> {
    return apiClient.upload(`/collaboration/sessions/${sessionId}/files`, file);
  }

  async getFiles(sessionId: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    size: number;
    url: string;
    uploaded_by: string;
    uploaded_at: string;
  }>>> {
    return apiClient.get(`/collaboration/sessions/${sessionId}/files`);
  }

  async deleteFile(sessionId: string, fileId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/collaboration/sessions/${sessionId}/files/${fileId}`);
  }

  // WebSocket connection
  connectToSession(sessionId: string, token: string): Socket {
    if (this.socket && this.currentSession === sessionId) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(`${apiClient['baseURL'].replace('/api/v1', '')}/collaboration`, {
      auth: { token, session_id: sessionId },
    });

    this.currentSession = sessionId;

    return this.socket;
  }

  disconnectFromSession(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentSession = null;
    }
  }

  // WebSocket event handlers
  onOperation(callback: (operation: CollaborationOperation) => void): void {
    if (this.socket) {
      this.socket.on('operation', callback);
    }
  }

  onMessage(callback: (message: CollaborationMessage) => void): void {
    if (this.socket) {
      this.socket.on('message', callback);
    }
  }

  onUserJoined(callback: (user: CollaborationUser) => void): void {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeft(callback: (userId: string) => void): void {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }

  onUserUpdated(callback: (user: CollaborationUser) => void): void {
    if (this.socket) {
      this.socket.on('user_updated', callback);
    }
  }

  onCursorUpdate(callback: (user: CollaborationUser) => void): void {
    if (this.socket) {
      this.socket.on('cursor_update', callback);
    }
  }

  onSessionUpdated(callback: (session: CollaborationSession) => void): void {
    if (this.socket) {
      this.socket.on('session_updated', callback);
    }
  }

  // Send WebSocket events
  sendOperation(operation: Omit<CollaborationOperation, 'id' | 'timestamp' | 'applied'>): void {
    if (this.socket) {
      this.socket.emit('operation', operation);
    }
  }

  sendMessageSocket(message: { content: string; type?: 'text' | 'file' }): void {
    if (this.socket) {
      this.socket.emit('message', message);
    }
  }

  updateCursor(position: number, selection?: { start: number; end: number }): void {
    if (this.socket) {
      this.socket.emit('cursor_update', { position, selection });
    }
  }

  // Analytics
  async getSessionAnalytics(sessionId: string): Promise<ApiResponse<{
    total_operations: number;
    total_messages: number;
    active_participants: number;
    session_duration: number;
    operation_types: Record<string, number>;
    participant_activity: Array<{
      user_id: string;
      operations_count: number;
      messages_count: number;
      time_active: number;
    }>;
    timeline: Array<{
      timestamp: string;
      event_type: string;
      user_id: string;
    }>;
  }>> {
    return apiClient.get(`/collaboration/sessions/${sessionId}/analytics`);
  }

  async getUserAnalytics(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<{
    total_sessions: number;
    total_participants: number;
    total_operations: number;
    total_messages: number;
    average_session_duration: number;
    most_active_sessions: Array<{
      session_id: string;
      session_name: string;
      operations_count: number;
    }>;
  }>> {
    return apiClient.get('/collaboration/analytics', params);
  }

  // Templates
  async getTemplates(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    document_type: string;
    settings: CollaborationSession['settings'];
  }>>> {
    return apiClient.get('/collaboration/templates');
  }

  async createTemplate(data: {
    name: string;
    description: string;
    document_type: string;
    settings: CollaborationSession['settings'];
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/collaboration/templates', data);
  }

  async createSessionFromTemplate(templateId: string, data: {
    name: string;
    description?: string;
    document_id?: string;
  }): Promise<ApiResponse<CollaborationSession>> {
    return apiClient.post(`/collaboration/templates/${templateId}/create-session`, data);
  }
}

export const collaborationAPI = new CollaborationAPI();
