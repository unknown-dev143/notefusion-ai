<<<<<<< HEAD
import React, { useCallback, useMemo, useState } from 'react';
import { List, Button, Input, Typography, Empty, Tag, Spin, Space, Card } from 'antd';
=======
import React, { useState } from 'react';
import { List, Button, Input, Typography, Empty, Tag, Spin } from 'antd';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import { 
  StarOutlined, 
  StarFilled, 
  DeleteOutlined, 
  PlusOutlined, 
<<<<<<< HEAD
  SearchOutlined,
  EditOutlined 
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import type { Note } from '../types/note';
import { ExportImportButtons } from '../../exportImport';
import styles from './NoteList.module.css';

// Type definition for CSS modules
type CSSModuleClasses = { readonly [key: string]: string };

// Type assertion for CSS modules
const typedStyles = styles as unknown as CSSModuleClasses & {
  noteItem: string;
  selected: string;
  noteHeader: string;
  noteTitle: string;
  noteContent: string;
  noteFooter: string;
  tagsContainer: string;
  tag: string;
  noteDate: string;
  emptyState: string;
  loadingContainer: string;
  container: string;
  searchCard: string;
  listContainer: string;
};
=======
  SearchOutlined 
} from '@ant-design/icons';
import type { Note } from '../types/note';
import { ExportImportButtons } from '../../exportImport';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

const { Text } = Typography;

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string | null;
  onSelectNote: (note: Note | null) => void;
  onCreateNew: () => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
<<<<<<< HEAD
=======
  onSetReminder?: (noteId: string) => void;
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  loading?: boolean;
  userId: string;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNew,
  onDeleteNote,
  onTogglePin,
<<<<<<< HEAD
=======
  onSetReminder,
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  loading = false,
  userId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
