import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { apiService } from '../services/apiService';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  folderId?: string;
  isPinned: boolean;
  mediaUrls?: string[];
}

interface NoteContextType {
  notes: Note[];
  currentNote: Note | null;
  loading: boolean;
  error: string | null;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Promise<Note | null>;
  searchNotes: (query: string) => Promise<Note[]>;
  addMediaToNote: (noteId: string, file: File) => Promise<void>;
  createFolder: (name: string) => Promise<string>;
  addNoteToFolder: (noteId: string, folderId: string) => Promise<void>;
  togglePinNote: (noteId: string) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getNotes();
      setNotes(data);
    } catch (err) {
      setError('Failed to fetch notes');
      message.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newNote = await apiService.createNote(note);
      setNotes(prev => [...prev, newNote]);
      setCurrentNote(newNote);
      message.success('Note created successfully');
    } catch (err) {
      setError('Failed to create note');
      message.error('Failed to create note');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    setLoading(true);
    try {
      const updatedNote = await apiService.updateNote(id, updates);
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note));
      setCurrentNote(prev => prev?.id === id ? updatedNote : prev);
      message.success('Note updated successfully');
    } catch (err) {
      setError('Failed to update note');
      message.error('Failed to update note');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    setLoading(true);
    try {
      await apiService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }
      message.success('Note deleted successfully');
    } catch (err) {
      setError('Failed to delete note');
      message.error('Failed to delete note');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getNote = async (id: string) => {
    try {
      const note = await apiService.getNote(id);
      setCurrentNote(note);
      return note;
    } catch (err) {
      setError('Failed to fetch note');
      message.error('Failed to load note');
      return null;
    }
  };

  const searchNotes = async (query: string) => {
    try {
      return await apiService.searchNotes(query);
    } catch (err) {
      setError('Failed to search notes');
      message.error('Failed to search notes');
      return [];
    }
  };

  const addMediaToNote = async (noteId: string, file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const mediaUrl = await apiService.uploadMedia(formData);
      const note = await getNote(noteId);
      
      if (note) {
        const updatedMedia = [...(note.mediaUrls || []), mediaUrl];
        await updateNote(noteId, { mediaUrls: updatedMedia });
        message.success('Media added successfully');
      }
    } catch (err) {
      setError('Failed to add media');
      message.error('Failed to add media');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (name: string) => {
    try {
      const folder = await apiService.createFolder(name);
      return folder.id;
    } catch (err) {
      setError('Failed to create folder');
      message.error('Failed to create folder');
      throw err;
    }
  };

  const addNoteToFolder = async (noteId: string, folderId: string) => {
    try {
      await apiService.addNoteToFolder(noteId, folderId);
      await fetchNotes(); // Refresh notes to reflect the change
      message.success('Note added to folder');
    } catch (err) {
      setError('Failed to add note to folder');
      message.error('Failed to add note to folder');
      throw err;
    }
  };

  const togglePinNote = async (noteId: string) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        await updateNote(noteId, { isPinned: !note.isPinned });
      }
    } catch (err) {
      setError('Failed to update note');
      message.error('Failed to update note');
      throw err;
    }
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        currentNote,
        loading,
        error,
        createNote,
        updateNote,
        deleteNote,
        getNote,
        searchNotes,
        addMediaToNote,
        createFolder,
        addNoteToFolder,
        togglePinNote,
      }}
    >
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
