import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Space, Typography, message, Tag } from 'antd';
import { SaveOutlined, TagOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Note } from '../../features/notes/context/NoteContext';
import './NoteEditor.css';

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
        <Space className="note-editor-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className="back-button"
          />
          <Input
            className="note-title-input"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            bordered={false}
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
      <div className="note-tags">
        <Space size={[0, 8]} wrap>
          {tags.map((tag) => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(tag)}
              className="note-tag"
            >
              {tag}
            </Tag>
          ))}
          <Input
            size="small"
            className="note-tag-input"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            prefix={<TagOutlined />}
          />
        </Space>
      </div>

      <div className="note-content">
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
        <div className="note-footer">
          <Text type="secondary">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default NoteEditor;
