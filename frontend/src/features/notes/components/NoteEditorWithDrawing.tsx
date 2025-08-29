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
import { 
  StarOutlined, 
  StarFilled, 
  ArrowLeftOutlined, 
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined
} from '@ant-design/icons';
import SummaryButton from '../../ai/components/SummaryButton';
import ReactQuill from 'react-quill';
import Quill from 'quill';
import ErrorBoundary from '../../../components/ErrorBoundary';
import styles from './NoteEditorWithDrawing.module.css';

// Type for the editor instance from Quill
type QuillEditor = {
  getSelection: (focus?: boolean) => { index: number; length: number } | null;
  insertEmbed: (index: number, type: string, value: any) => void;
  setSelection: (index: number, length: number, source?: string) => void;
  getLength: () => number;
  getText: (index?: number, length?: number) => string;
};

// Type for the ReactQuill component ref
type ReactQuillRef = {
  getEditor: () => QuillEditor;
  editingArea: HTMLElement;
  focus: () => void;
  blur: () => void;
};

// Define and register the drawing blot
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
    img.className = styles['drawingImage'] || '';
    node.appendChild(img);
    return node;
  }

  static value(domNode: HTMLElement) {
    const img = domNode.querySelector('img');
    return { url: img?.getAttribute('src') || '' };
  }
}

Quill.register(DrawingBlot);

// Define Note interface
export interface Note {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}


// Drawing Panel Component
interface DrawingPanelProps {
  onSave: (data: string) => void;
  onCancel: () => void;
}

const DrawingPanel: React.FC<DrawingPanelProps> = ({ onSave, onCancel }) => {
  const [drawingData, setDrawingData] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  
  const handleSave = useCallback(() => {
    if (drawingData) {
      onSave(drawingData);
    }
  }, [drawingData, onSave]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setLastX(x);
    setLastY(y);
    setIsDrawing(true);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    setLastX(x);
    setLastY(y);
    
    // Update the drawing data
    setDrawingData(canvas.toDataURL('image/png'));
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  return (
    <div className={styles['drawingPanel']}>
      <div className={styles['drawingArea']}>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className={styles['drawingCanvas']}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
        <p className={styles['drawingText']}>Click and drag to draw</p>
      </div>
      <div className={styles['drawingActions']}>
        <Button onClick={onCancel} className={styles['cancelButton']}>
          Cancel
        </Button>
        <Button 
          type="primary" 
          onClick={handleSave}
          disabled={!drawingData}
          className={styles['saveButton']}
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
  // Toggle pin status for the current note
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
  // availableTags is intentionally unused for now
  // It's kept for future tag suggestions functionality
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
  const quillRef = useRef<ReactQuillRef & { divRef: React.RefObject<HTMLDivElement> }>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

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
      const noteData = {
        title,
        content,
        tags: tags || [],
        ...(initialNote?.id && { id: initialNote.id }) // Only include id if it exists
      };
      await onSave(noteData);
      message.success('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note');
    }
  }, [title, content, tags, initialNote?.id, onSave]);

  // Handle drawing save
  const handleAddDrawing = useCallback((dataUrl: string) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      const position = range ? range.index : 0;
      
      try {
        editor.insertEmbed(position, 'drawing', { url: dataUrl });
        // Move cursor after the inserted drawing
        editor.setSelection(position + 1, 0, 'api');
      } catch (error) {
        console.error('Error inserting drawing:', error);
        message.error('Failed to insert drawing');
      }
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
      <div className={`${styles['editorContainer']} ${className}`} style={style}>
        <div className={styles['editorHeader']}>
          <Input
            className={styles['noteTitleInput']}
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <Space className={styles['editorActions']}>
            {onPinToggle && (
              <Tooltip title={isPinned ? 'Unpin note' : 'Pin note'}>
                <Button
                  type="text"
                  icon={isPinned ? <StarFilled /> : <StarOutlined />}
                  onClick={onPinToggle}
                  disabled={loading}
                  className={styles['pinButton']}
                />
              </Tooltip>
            )}
            {onCancel && (
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={onCancel}
                disabled={loading}
                className={styles['backButton']}
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
                  className={styles['deleteButton']}
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
              className={styles['saveButton']}
            >
              Save
            </Button>
            <SummaryButton 
              content={content}
              onSummaryGenerated={(summary) => {
                // Add the summary to the beginning of the note content
                const newContent = `<h3>Summary:</h3><p>${summary}</p>\n\n${content}`;
                setContent(newContent);
              }}
              buttonType="text"
              buttonText="Generate Summary"
            />
          </Space>
        </div>

        <div className={styles['tagsSection']}>
          {tags.map(tag => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(tag)}
              className={styles['tag']}
            >
              {tag}
            </Tag>
          ))}
          {tagInputVisible ? (
            <Input
              type="text"
              size="small"
              className={`${styles['tagInput']} ${styles['tagInputField']}`}
              value={tagInputValue}
              onChange={handleTagInputChange}
              onBlur={handleAddTag}
              onPressEnter={handleAddTag}
              autoFocus
            />
          ) : (
            <Tag
              className={styles['addTagButton']}
              onClick={() => setTagInputVisible(true)}
            >
              <PlusOutlined /> New Tag
            </Tag>
          )}
        </div>

        <div ref={editorContainerRef} className={styles['quillEditorContainer']}>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            placeholder="Write your note here..."
            modules={modules}
            formats={formats}
            readOnly={loading}
          />
        </div>

        <Modal
          title="Add Drawing"
          open={isDrawingOpen}
          onCancel={() => setIsDrawingOpen(false)}
          width={800}
          className={styles['drawingModal']}
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
