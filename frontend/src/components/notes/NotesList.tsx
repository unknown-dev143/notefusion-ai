import React from 'react';
import { List, Tag, Button, Space, Typography, Input } from 'antd';
import { EditOutlined, DeleteOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { Note } from '../../features/notes/context/NoteContext';
import styles from './NotesList.module.css';

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
    <div className={styles['notesList']}>
      <div className={styles['notesSearch']}>
        <Search
          placeholder="Search notes..."
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
          className={styles['searchInput']}
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
            className={`${styles['noteItem']} ${selectedNoteId === note.id ? styles['noteItem'] + ' ' + styles['selectedNote'] : ''}`}
            onClick={() => onEdit(note)}
            actions={[
              <Space key="actions" size="small">
                <Button
                  type="text"
                  size="small"
                  icon={note.isPinned ? <StarFilled className={styles['pinnedIcon']} /> : <StarOutlined />}
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
                <Text 
                  type="secondary" 
                  ellipsis={{ 
                    tooltip: note.content?.replace(/<[^>]*>/g, '') || 'No content' 
                  }}
                  style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {note.content?.replace(/<[^>]*>/g, '') || 'No content'}
                </Text>
              }
            />
            <div className={styles['noteDate']}>
              <Text type="secondary">
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
