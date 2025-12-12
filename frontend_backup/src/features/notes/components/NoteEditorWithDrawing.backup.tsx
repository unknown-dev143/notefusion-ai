import React, { useState, useRef, useMemo, useCallback } from 'react';
import './NoteEditorWithDrawing.css';
import { 
  Input, 
  Button, 
  Space, 
  message, 
  Tag, 
  Popconfirm, 
  Tooltip,
  Modal
} from 'antd';
import ReactQuill from 'react-quill';
import type { ReactQuill as ReactQuillType } from 'react-quill';
import Quill from 'quill';
import 'react-quill/dist/quill.snow.css';
import { 
  SaveOutlined, 
  DeleteOutlined, 
  StarOutlined, 
  StarFilled, 
  ArrowLeftOutlined,
  PlusOutlined,
  TagOutlined,
  PictureOutlined
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
    img.style.maxWidth = '100%';
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
          style={{
            width: '100%',
            height: '400px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            backgroundColor: '#fff',
            marginBottom: '16px',
            cursor: 'crosshair'
          }}
          onMouseDown={() => {
            // Simple drawing implementation
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#000000';
              ctx.fillRect(50, 50, 100, 100);
              setDrawingData(canvas.toDataURL('image/png'));
            }
          }}
        >
          <p style={{ textAlign: 'center', color: '#999', marginTop: '180px' }}>
            Click and drag to draw (simple demo - creates a black square)
          </p>
        </div>
      </div>
      <div className="drawing-actions">
        <Button onClick={onCancel} style={{ marginRight: '8px' }}>
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
  const quillRef = useRef<ReactQuillType>(null);

  // Handle content change in the editor
  const handleContentChange = (content: string) => {
    setContent(content);
  };

  // Handle tag input change
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInputValue(e.target.value);
  };

  // Add a new tag
  const handleAddTag = () => {
    if (tagInputValue && !tags.includes(tagInputValue)) {
      setTags([...tags, tagInputValue]);
    }
    setTagInputValue('');
    setTagInputVisible(false);
  };

  // Remove a tag
  const handleRemoveTag = (removedTag: string) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  // Handle save button click
  const handleSave = async () => {
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
  };

  // Handle drawing save
  const handleAddDrawing = (dataUrl: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'drawing', { url: dataUrl }, 'user');
      quill.setSelection(range.index + 1, 0, 'silent');
    }
    setIsDrawingOpen(false);
  };

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
      <div className={`note-editor ${className}`} style={style}>
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
    img.style.maxWidth = '100%';
    node.appendChild(img);
    return node;
  }

  static value(domNode: HTMLElement) {
    const img = domNode.querySelector('img');
    return { url: img?.getAttribute('src') || '' };
  }
}

Quill.register(DrawingBlot);

// Component Props
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

