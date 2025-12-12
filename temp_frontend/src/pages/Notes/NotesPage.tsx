import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Button, message, Empty, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
<<<<<<< HEAD
import { useNotes, Note as NoteType } from '../../features/notes/context/NoteContext';
import styles from './NotesPage.module.css';
import NotesList from '../../components/notes/NotesList';
import NoteEditor from '../../components/notes/NoteEditor';

// Extend the NoteType from context with additional properties
interface Note extends NoteType {
  type?: 'text' | 'video' | 'whiteboard';
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
}

const { Title } = Typography;

=======
import { useNotes } from '../../features/notes/context/NoteContext';
import { Note } from '../../types/note';
import NotesList from '../../components/notes/NotesList';
import NoteEditor from '../../components/notes/NoteEditor';

const { Title } = Typography;

// Define the Note type for better type safety
type NoteWithOptionalId = Omit<Note, 'id'> & { id?: string };

>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
const NotesPage: React.FC = () => {
  const { noteId } = useParams<{ noteId?: string }>();
  const navigate = useNavigate();
  const {
    notes,
    currentNote,
    loading,
    fetchNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    pinNote,
    searchNotes,
  } = useNotes();
  
  const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
=======
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

<<<<<<< HEAD
=======
  // Update filtered notes when notes or search query changes
  useEffect(() => {
    if (searchQuery) {
      const search = async () => {
        try {
          const results = await searchNotes(searchQuery);
          setFilteredNotes(results);
        } catch (error) {
          console.error('Error searching notes:', error);
          setFilteredNotes(notes);
        }
      };
      search();
    } else {
      setFilteredNotes(notes);
    }
  }, [searchQuery, notes, searchNotes]);

>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  // Load note when noteId changes
  useEffect(() => {
    if (noteId && noteId !== 'new') {
      getNote(noteId);
    }
  }, [noteId, getNote]);

  const handleNoteSelect = useCallback((note: Note) => {
    navigate(`/notes/${note.id}`);
  }, [navigate]);

  const handleCreateNew = useCallback(() => {
    navigate('/notes/new');
  }, [navigate]);

  const handleBackToList = useCallback(() => {
    navigate('/notes');
  }, [navigate]);

<<<<<<< HEAD
  const handleSaveNote = useCallback(async (noteData: Partial<Note>) => {
    try {
      const noteUpdate: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        tags: noteData.tags || [],
        isPinned: noteData.isPinned || false,
        isArchived: noteData.isArchived || false,
        type: noteData.type || 'text',
        metadata: noteData.metadata || {}
=======
  const handleSaveNote = useCallback(async (noteData: Pick<Note, 'title' | 'content' | 'tags' | 'type'>) => {
    try {
      const noteUpdate = {
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        tags: noteData.tags || [],
        type: noteData.type || 'text',
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      };

      if (currentNote?.id) {
        // Update existing note
        await updateNote(currentNote.id, noteUpdate);
        message.success('Note updated successfully');
      } else {
<<<<<<< HEAD
        // Create new note with required fields
        const newNote = await createNote({
          ...noteUpdate,
          type: 'text' as const,
=======
        // Create new note
        const newNote = await createNote({
          ...noteUpdate,
          type: 'text',
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        });
        message.success('Note created successfully');
        navigate(`/notes/${newNote.id}`);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note');
      throw error;
    }
  }, [currentNote?.id, updateNote, createNote, navigate]);

  const handleDeleteNote = useCallback(async (id: string) => {
    try {
      await deleteNote(id);
      message.success('Note deleted');
      if (currentNote?.id === id) {
        navigate('/notes');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      message.error('Failed to delete note');
    }
  }, [deleteNote, currentNote?.id, navigate]);

  const handlePinNote = useCallback(async (id: string, pinned: boolean) => {
    try {
      await pinNote(id, pinned);
      message.success(pinned ? 'Note pinned' : 'Note unpinned');
    } catch (error) {
      console.error('Error pinning note:', error);
      message.error('Failed to update note');
    }
  }, [pinNote]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

<<<<<<< HEAD
  // Filter notes based on search query
  const filteredNotes = React.useMemo(() => {
    if (!searchQuery) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      (note.title?.toLowerCase().includes(query)) ||
      (note.content?.toLowerCase().includes(query)) ||
      (note.tags?.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [searchQuery, notes]);
=======
  const displayNotes = searchQuery ? filteredNotes : notes;
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  const isEditing = Boolean(noteId && noteId !== 'new');
  const isCreating = noteId === 'new';
  const showEditor = isEditing || isCreating;

  return (
<<<<<<< HEAD
    <div className={styles['notesPage']}>
      <Row gutter={24} className={styles['notesContainer']}>
        <Col xs={24} md={8} className={styles['notesList']}>
          <div className={styles['notesContainer']}>
            <Space className={styles['notesHeader'] || ''} direction="vertical">
              <Title level={4} className={styles['notesTitle'] || ''}>
=======
    <div className="notes-page">
      <Row gutter={24} style={{ height: '100%' }}>
        <Col xs={24} md={8} style={{ height: '100%', overflowY: 'auto' }}>
          <div style={{ padding: '16px 0' }}>
            <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
              <Title level={4} style={{ margin: 0 }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                My Notes
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateNew}
                block
<<<<<<< HEAD
=======
                disabled={isCreating}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              >
                New Note
              </Button>
            </Space>
            <NotesList
<<<<<<< HEAD
              notes={filteredNotes}
=======
              notes={displayNotes}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              loading={loading}
              onEdit={handleNoteSelect}
              onDelete={handleDeleteNote}
              onPin={handlePinNote}
              onSearch={handleSearch}
<<<<<<< HEAD
              selectedNoteId={currentNote?.id || ''}
=======
              selectedNoteId={currentNote?.id}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            />
          </div>
        </Col>
        <Col xs={24} md={16} style={{ height: '100%', overflowY: 'auto' }}>
          {showEditor ? (
            <NoteEditor
              note={isEditing ? currentNote : null}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
              onBack={handleBackToList}
              loading={loading}
            />
          ) : (
<<<<<<< HEAD
            <div className={styles['emptyState']}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className={styles['emptyStateContent']}>
                    <div className={styles['emptyStateIcon']}>
                      <PlusOutlined />
                    </div>
                    <Typography.Text type="secondary">
                      No notes yet. Create your first note to get started.
                    </Typography.Text>
                    <div className={styles['emptyStateButton']}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateNew}
                      >
                        Create Note
                      </Button>
                    </div>
                  </div>
                }
              />
=======
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: 24,
              }}
            >
              <Empty
                description={
                  <span>
                    {notes.length === 0
                      ? 'No notes yet. Create your first note!'
                      : 'Select a note to view or edit'}
                  </span>
                }
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateNew}
                style={{ marginTop: 16 }}
              >
                {notes.length === 0 ? 'Create Your First Note' : 'New Note'}
              </Button>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default NotesPage;
