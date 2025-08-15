import React from 'react';
import { List, Card, Tag, Button, Space, Typography, Input } from 'antd';
import { EditOutlined, DeleteOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { Note } from '../../features/notes/context/NoteContext';

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
    <div className="notes-list">
      <div className="notes-search" style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search notes..."
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: '100%' }}
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
            className={selectedNoteId === note.id ? 'selected-note' : ''}
            style={{
              backgroundColor: selectedNoteId === note.id ? '#f0f7ff' : 'transparent',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 8,
              cursor: 'pointer',
            }}
            onClick={() => onEdit(note)}
            actions={[
              <Space key="actions" size="small">
                <Button
                  type="text"
                  size="small"
                  icon={note.isPinned ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
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
                <Text type="secondary" ellipsis={{ rows: 2 }}>
                  {note.content?.replace(/<[^>]*>/g, '') || 'No content'}
                </Text>
              }
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
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
