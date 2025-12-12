import React, { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { Layout, message, Spin, Typography, Button } from 'antd';
import { Note, CreateNoteDto, UpdateNoteDto } from '../types/note';
import { noteService } from '../services/noteService';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './NotesManager.module.css';
import ErrorBoundary from '../../../components/ErrorBoundary';
import NoteList from './NoteList';
import NoteEditorWithDrawing from './NoteEditorWithDrawing';
=======
import { Layout, message, Spin, Typography } from 'antd';
import { Note, CreateNoteDto, UpdateNoteDto } from '../types/note';
import { noteService } from '../services/noteService';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorBoundary from '../../../components/ErrorBoundary';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const NotesManager: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
<<<<<<< HEAD
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
=======
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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

<<<<<<< HEAD
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
=======
  // Handle note selection
  const handleSelectNote = useCallback((note: Note | null) => {
    setSelectedNote(note);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    setIsCreating(false);
  }, []);

  // Handle new note creation
  const handleCreateNote = useCallback(() => {
<<<<<<< HEAD
    setSelectedNote(undefined);
=======
    setSelectedNote(null);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    setIsCreating(true);
  }, []);

  // Save note (create or update)
<<<<<<< HEAD
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
=======
  const handleSaveNote = async (noteData: { title: string; content: string; tags?: string[] }) => {
    if (!user) return;

    try {
      setIsSaving(true);
      let updatedNote: Note;

      if (selectedNote) {
        // Update existing note
        const updateData: Omit<UpdateNoteDto, 'id'> = {
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags,
          lastEditedBy: user.id,
        };
        updatedNote = await noteService.updateNote(selectedNote.id, updateData);
        setNotes(notes.map(note => (note.id === updatedNote.id ? updatedNote : note)));
        message.success('Note updated successfully');
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      } else {
        // Create new note
        const createData: CreateNoteDto = {
          title: noteData.title,
          content: noteData.content,
<<<<<<< HEAD
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
=======
          tags: noteData.tags,
          userId: user.id,
        };
        updatedNote = await noteService.createNote(createData);
        setNotes([updatedNote, ...notes]);
        message.success('Note created successfully');
        setIsCreating(false);
      }

      setSelectedNote(updatedNote);
      return updatedNote;
    } catch (error) {
      console.error('Failed to save note:', error);
      message.error('Failed to save note');
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      throw error;
    } finally {
      setIsSaving(false);
    }
<<<<<<< HEAD
  }, [selectedNote, user]);

  // Handle note deletion
  const handleDeleteNote = useCallback(async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await noteService.deleteNote(noteId);
      setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(undefined);
=======
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteService.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      }
      
      message.success('Note deleted successfully');
    } catch (error) {
      console.error('Failed to delete note:', error);
      message.error('Failed to delete note');
      throw error;
    }
<<<<<<< HEAD
  }, [selectedNote]);

  if (isLoading) {
    return (
      <div className={styles['loadingContainer']}>
=======
  };

  // Handle note pinning
  const handleTogglePin = async (noteId: string) => {
    try {
      const updatedNote = await noteService.togglePinNote(noteId);
      setNotes(notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ));
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNote);
      }
      
      message.success(updatedNote.isPinned ? 'Note pinned' : 'Note unpinned');
    } catch (error) {
      console.error('Failed to toggle pin status:', error);
      message.error('Failed to update note');
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Spin size="large" tip="Loading your notes..." />
      </div>
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={300} 
        theme="light" 
        style={{ 
          borderRight: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff'
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0 }}>My Notes</Title>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
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
=======
      
      <Content style={{ 
        padding: '24px',
        backgroundColor: '#fff',
        margin: 0,
        minHeight: '100vh'
      }}>
        <ErrorBoundary componentName="NoteEditor">
          {isCreating || selectedNote ? (
            <NoteEditor
              initialNote={selectedNote}
              onSave={handleSaveNote}
              onDelete={selectedNote ? () => handleDeleteNote(selectedNote.id) : undefined}
              onCancel={() => {
                setSelectedNote(null);
                setIsCreating(false);
              }}
              loading={isSaving}
            />
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 'calc(100vh - 48px)',
              color: 'rgba(0, 0, 0, 0.45)',
              textAlign: 'center',
              padding: '24px'
            }}>
              <img 
                src="/images/empty-notes.svg" 
                alt="No note selected" 
                style={{ width: '200px', marginBottom: '24px' }}
              />
              <Title level={4} style={{ marginBottom: '8px' }}>No Note Selected</Title>
              <Text type="secondary" style={{ marginBottom: '24px', maxWidth: '400px' }}>
                Select a note from the list or create a new one to get started. Your notes will appear here.
              </Text>
              <button
                onClick={handleCreateNote}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1890ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#40a9ff'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1890ff'}
              >
                <span>+</span> Create New Note
              </button>
            </div>
          )}
        </ErrorBoundary>
      </Content>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    </Layout>
  );
};

export default NotesManager;
