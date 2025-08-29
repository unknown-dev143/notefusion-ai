import React from 'react';
<<<<<<< HEAD
import { List, Tag, Button, Space, Typography, Input } from 'antd';
import { EditOutlined, DeleteOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { Note } from '../../features/notes/context/NoteContext';
import styles from './NotesList.module.css';
=======
import { List, Card, Tag, Button, Space, Typography, Input } from 'antd';
import { EditOutlined, DeleteOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { Note } from '../../features/notes/context/NoteContext';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

const { Text } = Typography;
const { Search } = Input;

interface NotesListProps {
  notes: Note[];
  loading: boolean;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onSearch: (query: string) => void;
  selectedNoteId?: string;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  loading,
  onEdit,
  onDelete,
  onPin,
  onSearch,
  selectedNoteId,
}) => {
  return (
<<<<<<< HEAD
    <div className={styles['notesList']}>
      <div className={styles['notesSearch']}>
=======
    <div className="notes-list">
      <div className="notes-search" style={{ marginBottom: 16 }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Search
          placeholder="Search notes..."
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
<<<<<<< HEAD
          className={styles['searchInput']}
=======
          style={{ width: '100%' }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          allowClear
        />
      </div>

      <List
        itemLayout="vertical"
        size="large"
        loading={loading}
        dataSource={notes}
        renderItem={(note) => (
          <List.Item
            key={note.id}
<<<<<<< HEAD
            className={`${styles['noteItem']} ${selectedNoteId === note.id ? styles['noteItem'] + ' ' + styles['selectedNote'] : ''}`}
=======
            className={selectedNoteId === note.id ? 'selected-note' : ''}
            style={{
              backgroundColor: selectedNoteId === note.id ? '#f0f7ff' : 'transparent',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 8,
              cursor: 'pointer',
            }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            onClick={() => onEdit(note)}
            actions={[
              <Space key="actions" size="small">
                <Button
                  type="text"
                  size="small"
<<<<<<< HEAD
                  icon={note.isPinned ? <StarFilled className={styles['pinnedIcon']} /> : <StarOutlined />}
=======
                  icon={note.isPinned ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin(note.id, !note.isPinned);
                  }}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(note);
                  }}
                />
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                  }}
                />
              </Space>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong ellipsis={{ tooltip: note.title }}>
                    {note.title || 'Untitled Note'}
                  </Text>
                  {note.tags?.map((tag) => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </Space>
              }
              description={
<<<<<<< HEAD
                <Text 
                  type="secondary" 
                  ellipsis={{ 
                    tooltip: note.content?.replace(/<[^>]*>/g, '') || 'No content' 
                  }}
                  style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
=======
                <Text type="secondary" ellipsis={{ rows: 2 }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  {note.content?.replace(/<[^>]*>/g, '') || 'No content'}
                </Text>
              }
            />
<<<<<<< HEAD
            <div className={styles['noteDate']}>
              <Text type="secondary">
=======
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                {new Date(note.updatedAt).toLocaleDateString()}
              </Text>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default NotesList;