// Custom DrawingPanel component with proper props
const DrawingPanel: React.FC<{
  onSave: (data: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [drawingData, setDrawingData] = useState('');
  
  const handleSave = () => {
    if (drawingData) {
      onSave(drawingData);
    }
  };
  
  return (
    <div className="drawing-panel">
      <div className="drawing-area">
        {/* Simple drawing area implementation */}
        <div 
          style={{
            width: '100%',
            height: '400px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            backgroundColor: '#fff',
            marginBottom: '16px'
          }}
          onMouseDown={() => {
            // Drawing implementation would go here
            // For now, we'll just create a simple colored box
            setDrawingData('data:image/png;base64,...');
          }}
        >
          <p style={{ textAlign: 'center', color: '#999', marginTop: '180px' }}>
            Click and drag to draw
          </p>
        </div>
      </div>
      <div className="drawing-actions">
        <Button onClick={onCancel} style={{ marginRight: '8px' }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleSave}>
          Save Drawing
        </Button>
      </div>
    </div>
  );
};

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
  // State
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [isTagInputVisible, setIsTagInputVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  // Refs
  const quillRef = useRef<ReactQuill>(null);
  
  // Filter available tags to exclude already added ones
  const filteredAvailableTags = useMemo(() => {
    return availableTags.filter(tag => !tags.includes(tag));
  }, [availableTags, tags]);
  
  // Handle content change
  const handleContentChange = (
    content: string,
    delta: any,
    source: string,
    editor: any
  ) => {
    if (source === 'user' || source === 'api') {
      setContent(editor.getHTML());
    }
  };
  
  // Handle save
  const handleSave = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!title.trim()) {
      message.warning('Please enter a title');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        id: initialNote?.id,
        title: title.trim(),
        content,
        tags
      });
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle adding a new tag
  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
      setIsTagInputVisible(false);
    }
  };
  
  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle adding a drawing
  const handleAddDrawing = (imageData: string) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', imageData);
      editor.setSelection(range.index + 1, 0);
      setIsDrawingOpen(false);
    }
  };
  
  // Handle keyboard events for tag input
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag(newTag.trim());
    } else if (e.key === 'Escape') {
      setIsTagInputVisible(false);
      setNewTag('');
    }
  };
  
  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['link', 'image', 'video'],
        [{
          'drawing': true,
          'handler': () => setIsDrawingOpen(true)
        }]
      ]
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);
  
  // Quill formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'drawing'
  ];
  
  // Set initial content when initialNote changes
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
  
  // Render the component
  return (
    <div className={`note-editor-with-drawing ${className}`} style={style}>
      <div className="editor-header">
        <Space>
          {onCancel && (
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={onCancel}
              disabled={isSaving}
              aria-label="Go back"
            />
          )}
          
          {onPinToggle && (
            <Tooltip title={isPinned ? 'Unpin note' : 'Pin note'}>
              <Button
                type={isPinned ? 'primary' : 'default'}
                icon={isPinned ? <StarFilled /> : <StarOutlined />}
                onClick={onPinToggle}
                disabled={isSaving}
                aria-label={isPinned ? 'Unpin note' : 'Pin note'}
              />
            </Tooltip>
          )}
        </Space>
        
        <Space>
          {onDelete && (
            <Popconfirm
              title="Are you sure you want to delete this note?"
              onConfirm={onDelete}
              okText="Yes"
              cancelText="No"
              disabled={isSaving}
            >
              <Button 
                danger
                icon={<DeleteOutlined />}
                disabled={isSaving}
                aria-label="Delete note"
              >
                Delete
              </Button>
            </Popconfirm>
          )}
          
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isSaving}
            disabled={!title.trim()}
            aria-label="Save note"
          >
            Save
          </Button>
        </Space>
      </div>
      
      <div className="editor-content">
        <Input
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="note-title"
          aria-label="Note title"
        />
        
        <div className="tag-section">
          {tags.map(tag => (
            <Tag 
              key={tag} 
              closable 
              onClose={() => handleRemoveTag(tag)}
              className="note-tag"
            >
              {tag}
            </Tag>
          ))}
          
          {isTagInputVisible ? (
            <Select
              autoFocus
              size="small"
              className="tag-input"
              placeholder="Select or create tag"
              showSearch
              defaultOpen
              onSearch={setNewTag}
              onSelect={handleAddTag}
              onBlur={() => {
                if (newTag.trim()) {
                  handleAddTag(newTag.trim());
                } else {
                  setIsTagInputVisible(false);
                }
              }}
              onKeyDown={handleTagKeyDown}
              notFoundContent={null}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: '200px' }}
              value={newTag}
              onChange={setNewTag}
            >
              {filteredAvailableTags.map(tag => (
                <Select.Option key={tag} value={tag}>
                  {tag}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <Tag 
              className="add-tag"
              onClick={() => setIsTagInputVisible(true)}
            >
              <PlusOutlined /> Add Tag
            </Tag>
          )}
        </div>
        
        <div className="editor-container">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing your note here..."
            modules={modules}
            formats={formats}
            style={{ height: '100%' }}
          />
        </div>
      </div>
      
      {/* Drawing Panel Modal */}
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
  );
};

// Import Quill types
import type { Quill as QuillType } from 'quill';

declare global {
  interface Window {
    Quill: typeof QuillType;
  }
}

// Import the same toolbar options as RichTextEditor for consistency
const modules = {
  toolbar: {
    container: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ],
    handlers: {
      // Add custom handlers here if needed
    }
  },
  clipboard: {
    matchVisual: false,
  },
};

// Register custom formats
const BlockEmbed = Quill.import('blots/block/embed');

class DrawingBlotImpl extends BlockEmbed {
  static blotName = 'drawing';
  static tagName = 'div';
  static className = 'ql-drawing';

  static create(value: { url: string }) {
    const node = super.create() as HTMLElement;
    node.setAttribute('contenteditable', 'false');
    const img = document.createElement('img');
    img.src = value.url;
    img.alt = 'Drawing';
    img.style.maxWidth = '100%';
    node.appendChild(img);
    return node;
  }

  static value(domNode: HTMLElement) {
    const img = domNode.querySelector('img');
    return { url: img?.getAttribute('src') || '' };
  }
}

Quill.register(DrawingBlotImpl);

const { Option } = Select;

