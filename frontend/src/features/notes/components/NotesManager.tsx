import React, { useState, useEffect, useCallback } from 'react';
import { Layout, message, Spin, Typography, Button } from 'antd';
import { Note, CreateNoteDto, UpdateNoteDto } from '../types/note';
import { noteService } from '../services/noteService';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './NotesManager.module.css';
import ErrorBoundary from '../../../components/ErrorBoundary';
import NoteList from './NoteList';
import NoteEditorWithDrawing from './NoteEditorWithDrawing';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const NotesManager: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  // Load notes on component mount
  useEffect(() => {
    const loadNotes = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const notesData = await noteService.getAllNotes();
        // Filter by current user
        setNotes(notesData.filter(n => n.userId === user.id));
      } catch (error) {
        console.error('Failed to load notes:', error);
        message.error('Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [user]);

  // Toggle note pin status
  const handleTogglePin = useCallback(async (noteId: string) => {
    try {
      const noteToUpdate = notes.find(note => note.id === noteId);
      if (!noteToUpdate) return;
      
      const updatedNote = await noteService.updateNote(noteId, {
        ...noteToUpdate,
        isPinned: !noteToUpdate.isPinned
      });
      
      setNotes(prevNotes => 
        prevNotes.map(n => 
          n.id === noteId ? updatedNote : n
        )
      );
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNote);
      }
      
      message.success(updatedNote.isPinned ? 'Note pinned' : 'Note unpinned');
    } catch (error) {
      console.error('Failed to toggle pin status:', error);
      message.error('Failed to update note pin status');
    }
  }, [notes, selectedNote]);

  // Handle note selection
  const handleSelectNote = useCallback((note: Note | null) => {
    setSelectedNote(note || undefined);
    setIsCreating(false);
  }, []);

  // Handle new note creation
  const handleCreateNote = useCallback(() => {
    setSelectedNote(undefined);
    setIsCreating(true);
  }, []);

  // Save note (create or update)
  const handleSaveNote = useCallback(async (noteData: { title: string; content: string; tags?: string[]; id?: string }): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setIsSaving(true);
      let savedNote: Note;
      
      if (selectedNote) {
        // Update existing note
        const updateData: UpdateNoteDto = {
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags || [],
          lastEditedBy: user.id
        };
        savedNote = await noteService.updateNote(selectedNote.id, updateData);
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === selectedNote.id ? savedNote : note
          )
        );
      } else {
        // Create new note
        const createData: CreateNoteDto = {
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags || [],
          userId: user.id
        };
        savedNote = await noteService.createNote(createData);
        setNotes(prevNotes => [savedNote, ...prevNotes]);
      }
      
      setSelectedNote(savedNote);
      setIsCreating(false);
      message.success(selectedNote ? 'Note updated' : 'Note created');
      return;
    } catch (error) {
      console.error('Failed to save note:', error);
      message.error(selectedNote ? 'Failed to update note' : 'Failed to create note');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [selectedNote, user]);

  // Handle note deletion
  const handleDeleteNote = useCallback(async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await noteService.deleteNote(noteId);
      setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(undefined);
      }
      
      message.success('Note deleted successfully');
    } catch (error) {
      console.error('Failed to delete note:', error);
      message.error('Failed to delete note');
      throw error;
    }
  }, [selectedNote]);

  if (isLoading) {
    return (
      <div className={styles['loadingContainer']}>
        <Spin size="large" tip="Loading your notes..." />
      </div>
    );
  }

  return (
    <Layout className={styles['layout']}>
      <Sider 
        width={300} 
        theme="light" 
        className={styles['sider']}
      >
        <div className={styles['siderHeader']}>
          <Title level={4} className={styles['siderTitle'] || ''}>My Notes</Title>
        </div>
        <div className={styles['siderContent']}>
          <ErrorBoundary componentName="NoteList">
            <NoteList
              notes={notes}
              selectedNoteId={selectedNote?.id || null}
              onSelectNote={handleSelectNote}
              onCreateNew={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              onTogglePin={handleTogglePin}
              loading={isLoading}
              userId={user?.id || ''}
            />
          </ErrorBoundary>
        </div>
      </Sider>
      <Layout>
        <Content style={{ 
          padding: '24px',
          backgroundColor: '#f5f5f5',
          margin: 0,
          minHeight: '100vh'
        }}>
          <ErrorBoundary componentName="NoteEditor">
            {isCreating || selectedNote ? (
              <NoteEditorWithDrawing
                initialNote={selectedNote || undefined}
                onSave={handleSaveNote}
                onDelete={selectedNote ? () => handleDeleteNote(selectedNote.id) : undefined}
                onCancel={() => {
                  setSelectedNote(null);
                  setIsCreating(false);
                }}
                onPinToggle={selectedNote ? () => handleTogglePin(selectedNote.id) : undefined}
                isPinned={selectedNote?.isPinned || false}
                loading={isSaving}
                availableTags={Array.from(new Set(notes.flatMap(note => note.tags || [])))}
              />
            ) : (
              <div className={styles['emptyNoteContainer']}>
                <Text type="secondary" className={styles['emptyNoteText'] || ''}>
                  {isLoading ? 'Loading notes...' : 'Select a note or create a new one'}
                </Text>
                <Button 
                  type="primary" 
                  onClick={handleCreateNote}
                  style={{ marginTop: 16 }}
                  disabled={isLoading}
                >
                  Create New Note
                </Button>
              </div>
            )}
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
};

export default NotesManager;
