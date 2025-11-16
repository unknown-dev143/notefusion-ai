import React, { useState, useRef, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react';
import './NoteEditorWithDrawing.css';
import { 
  Input, 
  Button, 
  Tag, 
  Tooltip, 
  Modal, 
  message, 
  Space,
  Select,
  Popconfirm
} from 'antd';
// @ts-ignore - ReactQuill has incorrect type definitions
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill';

// Define the editor instance type
type QuillEditor = {
  getEditor: () => Quill;
};

// Define the props for our custom ReactQuill component
type ReactQuillProps = {
  theme?: string;
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  modules?: {
    toolbar?: {
      container?: (string | { [key: string]: any })[][] | { [key: string]: any };
      handlers?: { [key: string]: () => void };
    };
    clipboard?: {
      matchVisual?: boolean;
    };
  };
  formats?: string[];
  className?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
};

// Create a typed ref for the editor
const ReactQuillWithRef = forwardRef<QuillEditor, Omit<ReactQuillProps, 'ref'>>((props, ref) => {
  const quillRef = useRef<{
    getEditor: () => Quill;
  }>(null);
  
  // Expose the editor instance via ref
  useImperativeHandle(ref, () => ({
    getEditor: () => {
      if (!quillRef.current) {
        throw new Error('Quill editor not initialized');
      }
      // @ts-ignore - getEditor exists on the component instance
      const editor = quillRef.current.getEditor();
      if (!editor) {
        throw new Error('Failed to get Quill editor instance');
      }
      return editor;
    }
  }));
  
  // @ts-ignore - We're handling the ref in a custom way
  return <ReactQuill ref={quillRef} {...props} />;
});

// Icons
import { 
  SaveOutlined, 
  DeleteOutlined, 
  StarOutlined, 
  StarFilled, 
  ArrowLeftOutlined,
  PlusOutlined,
  TagOutlined,
  PictureOutlined,
  PushpinFilled, 
  PushpinOutlined, 
  EditOutlined 
} from '@ant-design/icons';
import ErrorBoundary from '../../../components/ErrorBoundary';

// Define Note interface
export interface Note {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Custom DrawingBlot for embedding drawings in Quill
const BlockEmbed = Quill.import('blots/block/embed');

class DrawingBlot extends BlockEmbed {
  static blotName = 'drawing';
  static tagName = 'div';
  static className = 'ql-drawing';

  static create(value: { url: string }) {
    const node = super.create() as HTMLElement;
    node.setAttribute('contenteditable', 'false');
    const img = document.createElement('img');
    img.src = value.url;
    img.alt = 'Drawing';
    img.className = 'drawing-image';
    node.appendChild(img);
    return node;
  }

  static value(domNode: HTMLElement) {
    const img = domNode.querySelector('img');
    return { url: img?.getAttribute('src') || '' };
  }
}

Quill.register(DrawingBlot);

// Drawing Panel Component
interface DrawingPanelProps {
  onSave: (data: string) => void;
  onCancel: () => void;
}

const DrawingPanel: React.FC<DrawingPanelProps> = ({ onSave, onCancel }) => {
  const [drawingData, setDrawingData] = useState('');
  
  const handleSave = useCallback(() => {
    if (drawingData) {
      onSave(drawingData);
    }
  }, [drawingData, onSave]);
  
  return (
    <div className="drawing-panel">
      <div className="drawing-area">
        <div 
          className="drawing-canvas"
          onMouseDown={() => {
            // Simple drawing implementation
            const canvas = document.createElement('canvas');
            canvas.className = 'drawing-canvas-element';
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#000000';
              ctx.fillRect(50, 50, 100, 100);
              setDrawingData(canvas.toDataURL('image/png'));
            }
          }}
        >
          <p className="drawing-placeholder">
            Click and drag to draw (simple demo - creates a black square)
          </p>
        </div>
      </div>
      <div className="drawing-actions">
        <Button onClick={onCancel} className="cancel-button">
          Cancel
        </Button>
        <Button 
          type="primary" 
          onClick={handleSave}
          disabled={!drawingData}
        >
          Save Drawing
        </Button>
      </div>
    </div>
  );
};

// Main Editor Component
interface NoteEditorWithDrawingProps {
  initialNote?: Note | null;
  onSave: (note: { 
    title: string; 
    content: string; 
    tags?: string[];
    id?: string;
  }) => Promise<void>;
  onDelete?: () => void;
  onCancel?: () => void;
  onPinToggle?: () => void;
  loading?: boolean;
  availableTags?: string[];
  isPinned?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const NoteEditorWithDrawing: React.FC<NoteEditorWithDrawingProps> = ({
  initialNote,
  onSave,
  onDelete,
  onCancel,
  onPinToggle,
  loading = false,
  availableTags = [],
  isPinned = false,
  className = '',
  style = {}
}) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [tagInputVisible, setTagInputVisible] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');
  const quillRef = useRef<QuillEditor>(null);

  // Handle content change in the editor
  const handleContentChange = useCallback((content: string) => {
    setContent(content);
  }, []);

  // Handle tag input change
  const handleTagInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInputValue(e.target.value);
  }, []);

  // Add a new tag
  const handleAddTag = useCallback(() => {
    if (tagInputValue && !tags.includes(tagInputValue)) {
      setTags([...tags, tagInputValue]);
      setTagInputValue('');
    }
    setTagInputVisible(false);
  }, [tagInputValue, tags]);

  // Remove a tag
  const handleRemoveTag = useCallback((removedTag: string) => {
    setTags(tags.filter(tag => tag !== removedTag));
  }, [tags]);

  // Handle save button click
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      message.error('Please enter a title');
      return;
    }

    try {
      await onSave({
        id: initialNote?.id,
        title: title.trim(),
        content,
        tags
      });
      message.success('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note');
    }
  }, [title, content, tags, initialNote?.id, onSave]);

  // Handle drawing save
  const handleAddDrawing = useCallback((dataUrl: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'drawing', { url: dataUrl }, 'user');
      quill.setSelection(range.index + 1, 0, 'silent');
    }
    setIsDrawingOpen(false);
  }, []);

  // Quill modules and formats
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image', 'drawing'],
        ['clean']
      ],
      handlers: {
        drawing: () => {
          setIsDrawingOpen(true);
        }
      }
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image', 'drawing'
  ];

  return (
    <ErrorBoundary>
      <div className={`note-editor ${className}`}>
        <div className="editor-header">
          <Input
            className="note-title"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <Space className="editor-actions">
            {onPinToggle && (
              <Tooltip title={isPinned ? 'Unpin note' : 'Pin note'}>
                <Button
                  type="text"
                  icon={isPinned ? <StarFilled /> : <StarOutlined />}
                  onClick={onPinToggle}
                  disabled={loading}
                />
              </Tooltip>
            )}
            {onCancel && (
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={onCancel}
                disabled={loading}
              >
                Back
              </Button>
            )}
            {onDelete && (
              <Popconfirm
                title="Are you sure you want to delete this note?"
                onConfirm={onDelete}
                okText="Yes"
                cancelText="No"
                disabled={loading}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={loading}
                >
                  Delete
                </Button>
              </Popconfirm>
            )}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              Save
            </Button>
          </Space>
        </div>

        <div className="tags-section">
          {tags.map(tag => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(tag)}
            >
              {tag}
            </Tag>
          ))}
          {tagInputVisible ? (
            <Input
              type="text"
              size="small"
              className="tag-input"
              value={tagInputValue}
              onChange={handleTagInputChange}
              onBlur={handleAddTag}
              onPressEnter={handleAddTag}
              autoFocus
            />
          ) : (
            <Tag
              className="site-tag-plus"
              onClick={() => setTagInputVisible(true)}
            >
              <PlusOutlined /> New Tag
            </Tag>
          )}
        </div>

        <div className="editor-container">
          <div className="quill-wrapper">
            <ReactQuillWithRef
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={handleContentChange}
              placeholder="Write your note here..."
              modules={modules}
              formats={formats}
              className="note-quill-editor"
              readOnly={loading}
            />
          </div>
        </div>

        <Modal
          title="Add Drawing"
          open={isDrawingOpen}
          onCancel={() => setIsDrawingOpen(false)}
          footer={null}
          width={800}
        >
          <DrawingPanel
            onSave={handleAddDrawing}
            onCancel={() => setIsDrawingOpen(false)}
          />
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default NoteEditorWithDrawing;
