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

const { Text } = Typography;

// Type definition for CSS modules
type CSSModuleClasses = { readonly [key: string]: string };

// Type assertion for CSS modules
const typedStyles = (styles || {}) as unknown as CSSModuleClasses & {
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

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: string | null;
  onSelectNote: (note: Note | null) => void;
  onCreateNew: () => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  onSetReminder?: (noteId: string) => void;
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
  onSetReminder,
  loading = false,
  userId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

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
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  }, [notes, searchTerm]);

  // Handle note selection
  const handleNoteClick = useCallback((note: Note) => {
    onSelectNote(note);
  }, [onSelectNote]);

  // Handle create new note
  const handleCreateNewClick = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    onCreateNew();
  }, [onCreateNew]);

  // Render each note item
  const renderNoteItem = useCallback((note: Note) => (
    <List.Item
      key={note.id}
      onClick={() => handleNoteClick(note)}
      className={`${typedStyles.noteItem || 'note-item'} ${selectedNoteId === note.id ? (typedStyles.selected || 'selected') : ''}`}
      style={{
        cursor: 'pointer',
        padding: '12px 16px',
        marginBottom: 8,
        borderRadius: 4,
        transition: 'all 0.3s',
        borderLeft: selectedNoteId === note.id ? '3px solid #1890ff' : '3px solid transparent',
        backgroundColor: selectedNoteId === note.id ? '#f0f7ff' : 'transparent',
      }}
    >
      <div style={{ width: '100%' }}>
        <div className={typedStyles.noteHeader || ""} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <Text strong className={typedStyles.noteTitle || ""} ellipsis={{ tooltip: note.title }} style={{ fontSize: '15px', maxWidth: '75%' }}>
            {note.title || 'Untitled Note'}
          </Text>
          <Space size={4}>
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
            {onSetReminder && (
              <Button
                type="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetReminder(note.id);
                }}
                title="Set reminder"
              >
                ⏰
              </Button>
            )}
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
          className={typedStyles.noteContent || ""}
          style={{ fontSize: '13px', display: 'block', marginBottom: 8 }}
        >
          {note.content?.replace(/<[^>]*>?/gm, '') || 'No content'}
        </Text>
        
        <div className={typedStyles.noteFooter || ""} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {note.tags && note.tags.length > 0 && (
              <div className={typedStyles.tagsContainer || ""} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {note.tags.slice(0, 2).map((tagName) => (
                  <Tag 
                    key={tagName} 
                    color="blue" 
                    className={typedStyles.tag || ""}
                    style={{ margin: 0, fontSize: '11px' }}
                  >
                    {tagName}
                  </Tag>
                ))}
                {note.tags.length > 2 && (
                  <Tag className={typedStyles.tag || ""} style={{ margin: 0, fontSize: '11px' }}>
                    +{note.tags.length - 2}
                  </Tag>
                )}
              </div>
            )}
            {note.reminder && (
              <Tag color="orange" style={{ marginTop: 4, fontSize: '11px' }}>
                Reminds: {new Date(note.reminder).toLocaleString()}
              </Tag>
            )}
          </div>
          
          <Text type="secondary" className={typedStyles.noteDate || ""} style={{ fontSize: '12px' }}>
            {formatDate(note.updatedAt || note.createdAt)}
          </Text>
        </div>
      </div>
    </List.Item>
  ), [handleNoteClick, onDeleteNote, onTogglePin, onSetReminder, selectedNoteId]);

  // Render empty state
  const renderEmpty = () => (
    <div className={typedStyles.emptyState || ""} style={{ textAlign: 'center', padding: '40px 16px' }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>No notes found</span>
        }
      >
        <Button 
          type="primary" 
          onClick={() => handleCreateNewClick()}
          icon={<EditOutlined />}
        >
          Create Note
        </Button>
      </Empty>
    </div>
  );

  if (loading) {
    return (
      <div className={typedStyles.loadingContainer || ""} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={typedStyles.container || ""} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              onClick={(e) => handleCreateNewClick(e)}
            >
              New Note
            </Button>
          </div>
        </div>
        
        <div>
          <Input
            placeholder="Search notes..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: '100%' }}
          />
        </div>
      </div>
      
      <div className={typedStyles.listContainer || ""} style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        <List<Note>
          dataSource={filteredNotes}
          renderItem={renderNoteItem}
          locale={{ emptyText: renderEmpty() }}
          rowKey="id"
        />
      </div>
    </div>
  );
};

export default NoteList;
