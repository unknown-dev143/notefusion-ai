import React, { useState } from 'react';
import { List, Button, Input, Typography, Empty, Tag, Spin } from 'antd';
import { 
  StarOutlined, 
  StarFilled, 
  DeleteOutlined, 
  PlusOutlined, 
  SearchOutlined 
} from '@ant-design/icons';
import type { Note } from '../types/note';
import { ExportImportButtons } from '../../exportImport';

const { Text } = Typography;

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
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span>No notes found</span>
        }
      >
        <Button 
          type="primary" 
          onClick={handleCreateNewClick}
          icon={<PlusOutlined />}
        >
          Create Note
        </Button>
      </Empty>
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        minHeight: '300px'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
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
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        <List
          dataSource={filteredNotes}
          renderItem={renderNoteItem}
          locale={{ emptyText: renderEmpty() }}
        />
      </div>
    </div>
  );
};

export default NoteList;
