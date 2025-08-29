import React, { useState, useEffect, forwardRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import type { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Define the Quill instance type
type QuillInstance = InstanceType<typeof ReactQuill>;

// Extend ReactQuillProps to include the ref
interface RichTextEditorWithDrawingProps extends Omit<ReactQuillProps, 'onChange' | 'value'> {
  initialContent?: string;
  'aria-label'?: string;
  className?: string;
  onChange?: (content: string) => void;
}

const RichTextEditorWithDrawing = forwardRef<QuillInstance, RichTextEditorWithDrawingProps>(({
  initialContent = '',
  onChange,
  readOnly = false,
  className = '',
  'aria-label': ariaLabel = 'Rich text editor',
  ...rest
}, ref) => {
  const [content, setContent] = useState(initialContent);

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Handle content change
  const handleContentChange = (
    content: string,
    delta: any,
    source: string,
    editor: any
  ) => {
    setContent(content);
    if (onChange) {
      onChange(content);
    }
  };

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  // Quill formats
  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <div className={`rich-text-editor-container ${className}`}>
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
          ref={ref}
          aria-label={ariaLabel}
          {...rest}
        />
      </div>
    </div>
  );
});

RichTextEditorWithDrawing.displayName = 'RichTextEditorWithDrawing';

export default RichTextEditorWithDrawing;
