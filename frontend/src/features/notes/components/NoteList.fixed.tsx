import React, { useState, useEffect } from 'react';
import { List, Button, message, Modal, Empty, Input } from 'antd';
import { StarOutlined, StarFilled, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { Note, NoteFilters } from '../types';
import { useAuth } from '../../../contexts/AuthContext';
import { noteService } from '../services/noteService';
import NoteEditor from './NoteEditor';

const { confirm } = Modal;

interface NoteListProps {
  folderId?: string;
  onNoteSelect?: (note: Note | null) => void;
  initialFilters?: Partial<NoteFilters>;
}

const NoteList: React.FC<NoteListProps> = ({
  folderId,
  onNoteSelect,
  initialFilters = {}
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [filters] = useState<NoteFilters>({
    isDeleted: false,
    isArchived: false,
    ...initialFilters,
    ...(folderId ? { folderId } : {})
  });

  // Handle search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(
        note =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (note.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredNotes(filtered);
    }
  }, [searchTerm, notes]);
  
  // Load notes when component mounts or filters change
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const notesData = await noteService.getAllNotes({
          ...filters,
          userId: user.id,
        });
        setNotes(notesData);
        setFilteredNotes(notesData);
      } catch (err) {
        const error = err as Error;
        message.error(error.message || 'Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, [filters, user]);

  // Handle note save
  const handleSaveNote = async (noteData: { title: string; content: string; tags?: string[] }) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      if (selectedNote) {
        // Update existing note
        const updatedNote = await noteService.updateNote(selectedNote.id, {
          ...noteData,
          updatedAt: new Date().toISOString(),
          lastEditedBy: user.id,
        });
        
        setNotes(prevNotes => 
          prevNotes.map(n => n.id === updatedNote.id ? updatedNote : n)
        );
        setSelectedNote(updatedNote);
        message.success('Note updated successfully');
      } else {
        // Create new note
        const newNote = await noteService.createNote({
          ...noteData,
          userId: user.id,
          folderId: folderId || undefined,
          isPinned: false,
          isArchived: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: noteData.tags || [],
        });
        
        setNotes(prevNotes => [newNote, ...prevNotes]);
        setSelectedNote(newNote);
        setIsCreatingNew(false);
        message.success('Note created successfully');
      }
      
      if (onNoteSelect) {
        onNoteSelect(selectedNote);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId: string) => {
    try {
      setIsDeleting(true);
      
      confirm({
        title: 'Delete Note',
        content: 'Are you sure you want to delete this note?',
        okText: 'Yes, delete it',
        okType: 'danger',
        cancelText: 'No, keep it',
        onOk: async () => {
          await noteService.deleteNote(noteId);
          setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
          
          if (selectedNote?.id === noteId) {
            setSelectedNote(null);
          }
          
          message.success('Note deleted successfully');
        },
        onCancel() {
          console.log('Cancelled');
        },
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      message.error('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle pin status of a note
  const handleTogglePin = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const updatedNote = await noteService.togglePinNote(noteId);
      
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === updatedNote.id ? { ...note, isPinned: updatedNote.isPinned } : note
        )
      );
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(prev => prev ? { ...prev, isPinned: updatedNote.isPinned } : null);
      }
      
      message.success(updatedNote.isPinned ? 'Note pinned' : 'Note unpinned');
    } catch (error) {
      console.error('Error toggling pin status:', error);
      message.error('Failed to update note');
    }
  };

  // Handle creating a new note
  const handleCreateNew = () => {
    setSelectedNote(null);
    setIsCreatingNew(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render note list item
  const renderNoteItem = (note: Note) => {
    const isSelected = selectedNote?.id === note.id;
    const isPinned = note.isPinned;
    
    return (
      <List.Item
        onClick={() => setSelectedNote(note)}
        style={{
          cursor: 'pointer',
          backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
          borderLeft: isSelected ? '3px solid #1890ff' : '3px solid transparent',
          padding: '12px 16px',
          marginBottom: 8,
          borderRadius: 4,
          transition: 'all 0.3s',
        }}
        actions={[
          <Button
            key="pin"
            type="text"
            icon={isPinned ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={(e) => handleTogglePin(note.id, e)}
            title={isPinned ? 'Unpin note' : 'Pin note'}
          />,
          <Button
            key="delete"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNote(note.id);
            }}
            title="Delete note"
            loading={isDeleting}
          />,
        ]}
      >
        <List.Item.Meta
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isPinned && <StarFilled style={{ color: '#faad14', marginRight: 8 }} />}
              <span style={{ fontWeight: 'bold' }}>{note.title || 'Untitled Note'}</span>
            </div>
          }
          description={
            <div>
              <div style={{ margin: '4px 0' }}>
                {note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {note.tags?.map(tag => (
                  <span key={tag} style={{
                    backgroundColor: '#f0f0f0',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 12,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                {formatDate(note.updatedAt)}
              </div>
            </div>
          }
        />
      </List.Item>
    );
  };

  // Render empty state
  const renderEmpty = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span>No notes found</span>
      }
    >
      <Button 
        type="primary" 
        onClick={handleCreateNew}
        icon={<PlusOutlined />}
        loading={isSaving}
      >
        Create your first note
      </Button>
    </Empty>
  );

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Sidebar with note list */}
      <div style={{ width: 300, borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateNew}
            style={{ width: '100%', marginTop: 16 }}
            loading={isSaving}
          >
            New Note
          </Button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <List
            dataSource={filteredNotes}
            renderItem={renderNoteItem}
            loading={isLoading}
            locale={{ emptyText: renderEmpty() }}
          />
        </div>
      </div>
      
      {/* Main content area */}
      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        {isCreatingNew ? (
          <NoteEditor
            note={null}
            onSave={handleSaveNote}
            onCancel={() => setIsCreatingNew(false)}
            onDelete={() => {}}
            availableTags={[]}
            isSaving={isSaving}
          />
        ) : selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onSave={handleSaveNote}
            onCancel={() => setSelectedNote(null)}
            onDelete={() => handleDeleteNote(selectedNote.id)}
            availableTags={[]}
            isSaving={isSaving}
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#8c8c8c',
          }}>
            <p>Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteList;
