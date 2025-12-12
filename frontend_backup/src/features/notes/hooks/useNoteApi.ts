import { useCallback } from 'react';
import { Note, CreateNoteDto, UpdateNoteDto } from '../types';
import { api, API_ENDPOINTS } from '../../../utils/api';

/**
 * Custom hook for note-related API calls
 */
export const useNoteApi = () => {
  // Fetch all notes with optional filters
  const fetchNotes = useCallback(
    async (filters: {
      search?: string;
      isPinned?: boolean;
      isArchived?: boolean;
      isDeleted?: boolean;
      tags?: string[];
    } = {}) => {
      const { search, ...restFilters } = filters;
      const params: Record<string, any> = { ...restFilters };
      
      if (search) {
        params.q = search;
      }
      
      return api.get<Note[]>(API_ENDPOINTS.NOTES, params);
    },
    []
  );

  // Fetch a single note by ID
  const fetchNoteById = useCallback(async (id: string) => {
    return api.get<Note>(API_ENDPOINTS.NOTE_BY_ID(id));
  }, []);

  // Create a new note
  const createNote = useCallback(async (data: CreateNoteDto) => {
    return api.post<Note>(API_ENDPOINTS.NOTES, data);
  }, []);

  // Update an existing note
  const updateNote = useCallback(async (id: string, data: UpdateNoteDto) => {
    return api.put<Note>(API_ENDPOINTS.NOTE_BY_ID(id), data);
  }, []);

  // Delete a note (soft delete)
  const deleteNote = useCallback(async (id: string) => {
    return api.delete<{ success: boolean }>(API_ENDPOINTS.NOTE_BY_ID(id));
  }, []);

  // Restore a soft-deleted note
  const restoreNote = useCallback(async (id: string) => {
    return api.post<Note>(API_ENDPOINTS.NOTE_RESTORE(id), {});
  }, []);

  // Toggle pin status of a note
  const togglePinNote = useCallback(async (id: string) => {
    return api.post<Note>(API_ENDPOINTS.NOTE_TOGGLE_PIN(id), {});
  }, []);

  return {
    fetchNotes,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    togglePinNote,
  };
};

export default useNoteApi;