// Custom toolbar with drawing button
interface CustomToolbarProps {
  onDrawingClick: () => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ onDrawingClick }) => {
  // Handle keyboard navigation for toolbar buttons
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Add keyboard shortcuts and focus management for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle drawing mode with Ctrl+Alt+D
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        e.preventDefault();
        onDrawingClick();
        // Focus the drawing canvas when opened via keyboard
        setTimeout(() => {
          const canvas = document.querySelector('.canvas-container canvas') as HTMLCanvasElement;
          if (canvas) {
            canvas.focus();
            // Add focus styles for keyboard users
            canvas.setAttribute('tabindex', '0');
          }
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDrawingClick]);

  // Focus management for modals
  const handleModalOpen = useCallback((isOpen: boolean) => {
    if (isOpen) {
      // Focus the first focusable element when modal opens
      setTimeout(() => {
        const focusable = document.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
          (focusable as HTMLElement).focus();
        }
      }, 100);
    }
  }, []);

  return (
    <div 
      id="toolbar" 
      className="ql-toolbar ql-snow" 
      role="toolbar" 
      aria-label="Text formatting"
    >
      <div className="ql-formats" role="group" aria-label="Text formatting">
        <label htmlFor="text-heading" className="sr-only">Text Style</label>
        <select 
          id="text-heading" 
          className="ql-header" 
          defaultValue=""
          aria-label="Text style"
        >
          <option value="1">Heading</option>
          <option value="2">Subheading</option>
          <option value="">Normal</option>
        </select>
        
        <button 
          className="ql-bold" 
          aria-label="Bold" 
          type="button"
          onKeyDown={(e) => handleKeyDown(e, () => document.execCommand('bold', false))}
        />
        <button 
          className="ql-italic" 
          aria-label="Italic" 
          type="button"
          onKeyDown={(e) => handleKeyDown(e, () => document.execCommand('italic', false))}
        />
        <button 
          className="ql-underline" 
          aria-label="Underline" 
          type="button"
          onKeyDown={(e) => handleKeyDown(e, () => document.execCommand('underline', false))}
        />
        <button 
          className="ql-strike" 
          aria-label="Strikethrough" 
          type="button"
          onKeyDown={(e) => handleKeyDown(e, () => document.execCommand('strikeThrough', false))}
        />
      </div>
      
      <div className="ql-formats" role="group" aria-label="Lists and blocks">
        <button 
          className="ql-list" 
          value="ordered" 
          aria-label="Numbered list" 
          type="button"
        />
        <button 
          className="ql-list" 
          value="bullet" 
          aria-label="Bulleted list" 
          type="button"
        />
        <button 
          className="ql-blockquote" 
          aria-label="Blockquote" 
          type="button"
        />
        <button 
          className="ql-code-block" 
          aria-label="Code block" 
          type="button"
        />
      </div>
      
      <div className="ql-formats" role="group" aria-label="Insert">
        <button 
          className="ql-link" 
          aria-label="Insert link" 
          type="button"
        />
        <button 
          className="ql-image" 
          aria-label="Insert image" 
          type="button"
        />
        <button 
          className="ql-drawing" 
          onClick={onDrawingClick}
          onKeyDown={(e) => handleKeyDown(e, onDrawingClick)}
          aria-label="Insert drawing"
          title="Insert drawing (Ctrl+Alt+D)"
          type="button"
        >
          <PictureOutlined aria-hidden="true" />
          <span className="sr-only">Insert drawing</span>
        </button>
      </div>
    </div>
  );
};

interface NoteEditorWithDrawingProps {
  initialNote?: Note | null;
  onSave: (note: { title: string; content: string; tags?: string[] }) => Promise<Note | void>;
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
  const [newTag, setNewTag] = useState('');
  const [isTagInputVisible, setIsTagInputVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const quillRef = useRef<ReactQuill & { editor: QuillType }>(null);

  // Filter available tags to exclude already added ones
  const filteredAvailableTags = useMemo(() => {
    return availableTags.filter(tag => !tags.includes(tag));
  }, [availableTags, tags]);

  // Insert drawing into editor
  const insertDrawing = useCallback((imageData: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      
      // Insert the drawing at the current cursor position
      quill.insertEmbed(range.index, 'drawing', { url: imageData }, 'user');
      
      // Move cursor after the inserted drawing
      quill.setSelection(range.index + 1, 0, 'api');
      
      // Update content state
      setContent(quill.root.innerHTML);
      
      // Close the drawing panel
      setIsDrawingOpen(false);
    }
  }, []);

  // Handle save
  const handleSave = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    if (!title.trim()) {
      message.warning('Please enter a title');
      return;
    }

