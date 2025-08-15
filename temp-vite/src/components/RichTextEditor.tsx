import React, { useRef, useEffect, useCallback } from 'react';
import { 
  Editor, 
  EditorState, 
  RichUtils, 
  convertToRaw, 
  convertFromRaw, 
  ContentState,
  DraftHandleValue,
  DraftStyleMap,
  DraftEditorCommand
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaListUl, 
  FaListOl, 
  FaLink,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify
} from 'react-icons/fa';

interface RichTextEditorProps {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing your notes here...',
  readOnly = false,
}) => {
  const [editorState, setEditorState] = React.useState(() => {
    if (content) {
      try {
        const contentState = convertFromRaw(JSON.parse(content));
        return EditorState.createWithContent(contentState);
      } catch (e) {
        console.error('Error parsing content:', e);
      }
    }
    return EditorState.createEmpty();
  });

  const editorRef = useRef<Editor>(null);

  // Handle editor content changes
  const handleChange = useCallback((newEditorState: EditorState) => {
    setEditorState(newEditorState);
    const content = JSON.stringify(convertToRaw(newEditorState.getCurrentContent()));
    onChange(content);
  }, [onChange]);

  // Toggle block type (e.g., header, blockquote, list)
  const toggleBlockType = useCallback((blockType: string) => {
    const newState = RichUtils.toggleBlockType(editorState, blockType);
    handleChange(newState);
  }, [editorState, handleChange]);

  // Toggle inline style (e.g., bold, italic, underline)
  const toggleInlineStyle = useCallback((inlineStyle: string) => {
    const newState = RichUtils.toggleInlineStyle(editorState, inlineStyle);
    handleChange(newState);
  }, [editorState, handleChange]);

  // Update editor content when content prop changes
  useEffect(() => {
    if (content) {
      try {
        const contentState = convertFromRaw(JSON.parse(content));
        // Only update if the content is different from current state
        const currentContent = editorState.getCurrentContent();
        if (JSON.stringify(convertToRaw(currentContent)) !== content) {
          const newEditorState = EditorState.push(
            EditorState.createEmpty(),
            contentState,
            'change-block-data'
          );
          setEditorState(newEditorState);
        }
      } catch (e) {
        console.error('Error updating editor content:', e);
      }
    }
  }, [content, editorState]);

  // Handle keyboard commands (e.g., Ctrl+B for bold)
  const handleKeyCommand = useCallback((command: string, editorState: EditorState): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }, [handleChange]);

  // Focus the editor when it's mounted or when readOnly changes
  useEffect(() => {
    if (!readOnly && editorRef.current) {
      editorRef.current.focus();
    }
  }, [readOnly]);

  // Custom style map for inline styles
  const styleMap: DraftStyleMap = {
    'HIGHLIGHT': {
      backgroundColor: '#F7B500',
      padding: '0 2px',
      borderRadius: '2px'
    }
  };

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Get current block type
  const getBlockType = useCallback((): string => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(selection.getStartKey());
    return block.getType();
  }, [editorState]);

  // Check if current block has a specific style
  const hasInlineStyle = useCallback((style: string): boolean => {
    return editorState.getCurrentInlineStyle().has(style);
  }, [editorState]);

  // Handle adding a link
  const promptForLink = useCallback(() => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const startKey = selection.getStartKey();
      const startOffset = selection.getStartOffset();
      const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
      const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);

      let url = '';
      if (linkKey) {
        const linkInstance = contentState.getEntity(linkKey);
        url = linkInstance.getData().url || '';
      }

      const href = window.prompt('Enter URL:', url);
      if (href !== null) {
        // Create new content state with entity
        const contentStateWithEntity = contentState.createEntity(
          'LINK',
          'MUTABLE',
          { url: href.startsWith('http') ? href : `https://${href}` }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        
        // Get the current selection
        const selection = editorState.getSelection();
        
        // Create a new editor state with the entity
        let newEditorState = EditorState.push(
          editorState,
          contentStateWithEntity,
          'apply-entity'
        );
        
        // Apply the entity to the current selection
        newEditorState = RichUtils.toggleLink(
          newEditorState,
          selection,
          href ? entityKey : null
        );
        
        // Update the editor state
        handleChange(newEditorState);
      }
    }
  }, [editorState, handleChange]);

  // Handle keyboard shortcuts
  const handleReturn = useCallback((e: React.KeyboardEvent): DraftHandleValue => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock = contentState.getBlockForKey(selection.getStartKey());
    const blockType = currentBlock.getType();

    // Handle list items
    if (blockType === 'unordered-list-item' || blockType === 'ordered-list-item') {
      if (currentBlock.getLength() === 0) {
        // If list item is empty, remove the list style
        handleChange(RichUtils.toggleBlockType(editorState, 'unstyled'));
        return 'handled';
      }
    }
    return 'not-handled';
  }, [editorState, handleChange]);

  // Custom block renderer
  const blockStyleFn = (contentBlock: any) => {
    const type = contentBlock.getType();
    switch (type) {
      case 'blockquote':
        return 'border-l-4 border-gray-300 pl-4 my-2 text-gray-600';
      case 'code-block':
        return 'bg-gray-100 p-4 rounded font-mono text-sm my-2';
      default:
        return '';
    }
  };

  return (
    <div className="border rounded-md bg-white">
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-2 border-b">
          {/* Inline Styles */}
          <div className="flex border-r pr-2 mr-2">
            <button
              onClick={() => toggleInlineStyle('BOLD')}
              className={`p-2 rounded hover:bg-gray-100 ${hasInlineStyle('BOLD') ? 'bg-gray-200' : ''}`}
              title="Bold (Ctrl+B)"
            >
              <FaBold />
            </button>
            <button
              onClick={() => toggleInlineStyle('ITALIC')}
              className={`p-2 rounded hover:bg-gray-100 ${hasInlineStyle('ITALIC') ? 'bg-gray-200' : ''}`}
              title="Italic (Ctrl+I)"
            >
              <FaItalic />
            </button>
            <button
              onClick={() => toggleInlineStyle('UNDERLINE')}
              className={`p-2 rounded hover:bg-gray-100 ${hasInlineStyle('UNDERLINE') ? 'bg-gray-200' : ''}`}
              title="Underline (Ctrl+U)"
            >
              <FaUnderline />
            </button>
            <button
              onClick={() => toggleInlineStyle('HIGHLIGHT')}
              className={`p-2 rounded hover:bg-gray-100 ${hasInlineStyle('HIGHLIGHT') ? 'bg-gray-200' : ''}`}
              title="Highlight"
            >
              <span className="text-yellow-600">H</span>
            </button>
          </div>

          {/* Block Types */}
          <div className="flex border-r pr-2 mr-2">
            <select
              value={getBlockType()}
              onChange={(e) => toggleBlockType(e.target.value)}
              className="p-1 text-sm border rounded bg-white"
            >
              <option value="unstyled">Normal</option>
              <option value="header-one">Heading 1</option>
              <option value="header-two">Heading 2</option>
              <option value="header-three">Heading 3</option>
              <option value="blockquote">Quote</option>
              <option value="code-block">Code Block</option>
            </select>
          </div>

          {/* Lists */}
          <div className="flex border-r pr-2 mr-2">
            <button
              onClick={() => toggleBlockType('unordered-list-item')}
              className={`p-2 rounded hover:bg-gray-100 ${getBlockType() === 'unordered-list-item' ? 'bg-gray-200' : ''}`}
              title="Bullet List"
            >
              <FaListUl />
            </button>
            <button
              onClick={() => toggleBlockType('ordered-list-item')}
              className={`p-2 rounded hover:bg-gray-100 ${getBlockType() === 'ordered-list-item' ? 'bg-gray-200' : ''}`}
              title="Numbered List"
            >
              <FaListOl />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex border-r pr-2 mr-2">
            <button
              onClick={() => toggleBlockType('left')}
              className={`p-2 rounded hover:bg-gray-100 ${getBlockType() === 'left' ? 'bg-gray-200' : ''}`}
              title="Align Left"
            >
              <FaAlignLeft />
            </button>
            <button
              onClick={() => toggleBlockType('center')}
              className={`p-2 rounded hover:bg-gray-100 ${getBlockType() === 'center' ? 'bg-gray-200' : ''}`}
              title="Center"
            >
              <FaAlignCenter />
            </button>
            <button
              onClick={() => toggleBlockType('right')}
              className={`p-2 rounded hover:bg-gray-100 ${getBlockType() === 'right' ? 'bg-gray-200' : ''}`}
              title="Align Right"
            >
              <FaAlignRight />
            </button>
            <button
              onClick={() => toggleBlockType('justify')}
              className={`p-2 rounded hover:bg-gray-100 ${getBlockType() === 'justify' ? 'bg-gray-200' : ''}`}
              title="Justify"
            >
              <FaAlignJustify />
            </button>
          </div>

          {/* Links */}
          <div className="flex">
            <button
              onClick={promptForLink}
              className="p-2 rounded hover:bg-gray-100"
              title="Add/Edit Link"
            >
              <FaLink />
            </button>
          </div>
        </div>
      )}
      <div 
        className={`p-4 ${readOnly ? 'min-h-[100px]' : 'min-h-[300px]'}`}
        onClick={() => editorRef.current?.focus()}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleChange}
          handleKeyCommand={handleKeyCommand}
          handleReturn={handleReturn}
          placeholder={placeholder}
          readOnly={readOnly}
          customStyleMap={styleMap}
          blockStyleFn={blockStyleFn}
          spellCheck={true}
        />
      </div>
    </div>
  );
};
