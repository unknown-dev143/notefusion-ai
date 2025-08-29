import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Button, message, Empty, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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
      };

      if (currentNote?.id) {
        // Update existing note
        await updateNote(currentNote.id, noteUpdate);
        message.success('Note updated successfully');
      } else {
        // Create new note with required fields
        const newNote = await createNote({
          ...noteUpdate,
          type: 'text' as const,
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
  const isEditing = Boolean(noteId && noteId !== 'new');
  const isCreating = noteId === 'new';
  const showEditor = isEditing || isCreating;

  return (
    <div className={styles['notesPage']}>
      <Row gutter={24} className={styles['notesContainer']}>
        <Col xs={24} md={8} className={styles['notesList']}>
          <div className={styles['notesContainer']}>
            <Space className={styles['notesHeader'] || ''} direction="vertical">
              <Title level={4} className={styles['notesTitle'] || ''}>
                My Notes
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateNew}
                block
              >
                New Note
              </Button>
            </Space>
            <NotesList
              notes={filteredNotes}
              loading={loading}
              onEdit={handleNoteSelect}
              onDelete={handleDeleteNote}
              onPin={handlePinNote}
              onSearch={handleSearch}
              selectedNoteId={currentNote?.id || ''}
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
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default NotesPage;