    try {
      setIsSaving(true);
      
      // Get the latest content from the editor
      const currentContent = quillRef.current?.getEditor().root.innerHTML || '';
      
      await onSave({ 
        title: title.trim(), 
        content: currentContent, 
        tags 
      });
      
      message.success('Note saved successfully');
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err as Error);
      message.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [title, tags, onSave]);

  // Handle tag operations
  const handleAddTag = useCallback((value: string) => {
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
      setNewTag('');
      setIsTagInputVisible(false);
    }
  }, [tags]);
  
  const handleTagChange = useCallback((value: string) => {
    setNewTag(value);
  }, []);
  
  const handleTagBlur = useCallback(() => {
    if (newTag) {
      handleAddTag(newTag);
    } else {
      setIsTagInputVisible(false);
    }
  }, [newTag, handleAddTag]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

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
    setNewTag('');
    setIsTagInputVisible(false);
    setError(null);
  return (
    <ErrorBoundary componentName="NoteEditorWithDrawing">
      <div className="error-container">
        <Result
          status="error"
          title="Error"
          subTitle={error.message || 'An error occurred while loading the note editor'}
          extra={[
            // ...
          ]}
        />
      </div>
    </ErrorBoundary>
  );
}

return (
  <ErrorBoundary componentName="NoteEditorWithDrawing">
    <div className="note-editor-with-drawing">
      <div className="editor-header">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onCancel}
            disabled={isSaving}
            className="back-button"
          >
            Back
          </Button>
          <Tooltip title={isPinned ? 'Unpin note' : 'Pin note'}>
            <Button
              type={isPinned ? 'primary' : 'default'}
              icon={isPinned ? <StarFilled /> : <StarOutlined />}
              onClick={onPinToggle}
              disabled={!onPinToggle || isSaving}
              className="pin-button"
            />
          </Tooltip>
        </Space>
        <Space>
          {onDelete && (
            <Popconfirm
              key="delete-confirm"
              title="Are you sure you want to delete this note?"
              onConfirm={onDelete}
              okText="Yes"
              cancelText="No"
              disabled={isSaving}
            >
              <Button 
                danger
                icon={<DeleteOutlined />}
                disabled={isSaving}
                className="delete-button"
                aria-label="Delete note"
              >
                Delete
              </Button>
            </Popconfirm>
          )}
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={isSaving}
            disabled={!title.trim()}
            className="save-button"
            aria-label="Save note"
          >
            Save
          </Button>
        </Space>
      </div>

      <div className="editor-content">
        <Input
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="note-title"
          aria-label="Note title"
        />
        
        <div className="tag-section">
          {tags.map(tag => (
            <Tag 
              key={tag} 
              closable 
              onClose={() => handleRemoveTag(tag)}
              className="note-tag"
            >
              {tag}
            </Tag>
          ))}
          
          {isTagInputVisible ? (
            <Select
              autoFocus
              size="small"
              className="tag-input"
              placeholder="Select or create tag"
              showSearch
              defaultOpen
              onSearch={handleTagChange}
              onSelect={handleAddTag}
              onBlur={handleTagBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTag) {
                  handleAddTag(newTag);
                } else if (e.key === 'Escape') {
                  setIsTagInputVisible(false);
                }
              }}
              notFoundContent={null}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: '200px' }}
              filterOption={(input, option) =>
                (option?.children as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {filteredAvailableTags.map(tag => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          ) : (
            <Tag 
              onClick={() => setIsTagInputVisible(true)}
              className="add-tag-button"
            >
              <TagOutlined /> Add Tag
            </Tag>
          )}
                  if (source === 'user' || source === 'api') {
                    setContent(editor.getHTML());
                  }
                }}
                placeholder="Start writing your note here..."
                modules={{
                  ...modules,
                  toolbar: {
                    ...modules.toolbar,
                    handlers: {
                      ...modules.toolbar.handlers,
                      // Add any custom handlers here
                    }
                  },
                }}
                style={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: 'none',
                  borderRadius: '0 0 4px 4px'
                }}
                readOnly={isSaving}
                formats={[
                  'header', 'font', 'size',
                  'bold', 'italic', 'underline', 'strike', 'blockquote',
                  'list', 'bullet', 'indent',
                  'link', 'image', 'video', 'drawing'
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Create Drawing"
        open={isDrawingOpen}
        onCancel={() => setIsDrawingOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDrawingOpen(false)}>
            Cancel
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
        destroyOnClose
      >
        <div style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          <DrawingPanel 
            onSave={(data) => {
              insertDrawing(data);
              setIsDrawingOpen(false);
            }}
            onCancel={() => setIsDrawingOpen(false)}
            buttonText="Insert Drawing"
            showCancelButton={false}
          />
        </div>
      </Modal>
    </ErrorBoundary>
  );
};

export default NoteEditorWithDrawing;
