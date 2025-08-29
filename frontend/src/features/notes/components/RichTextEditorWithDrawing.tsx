import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Define the component props
interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  className?: string;
  'aria-label'?: string;
}

// Create a wrapper component that handles the ref properly
const RichTextEditorWithDrawing = forwardRef<HTMLDivElement, RichTextEditorProps>(({
  initialContent = '',
  onChange,
  readOnly = false,
  className = '',
  'aria-label': ariaLabel = 'Rich text editor'
}, ref) => {
  const [content, setContent] = useState<string>(initialContent || '');

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent || '');
  }, [initialContent]);

  // Handle content change
  const handleContentChange = (
    value: string,
    delta: any,
    source: string,
    editor: any
  ) => {
    setContent(value);
    if (onChange) {
      onChange(value);
    }
  };

  // Configure Quill modules
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  // Configure Quill formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  // Create a wrapper div to handle the ref properly
  return (
    <div ref={ref} className={`rich-text-editor-container ${className}`}>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleContentChange}
        readOnly={readOnly}
        placeholder="Type your note here..."
        modules={modules}
        formats={formats}
        aria-label={ariaLabel}
      />
    </div>
  );
});

// Add display name for better debugging
RichTextEditorWithDrawing.displayName = 'RichTextEditorWithDrawing';

// Export the component
export { RichTextEditorWithDrawing };
export default RichTextEditorWithDrawing;
