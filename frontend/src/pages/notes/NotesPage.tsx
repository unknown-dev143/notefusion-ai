import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Button, message, Empty, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNotes } from '../../features/notes/context/NoteContext';
import { Note } from '../../types/note';
import NotesList from '../../components/notes/NotesList';
import NoteEditor from '../../components/notes/NoteEditor';

const { Title } = Typography;

// Define the Note type for better type safety
type NoteWithOptionalId = Omit<Note, 'id'> & { id?: string };

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
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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

  const handleSaveNote = useCallback(async (noteData: Pick<Note, 'title' | 'content' | 'tags' | 'type'>) => {
    try {
      const noteUpdate = {
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        tags: noteData.tags || [],
        type: noteData.type || 'text',
      };

      if (currentNote?.id) {
        // Update existing note
        await updateNote(currentNote.id, noteUpdate);
        message.success('Note updated successfully');
      } else {
        // Create new note
        const newNote = await createNote({
          ...noteUpdate,
          type: 'text',
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

  const displayNotes = searchQuery ? filteredNotes : notes;
  const isEditing = Boolean(noteId && noteId !== 'new');
  const isCreating = noteId === 'new';
  const showEditor = isEditing || isCreating;

  return (
    <div className="notes-page">
      <Row gutter={24} style={{ height: '100%' }}>
        <Col xs={24} md={8} style={{ height: '100%', overflowY: 'auto' }}>
          <div style={{ padding: '16px 0' }}>
            <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
              <Title level={4} style={{ margin: 0 }}>
                My Notes
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateNew}
                block
                disabled={isCreating}
              >
                New Note
              </Button>
            </Space>
            <NotesList
              notes={displayNotes}
              loading={loading}
              onEdit={handleNoteSelect}
              onDelete={handleDeleteNote}
              onPin={handlePinNote}
              onSearch={handleSearch}
              selectedNoteId={currentNote?.id}
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
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default NotesPage;
