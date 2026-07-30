import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../../../api';
import { activitiesApi } from '../../../api';


import { Note } from '../types/note';
export type { Note };

interface NoteContextType {
  // State
  notes: Note[];
  currentNote: Note | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNotes: () => Promise<void>;
  getNote: (id: string) => Promise<Note | null>;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'version'>) => Promise<Note>;
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
const LOCAL_NOTES_KEY = 'notefusion_local_notes';

export const NoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const readLocalNotes = (): Note[] => {
    try {
      const raw = localStorage.getItem(LOCAL_NOTES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const writeLocalNotes = (nextNotes: Note[]) => {
    localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(nextNotes));
  };

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
      writeLocalNotes(response.data);
    } catch (err) {
      const localNotes = readLocalNotes();
      setNotes(localNotes);
      setError(null);
      toast('Offline: using cached notes', { icon: '📶' });


      console.error('Error fetching notes, using local fallback:', err);
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
      toast.error('Failed to load note');

      console.error('Error fetching note:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new note
  const createNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'version'>): Promise<Note> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/notes', note);
      setNotes(prev => [response.data, ...prev]);
      activitiesApi.logActivity('note_created').catch(console.error);
      toast.success('Note created!');

      return response.data;
    } catch (err) {
      const now = new Date().toISOString();
      const localNote = {
        ...(note as any),
        id: `local-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        userId: 'local-user',
        version: 1,
      } as Note;
      const next = [localNote, ...notes];
      setNotes(next);
      writeLocalNotes(next);
      toast('Note saved locally (offline mode)', { icon: '📶' });

      return localNote;
    } finally {
      setLoading(false);
    }
  }, [notes]);

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
      toast.success('Note saved');

      return response.data;
    } catch (err) {
      const updatedAt = new Date().toISOString();
      let localResult: Note | null = null;
      const next = notes.map(note => {
        if (note.id !== id) return note;
        localResult = { ...note, ...updates, updatedAt } as Note;
        return localResult;
      });
      setNotes(next);
      writeLocalNotes(next);
      toast('Note updated locally (offline mode)', { icon: '📶' });

      if (localResult) return localResult;
      throw err;
    } finally {
      setLoading(false);
    }
  }, [notes]);

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
      toast.success('Note deleted');

    } catch (err) {
      const next = notes.filter(note => note.id !== id);
      setNotes(next);
      writeLocalNotes(next);
      if (currentNote?.id === id) setCurrentNote(null);
      toast('Note deleted locally (offline mode)', { icon: '📶' });

    } finally {
      setLoading(false);
    }
  }, [currentNote, notes]);

  // Toggle pin status
  const pinNote = useCallback(async (id: string, pinned: boolean): Promise<void> => {
    try {
      await updateNote(id, { isPinned: pinned });
      toast.success(pinned ? 'Note pinned' : 'Note unpinned');
    } catch (err) {
      toast.error(`Failed to ${pinned ? 'pin' : 'unpin'} note`);

    }
  }, [updateNote]);

  // Toggle archive status
  const archiveNote = useCallback(async (id: string, archived: boolean): Promise<void> => {
    try {
      await updateNote(id, { isArchived: archived });
      toast.success(archived ? 'Note archived' : 'Note restored');
    } catch (err) {
      toast.error(`Failed to ${archived ? 'archive' : 'restore'} note`);

    }
  }, [updateNote]);

  // Search notes
  const searchNotes = useCallback(async (query: string): Promise<Note[]> => {
    try {
      const response = await api.get('/notes/search', { params: { q: query } });
      return response.data;
    } catch (err) {
      toast.error('Failed to search notes');

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
      toast.error('Failed to add tag');

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
      toast.error('Failed to remove tag');

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
