import React, { useState, useEffect, useMemo } from 'react';
import { Input, Button, Space, message, Tag, Select, Result } from 'antd';
import { 
  SaveOutlined, 
  DeleteOutlined, 
  CloseOutlined,
  TagOutlined,
  ArrowLeftOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import AIToolbar from './AIToolbar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Note } from '../types/note';
import ErrorBoundary from '../../../components/ErrorBoundary';

const { Option } = Select;

interface NoteEditorProps {
  initialNote?: Note | null;
  onSave: (note: { title: string; content: string; tags?: string[] }) => Promise<Note | void>;
  onDelete?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  availableTags?: string[];
}

const NoteEditorContent: React.FC<NoteEditorProps> = ({ 
  initialNote, 
  onSave, 
  onDelete, 
  onCancel, 
  loading = false,
  availableTags = []
}) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isTagInputVisible, setIsTagInputVisible] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Update state when initialNote changes
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setTags(initialNote.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
  }, [initialNote]);

  // Filter available tags based on input
  useEffect(() => {
    if (newTag.trim() === '') {
      setFilteredTags(availableTags);
    } else {
      setFilteredTags(
        availableTags.filter(tag => 
          tag.toLowerCase().includes(newTag.toLowerCase()) && !tags.includes(tag)
        )
      );
    }
  }, [newTag, availableTags, tags]);

  const handleSave = async () => {
    if (!title.trim()) {
      message.error('Please enter a title');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave({ 
        title: title.trim(), 
        content: content.trim(),
        tags: tags
      });
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err as Error);
      message.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await onDelete();
        message.success('Note deleted successfully');
      } catch (err) {
        setError(err as Error);
        message.error('Failed to delete note');
      }
      // No rethrow here; parent already controls onDelete invocation
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setNewTag('');
    setIsTagInputVisible(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag(newTag.trim());
    } else if (e.key === 'Escape') {
      setIsTagInputVisible(false);
      setNewTag('');
    }
  };

  const editorModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    },
  }), []);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Result
          status="error"
          title="Error"
          subTitle={error.message}
          extra={[
            <Button 
              key="retry" 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => setError(null)}
            >
              Retry
            </Button>,
            onCancel && (
              <Button key="back" onClick={onCancel}>
                Go Back
              </Button>
            )
          ]}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <AIToolbar 
        content={content} 
        onContentUpdate={setContent}
        disabled={loading || isSaving}
      />
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          {onCancel && (
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={onCancel}
              className="mr-2"
            />
          )}
          <Input
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            bordered={false}
            className="text-2xl font-bold px-0"
            size="large"
          />
        </div>
        <Space>
          <Button 
            onClick={handleSave}
            type="primary" 
            icon={<SaveOutlined />} 
            loading={loading || isSaving}
            disabled={!title.trim()}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          {onDelete && (
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={loading}
            />
          )}
        </Space>
      </div>

      {/* Tags */}
      <div className="px-4 py-2 border-b bg-gray-50">
        <div className="flex flex-wrap items-center gap-2">
          {tags.map(tag => (
            <Tag 
              key={tag} 
              closable 
              onClose={() => removeTag(tag)}
              className="flex items-center"
            >
              {tag}
            </Tag>
          ))}
          
          {isTagInputVisible ? (
            <div className="relative">
              <Select
                autoFocus
                size="small"
                mode="tags"
                style={{ width: 150 }}
                placeholder="Add tags..."
                value={[]}
                onChange={(values) => {
                  values.forEach(tag => handleAddTag(tag));
                }}
                onBlur={() => {
                  if (newTag.trim()) {
                    handleAddTag(newTag.trim());
                  } else {
                    setIsTagInputVisible(false);
                  }
                }}
                onKeyDown={handleTagKeyDown}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 200 }}
                notFoundContent={null}
                showSearch
                filterOption={(input, option) => {
                  const value = option?.value as string;
                  return value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}
                dropdownRender={menu => (
                  <div>
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search or create tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        autoFocus
                        className="w-full"
                      />
                    </div>
                    {menu}
                  </div>
                )}
              >
                {filteredTags.map(tag => (
                  <Option key={tag} value={tag}>
                    {tag}
                  </Option>
                ))}
              </Select>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => {
                  setIsTagInputVisible(false);
                  setNewTag('');
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              />
            </div>
          ) : (
            <Button
              type="dashed"
              size="small"
              icon={<TagOutlined />}
              onClick={() => setIsTagInputVisible(true)}
              className="flex items-center"
            >
              Add Tag
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          placeholder="Start writing your note here..."
          className="h-full border-0"
          modules={editorModules}
          preserveWhitespace
        />
      </div>
      
      <div className="p-2 text-xs text-gray-500 border-t bg-gray-50">
        {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
};

const NoteEditor: React.FC<NoteEditorProps> = (props) => (
  <ErrorBoundary 
    componentName="NoteEditor"
    title="Error in Note Editor"
    subtitle="We encountered an error while loading the editor. Please try again."
    onError={(error) => {
      console.error('Error in NoteEditor:', error);
      // You can add error reporting here (e.g., Sentry)
    }}
  >
    <NoteEditorContent {...props} />
  </ErrorBoundary>
);

export default NoteEditor;
