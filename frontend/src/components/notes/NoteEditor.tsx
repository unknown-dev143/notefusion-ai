import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Space, Typography, message, Tag, Tooltip } from 'antd';
import { SaveOutlined, TagOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Note } from '../../features/notes/context/NoteContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDelete,
  onBack,
  loading,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim()) {
      message.error('Please enter a title');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        title,
        content,
        tags,
        updatedAt: new Date().toISOString(),
      });
      message.success('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card
      className="note-editor"
      title={
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ marginRight: 8 }}
          />
          <Input
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            bordered={false}
            style={{ fontSize: '1.5em', fontWeight: 'bold' }}
          />
        </Space>
      }
      extra={
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isSaving || loading}
          >
            Save
          </Button>
          {note?.id && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => note?.id && onDelete(note.id)}
              loading={loading}
            >
              Delete
            </Button>
          )}
        </Space>
      }
    >
      <div className="note-tags" style={{ marginBottom: 16 }}>
        <Space size={[0, 8]} wrap>
          {tags.map((tag) => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(tag)}
              style={{ marginRight: 0 }}
            >
              {tag}
            </Tag>
          ))}
          <Input
            size="small"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            prefix={<TagOutlined />}
            style={{ width: 100 }}
          />
        </Space>
      </div>

      <div className="note-content" style={{ minHeight: '60vh' }}>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          placeholder="Start writing your note here..."
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              ['clean'],
              ['code-block'],
            ],
          }}
        />
      </div>

      {note?.updatedAt && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Text type="secondary">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default NoteEditor;
