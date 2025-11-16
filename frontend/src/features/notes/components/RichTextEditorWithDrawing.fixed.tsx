import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Simple drawing icon component
const DrawingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="3" x2="16" y2="21"></line>
  </svg>
);

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  className?: string;
  'aria-label'?: string;
}

const RichTextEditorWithDrawing: React.FC<RichTextEditorProps> = ({
  initialContent = '',
  onChange,
  readOnly = false,
  className = '',
  'aria-label': ariaLabel = 'Rich text editor'
}) => {
  const [content, setContent] = useState(initialContent);
  const [isDrawingOpen] = useState(false);
  const quillRef = useRef(null);

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Handle content change
  const handleContentChange = (
    content: string,
    _delta: any,
    _source: string,
    editor: any
  ) => {
    setContent(content);
    if (onChange) {
      onChange(editor.getHTML());
    }
  };

  // Handle insert drawing
  const handleInsertDrawing = (dataUrl: string) => {
    if (quillInstance.current) {
      const range = quillInstance.current.getSelection();
      if (range) {
        quillInstance.current.insertEmbed(range.index, 'image', dataUrl, 'user');
        // Move cursor after the inserted image
        quillInstance.current.setSelection(range.index + 1, 0, 'api');
      }
      setIsDrawingOpen(false);
    }
  };

  // Custom toolbar component
  const CustomToolbar: React.FC<{ onDrawingClick: () => void }> = React.memo(({ onDrawingClick }) => (
    <div id="toolbar" className="ql-toolbar ql-snow">
      <span className="ql-formats">
        <select className="ql-header" defaultValue="" aria-label="Text formatting">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="">Normal</option>
        </select>
      </span>
      <span className="ql-formats">
        <button className="ql-bold" aria-label="Bold"></button>
        <button className="ql-italic" aria-label="Italic"></button>
        <button className="ql-underline" aria-label="Underline"></button>
        <button className="ql-strike" aria-label="Strikethrough"></button>
      </span>
      <span className="ql-formats">
        <button className="ql-list" value="ordered" aria-label="Numbered list"></button>
        <button className="ql-list" value="bullet" aria-label="Bullet list"></button>
      </span>
      <span className="ql-formats">
        <button className="ql-link" aria-label="Insert link"></button>
        <button className="ql-image" aria-label="Insert image"></button>
        <button 
          className="ql-drawing" 
          onClick={onDrawingClick}
          aria-label="Insert drawing"
        >
          <DrawingIcon />
        </button>
      </span>
    </div>
  ));

  // Quill modules
  const quillModules = useMemo(() => ({
    toolbar: {
      container: '#toolbar',
    },
  }), []);

  // Quill formats
  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image', 'drawing'
  ];


  return (
    <div className={`rich-text-editor-container ${className}`}>
      <div className="editor-container">
        <CustomToolbar onDrawingClick={() => setIsDrawingOpen(true)} />
        <div className="quill-wrapper">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleContentChange}
            readOnly={readOnly}
            placeholder="Type your note here..."
            modules={quillModules}
            formats={quillFormats}
            className="rich-text-editor"
            ref={quillRef}
            aria-label={ariaLabel}
          />
        </div>
      </div>

      {/* Drawing modal would go here */}
      
      <style>{`
        .rich-text-editor-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .editor-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 300px;
        }
        
        .quill-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .rich-text-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .rich-text-editor :global(.ql-container) {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .rich-text-editor :global(.ql-editor) {
          flex: 1;
          overflow-y: auto;
        }
        
        .rich-text-editor :global(.ql-snow) {
          border: none;
        }
        
        .rich-text-editor :global(.ql-toolbar) {
          border: none;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .rich-text-editor :global(.ql-editor) {
          min-height: 200px;
          padding: 16px;
        }
        
        :global(.ql-drawing) img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditorWithDrawing;