<<<<<<< HEAD
  
  // Handle note selection
  const handleNoteClick = useCallback((note: Note) => {
    onSelectNote(note);
  }, [onSelectNote]);

  // Filter and sort notes based on search term
  const filteredNotes = useMemo(() => {
    let filtered = [...notes];
    
    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        (note.title?.toLowerCase().includes(term) || 
         (note.content || '').toLowerCase().includes(term) ||
         (note.tags && note.tags.some(tag => 
           tag.toLowerCase().includes(term)
         ))
        )
      );
    }
    
    // Sort by pinned status and then by date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchTerm]);

  // Handle create new note
  const handleCreateNewClick = useCallback(() => {
    onCreateNew();
  }, [onCreateNew]);

  // Render each note item
  const renderNoteItem = useCallback((note: Note) => (
    <List.Item
      key={note.id}
      onClick={() => handleNoteClick(note)}
      className={`${typedStyles.noteItem} ${selectedNoteId === note.id ? typedStyles.selected : ''}`}
    >
      <div>
        <div className={typedStyles.noteHeader}>
          <Text strong className={typedStyles.noteTitle} ellipsis={{ tooltip: note.title }}>
            {note.title || 'Untitled Note'}
          </Text>
          <Space>
            <Button
              type="text"
              size="small"
              icon={note.isPinned ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
            />
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
              title="Delete note"
              danger
            />
          </Space>
        </div>
        
        <Text 
          type="secondary" 
          ellipsis={{ tooltip: note.content?.substring(0, 200) || 'No content' }}
          className={typedStyles.noteContent}
        >
          {note.content?.replace(/<[^>]*>?/gm, '') || 'No content'}
        </Text>
        
        <div className={typedStyles.noteFooter}>
          <div>
            {note.tags && note.tags.length > 0 && (
              <div className={typedStyles.tagsContainer}>
                {note.tags.slice(0, 2).map((tagName) => (
                  <Tag 
                    key={tagName} 
                    color="blue" 
                    className={typedStyles.tag}
                  >
                    {tagName}
                  </Tag>
                ))}
                {note.tags.length > 2 && (
                  <Tag className={typedStyles.tag}>
                    +{note.tags.length - 2}
                  </Tag>
                )}
              </div>
            )}
          </div>
          
          <Text type="secondary" className={typedStyles.noteDate}>
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </Text>
        </div>
      </div>
    </List.Item>
  ), [handleNoteClick, onDeleteNote, onTogglePin, selectedNoteId]);

  // Render empty state
  const renderEmpty = () => (
    <div className={typedStyles.emptyState}>
=======

  // Filter notes based on search term
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.tags && note.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  // Handle note selection
  const handleNoteClick = (note: Note) => {
    onSelectNote(note);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Handle create new note
  const handleCreateNewClick = (e: React.MouseEvent) => {
    e?.stopPropagation();
    onSelectNote(null);
    onCreateNew();
  };

  // Render note item
  const renderNoteItem = (note: Note) => {
    const isSelected = selectedNoteId === note.id;
    
    return (
      <List.Item
        key={note.id}
        onClick={() => handleNoteClick(note)}
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
            type="text"
            icon={note.isPinned ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
            key="pin"
          />,
          onSetReminder && (
            <Button
              type="text"
              onClick={(e) => {
                e.stopPropagation();
                onSetReminder(note.id);
              }}
              title="Set reminder"
              key="reminder"
            >
              ⏰
            </Button>
          ),
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteNote(note.id);
            }}
            title="Delete note"
            key="delete"
          />,
        ]}
      >
        <List.Item.Meta
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text 
                ellipsis={{ tooltip: note.title }} 
                style={{ 
                  fontWeight: 500, 
                  marginRight: 8, 
                  maxWidth: 200 
                }}
              >
                {note.title || 'Untitled Note'}
              </Text>
              {note.isPinned && <StarFilled style={{ color: '#faad14', fontSize: 12 }} />}
            </div>
          }
          description={
            <div>
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: 12, 
                  display: 'block',
                  marginBottom: 4
                }}
              >
                {formatDate(note.updatedAt || note.createdAt)}
              </Text>
              {note.tags && note.tags.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  {note.tags.slice(0, 2).map(tag => (
                    <Tag key={tag} color="blue" style={{ marginRight: 4, marginBottom: 4 }}>
                      {tag}
                    </Tag>
                  ))}
                  {note.tags.length > 2 && (
                    <Tag>+{note.tags.length - 2} more</Tag>
                  )}
                </div>
              )}
              {note.reminder && (
                <div style={{ marginTop: 6 }}>
                  <Tag color="orange">
                    Reminds: {formatDate(note.reminder)}
                  </Tag>
                </div>
              )}
            </div>
          }
        />
      </List.Item>
    );
  };

  // Removed duplicate renderEmpty and loading blocks

  // Render empty state
  const renderEmpty = () => (
    <div style={{ textAlign: 'center', padding: '40px 16px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>No notes found</span>
        }
      >
        <Button 
          type="primary" 
          onClick={handleCreateNewClick}
<<<<<<< HEAD
          icon={<EditOutlined />}
          className="new-note-button"
=======
          icon={<PlusOutlined />}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        >
          Create Note
        </Button>
      </Empty>
    </div>
  );

  if (loading) {
    return (
<<<<<<< HEAD
      <div className={typedStyles.loadingContainer}>
=======
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        minHeight: '300px'
      }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Spin size="large" />
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className={typedStyles.container}>
      <Card 
        size="small" 
        className={typedStyles.searchCard}
      >
        <div className="search-input-container">
=======
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>My Notes</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExportImportButtons 
              selectedNotes={selectedNoteId ? notes.filter(n => n.id === selectedNoteId) : []}
              buttonSize="small"
              userId={userId}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreateNewClick}
            >
              New Note
            </Button>
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          <Input
            placeholder="Search notes..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
<<<<<<< HEAD
            className="search-input"
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateNewClick}
          >
            New
          </Button>
        </div>
        <ExportImportButtons 
          selectedNotes={selectedNoteId ? notes.filter(n => n.id === selectedNoteId) : []}
          buttonSize="small"
          userId={userId}
        />
      </Card>
      
      <div className={typedStyles.listContainer}>
        <List<Note>
          dataSource={filteredNotes}
          renderItem={renderNoteItem}
          locale={{ emptyText: renderEmpty() }}
          style={{ padding: '0 8px' }}
          rowKey="id"
=======
            style={{ width: '100%' }}
          />
        </div>
      </div>
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        <List
          dataSource={filteredNotes}
          renderItem={renderNoteItem}
          locale={{ emptyText: renderEmpty() }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        />
      </div>
    </div>
  );
};

export default NoteList;
