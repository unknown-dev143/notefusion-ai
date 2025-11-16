import { Note, CreateNoteDto, UpdateNoteDto, NoteFilters } from '../types';

export class NoteService {
  private baseUrl = '/api/notes';

  async getAllNotes(filters: Partial<NoteFilters> = {}): Promise<Note[]> {
    const query = new URLSearchParams();
    
    if (filters.search) query.append('search', filters.search);
    if (filters.tags) filters.tags.forEach(tag => query.append('tags', tag));
    if (filters.isPinned !== undefined) query.append('isPinned', String(filters.isPinned));
    if (filters.isArchived !== undefined) query.append('isArchived', String(filters.isArchived));
    if (filters.isDeleted !== undefined) query.append('isDeleted', String(filters.isDeleted));
    if (filters.folderId) query.append('folderId', filters.folderId);
    if (filters.sortBy) query.append('sortBy', filters.sortBy);
    if (filters.sortOrder) query.append('sortOrder', filters.sortOrder);

    const response = await fetch(`${this.baseUrl}?${query.toString()}`);
    return this.handleResponse<Note[]>(response);
  }

  async getNoteById(id: string): Promise<Note> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return this.handleResponse<Note>(response);
  }

  async createNote(noteData: CreateNoteDto): Promise<Note> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    return this.handleResponse<Note>(response);
  }

  async updateNote(id: string, noteData: UpdateNoteDto): Promise<Note> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    return this.handleResponse<Note>(response);
  }

  async deleteNote(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    await this.handleResponse(response);
  }

  async restoreNote(id: string): Promise<Note> {
    const response = await fetch(`${this.baseUrl}/${id}/restore`, {
      method: 'PATCH',
    });
    return this.handleResponse<Note>(response);
  }

  async togglePinNote(id: string): Promise<Note> {
    const response = await fetch(`${this.baseUrl}/${id}/toggle-pin`, {
      method: 'PATCH',
    });
    return this.handleResponse<Note>(response);
  }

  async exportNote(id: string, format: 'md' | 'txt' | 'pdf' = 'md'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${id}/export?format=${format}`);
    if (!response.ok) {
      throw new Error('Failed to export note');
    }
    return response.blob();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data as T;
  }
}

export const noteService = new NoteService();
