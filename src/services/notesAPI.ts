import { apiClient, ApiResponse } from './apiClient';

export interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  is_pinned: boolean;
  tags: string[];
  category?: string;
  shared_with?: string[];
  attachments?: string[];
  metadata?: {
    word_count: number;
    reading_time: number;
    last_accessed: string;
  };
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tags?: string[];
  category?: string;
  is_pinned?: boolean;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
  category?: string;
  is_archived?: boolean;
  is_pinned?: boolean;
}

export interface NotesListResponse {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface SearchNotesRequest {
  query?: string;
  tags?: string[];
  category?: string;
  is_archived?: boolean;
  is_pinned?: boolean;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class NotesAPI {
  async getNotes(params?: SearchNotesRequest): Promise<ApiResponse<NotesListResponse>> {
    return apiClient.get('/notes', params);
  }

  async getNote(id: string): Promise<ApiResponse<Note>> {
    return apiClient.get(`/notes/${id}`);
  }

  async createNote(noteData: CreateNoteRequest): Promise<ApiResponse<Note>> {
    return apiClient.post('/notes', noteData);
  }

  async updateNote(id: string, noteData: UpdateNoteRequest): Promise<ApiResponse<Note>> {
    return apiClient.put(`/notes/${id}`, noteData);
  }

  async deleteNote(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/notes/${id}`);
  }

  async archiveNote(id: string): Promise<ApiResponse<Note>> {
    return apiClient.put(`/notes/${id}/archive`);
  }

  async unarchiveNote(id: string): Promise<ApiResponse<Note>> {
    return apiClient.put(`/notes/${id}/unarchive`);
  }

  async pinNote(id: string): Promise<ApiResponse<Note>> {
    return apiClient.put(`/notes/${id}/pin`);
  }

  async unpinNote(id: string): Promise<ApiResponse<Note>> {
    return apiClient.put(`/notes/${id}/unpin`);
  }

  async duplicateNote(id: string): Promise<ApiResponse<Note>> {
    return apiClient.post(`/notes/${id}/duplicate`);
  }

  async shareNote(id: string, emails: string[]): Promise<ApiResponse<void>> {
    return apiClient.post(`/notes/${id}/share`, { emails });
  }

  async unshareNote(id: string, emails: string[]): Promise<ApiResponse<void>> {
    return apiClient.post(`/notes/${id}/unshare`, { emails });
  }

  async getSharedNotes(): Promise<ApiResponse<NotesListResponse>> {
    return apiClient.get('/notes/shared');
  }

  async searchNotes(searchParams: SearchNotesRequest): Promise<ApiResponse<NotesListResponse>> {
    return apiClient.get('/notes/search', searchParams);
  }

  async exportNote(id: string, format: 'pdf' | 'docx' | 'md' | 'txt'): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get(`/notes/${id}/export`, { format });
  }

  async importNote(file: File): Promise<ApiResponse<Note>> {
    return apiClient.upload('/notes/import', file);
  }

  async getNoteStats(): Promise<ApiResponse<{
    total_notes: number;
    archived_notes: number;
    pinned_notes: number;
    shared_notes: number;
    total_words: number;
    categories: Record<string, number>;
    tags: Record<string, number>;
    recent_activity: Array<{
      date: string;
      notes_created: number;
      notes_updated: number;
    }>;
  }>> {
    return apiClient.get('/notes/stats');
  }

  async getNoteHistory(id: string): Promise<ApiResponse<Array<{
    id: string;
    changes: string;
    changed_at: string;
    changed_by: string;
  }>>> {
    return apiClient.get(`/notes/${id}/history`);
  }

  async restoreNoteVersion(noteId: string, versionId: string): Promise<ApiResponse<Note>> {
    return apiClient.post(`/notes/${noteId}/restore/${versionId}`);
  }

  async addAttachment(noteId: string, file: File): Promise<ApiResponse<{ attachment_id: string; url: string }>> {
    return apiClient.upload(`/notes/${noteId}/attachments`, file);
  }

  async removeAttachment(noteId: string, attachmentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/notes/${noteId}/attachments/${attachmentId}`);
  }

  async getCategories(): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
    return apiClient.get('/notes/categories');
  }

  async getTags(): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
    return apiClient.get('/notes/tags');
  }
}

export const notesAPI = new NotesAPI();
