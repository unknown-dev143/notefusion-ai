import axios from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface UpdateNoteDto extends Partial<CreateNoteDto> {
  id: string;
}

export const notesApi = {
  // Get all notes for the authenticated user
  async getNotes(params?: { search?: string; tag?: string }): Promise<Note[]> {
    const response = await axios.get(`${API_BASE_URL}/notes`, { params });
    return response.data;
  },

  // Get a single note by ID
  async getNoteById(id: string): Promise<Note> {
    const response = await axios.get(`${API_BASE_URL}/notes/${id}`);
    return response.data;
  },

  // Create a new note
  async createNote(data: CreateNoteDto): Promise<Note> {
    const response = await axios.post(`${API_BASE_URL}/notes`, data);
    return response.data;
  },

  // Update an existing note
  async updateNote({ id, ...data }: UpdateNoteDto): Promise<Note> {
    const response = await axios.patch(`${API_BASE_URL}/notes/${id}`, data);
    return response.data;
  },

  // Delete a note
  async deleteNote(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/notes/${id}`);
  },

  // Toggle pin status of a note
  async togglePin(id: string): Promise<Note> {
    const response = await axios.patch(`${API_BASE_URL}/notes/${id}/toggle-pin`);
    return response.data;
  },

  // Toggle archive status of a note
  async toggleArchive(id: string): Promise<Note> {
    const response = await axios.patch(`${API_BASE_URL}/notes/${id}/toggle-archive`);
    return response.data;
  },

  // Search notes
  async searchNotes(query: string): Promise<Note[]> {
    const response = await axios.get(`${API_BASE_URL}/notes/search`, {
      params: { q: query },
    });
    return response.data;
  },

  // Get all tags for the authenticated user
  async getTags(): Promise<string[]> {
    const response = await axios.get(`${API_BASE_URL}/notes/tags`);
    return response.data;
  },
};

export default notesApi;
