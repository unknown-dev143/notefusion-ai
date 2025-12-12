import { create } from 'zustand';
import { Note, NoteFilters, NoteState } from '../types';
import { noteService } from '../api/noteService';

const initialState: Omit<NoteState, 'filters'> & { filters: Partial<NoteFilters> } = {
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  filters: {
    isArchived: false,
    isDeleted: false,
  },
};

export const useNoteStore = create<NoteState>((set, get) => ({
  ...initialState,
  
  // Set filters
  setFilters: (filters: Partial<NoteFilters>) => {
    set({ filters: { ...get().filters, ...filters } });
    get().fetchNotes();
  },

  // Reset filters
  resetFilters: () => {
    set({ filters: initialState.filters });
    get().fetchNotes();
  },

  // Fetch all notes with current filters
  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await noteService.getAllNotes(get().filters);
      set({ notes, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch notes',
        isLoading: false 
      });
    }
  },

  // Get a single note
  fetchNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const note = await noteService.getNoteById(id);
      set({ currentNote: note, isLoading: false });
      return note;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch note',
        isLoading: false 
      });
      throw error;
    }
  },

  // Create a new note
  createNote: async (noteData: Parameters<typeof noteService.createNote>[0]) => {
    set({ isLoading: true, error: null });
    try {
      const newNote = await noteService.createNote(noteData);
      set(state => ({
        notes: [newNote, ...state.notes],
        isLoading: false,
      }));
      return newNote;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create note',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update a note
  updateNote: async (id: string, updates: Parameters<typeof noteService.updateNote>[1]) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await noteService.updateNote(id, updates);
      set(state => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, ...updatedNote } : note
        ),
        currentNote: state.currentNote?.id === id 
          ? { ...state.currentNote, ...updatedNote } 
          : state.currentNote,
        isLoading: false,
      }));
      return updatedNote;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update note',
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete a note
  deleteNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await noteService.deleteNote(id);
      set(state => ({
        notes: state.notes.filter(note => note.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete note',
        isLoading: false 
      });
      throw error;
    }
  },

  // Toggle pin status
  togglePinNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await noteService.togglePinNote(id);
      set(state => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, isPinned: updatedNote.isPinned } : note
        ),
        currentNote: state.currentNote?.id === id 
          ? { ...state.currentNote, isPinned: updatedNote.isPinned } 
          : state.currentNote,
        isLoading: false,
      }));
      return updatedNote;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle pin status',
        isLoading: false 
      });
      throw error;
    }
  },

  // Clear current note
  clearCurrentNote: () => {
    set({ currentNote: null });
  },
}));
