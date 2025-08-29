import React, { useCallback, useMemo, useState } from 'react';
import { List, Button, Input, Typography, Empty, Tag, Spin, Space, Card } from 'antd';
import { 
  StarOutlined, 
  StarFilled, 
  DeleteOutlined, 
  PlusOutlined, 
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

const { Text } = Typography;

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string | null;
  onSelectNote: (note: Note | null) => void;
  onCreateNew: () => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
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
  loading = false,
  userId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
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
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>No notes found</span>
        }
      >
        <Button 
          type="primary" 
          onClick={handleCreateNewClick}
          icon={<EditOutlined />}
          className="new-note-button"
        >
          Create Note
        </Button>
      </Empty>
    </div>
  );

  if (loading) {
    return (
      <div className={typedStyles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={typedStyles.container}>
      <Card 
        size="small" 
        className={typedStyles.searchCard}
      >
        <div className="search-input-container">
          <Input
            placeholder="Search notes..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
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
        />
      </div>
    </div>
  );
};

export default NoteList;
