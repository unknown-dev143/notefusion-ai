import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { message } from 'antd';
import api from '../../../services/api';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  type?: 'text' | 'whiteboard' | 'video';
  metadata?: Record<string, any>;
}

interface NoteContextType {
  // State
  notes: Note[];
  currentNote: Note | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNotes: () => Promise<void>;
  getNote: (id: string) => Promise<Note | null>;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  pinNote: (id: string, pinned: boolean) => Promise<void>;
  archiveNote: (id: string, archived: boolean) => Promise<void>;
  searchNotes: (query: string) => Promise<Note[]>;
  addTag: (noteId: string, tag: string) => Promise<void>;
  removeTag: (noteId: string, tag: string) => Promise<void>;
  
  // UI State
  setCurrentNote: (note: Note | null) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (err) {
      setError('Failed to fetch notes');
      message.error('Failed to load notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single note
  const getNote = useCallback(async (id: string): Promise<Note | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/notes/${id}`);
      setCurrentNote(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch note');
      message.error('Failed to load note');
      console.error('Error fetching note:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new note
  const createNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Note> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/notes', note);
      setNotes(prev => [response.data, ...prev]);
      message.success('Note created successfully');
      return response.data;
    } catch (err) {
      setError('Failed to create note');
      message.error('Failed to create note');
      console.error('Error creating note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing note
  const updateNote = useCallback(async (id: string, updates: Partial<Note>): Promise<Note> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/notes/${id}`, updates);
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...response.data, updatedAt: new Date().toISOString() } : note
      ));
      setCurrentNote(prev => prev?.id === id ? { ...prev, ...response.data } : prev);
      message.success('Note updated successfully');
      return response.data;
    } catch (err) {
      setError('Failed to update note');
      message.error('Failed to update note');
      console.error('Error updating note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(note => note.id !== id));
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }
      message.success('Note deleted successfully');
    } catch (err) {
      setError('Failed to delete note');
      message.error('Failed to delete note');
      console.error('Error deleting note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentNote]);

  // Toggle pin status
  const pinNote = useCallback(async (id: string, pinned: boolean): Promise<void> => {
    try {
      await updateNote(id, { isPinned: pinned });
      message.success(pinned ? 'Note pinned' : 'Note unpinned');
    } catch (err) {
      message.error(`Failed to ${pinned ? 'pin' : 'unpin'} note`);
    }
  }, [updateNote]);

  // Toggle archive status
  const archiveNote = useCallback(async (id: string, archived: boolean): Promise<void> => {
    try {
      await updateNote(id, { isArchived: archived });
      message.success(archived ? 'Note archived' : 'Note restored');
    } catch (err) {
      message.error(`Failed to ${archived ? 'archive' : 'restore'} note`);
    }
  }, [updateNote]);

  // Search notes
  const searchNotes = useCallback(async (query: string): Promise<Note[]> => {
    try {
      const response = await api.get('/notes/search', { params: { q: query } });
      return response.data;
    } catch (err) {
      message.error('Failed to search notes');
      console.error('Error searching notes:', err);
      return [];
    }
  }, []);

  // Add tag to note
  const addTag = useCallback(async (noteId: string, tag: string): Promise<void> => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (note && !note.tags.includes(tag)) {
        const updatedTags = [...note.tags, tag];
        await updateNote(noteId, { tags: updatedTags });
      }
    } catch (err) {
      message.error('Failed to add tag');
      console.error('Error adding tag:', err);
    }
  }, [notes, updateNote]);

  // Remove tag from note
  const removeTag = useCallback(async (noteId: string, tag: string): Promise<void> => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        const updatedTags = note.tags.filter(t => t !== tag);
        await updateNote(noteId, { tags: updatedTags });
      }
    } catch (err) {
      message.error('Failed to remove tag');
      console.error('Error removing tag:', err);
    }
  }, [notes, updateNote]);

  const value: NoteContextType = {
    // State
    notes,
    currentNote,
    loading,
    error,
    
    // Actions
    fetchNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    pinNote,
    archiveNote,
    searchNotes,
    addTag,
    removeTag,
    
    // UI State
    setCurrentNote,
  };

  return (
    <NoteContext.Provider value={value}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};
