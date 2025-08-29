import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Card, Input, Button, Space, Typography, message, Tag } from 'antd';
=======
import { Card, Input, Button, Space, Typography, message, Tag, Tooltip } from 'antd';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import { SaveOutlined, TagOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Note } from '../../features/notes/context/NoteContext';
<<<<<<< HEAD
import './NoteEditor.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

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
<<<<<<< HEAD
        <Space className="note-editor-header">
=======
        <Space>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
<<<<<<< HEAD
            className="back-button"
          />
          <Input
            className="note-title-input"
=======
            style={{ marginRight: 8 }}
          />
          <Input
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            bordered={false}
<<<<<<< HEAD
=======
            style={{ fontSize: '1.5em', fontWeight: 'bold' }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
      <div className="note-tags">
=======
      <div className="note-tags" style={{ marginBottom: 16 }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Space size={[0, 8]} wrap>
          {tags.map((tag) => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(tag)}
<<<<<<< HEAD
              className="note-tag"
=======
              style={{ marginRight: 0 }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            >
              {tag}
            </Tag>
          ))}
          <Input
            size="small"
<<<<<<< HEAD
            className="note-tag-input"
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            prefix={<TagOutlined />}
<<<<<<< HEAD
=======
            style={{ width: 100 }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          />
        </Space>
      </div>

<<<<<<< HEAD
      <div className="note-content">
=======
      <div className="note-content" style={{ minHeight: '60vh' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
        <div className="note-footer">
=======
        <div style={{ marginTop: 16, textAlign: 'right' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          <Text type="secondary">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default NoteEditor;
