import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Editor, 
  EditorState, 
  RichUtils, 
  convertToRaw, 
  convertFromRaw, 
  ContentState, 
  DraftStyleMap, 
  CompositeDecorator, 
  ContentBlock, 
  DraftHandleValue, 
  DraftInlineStyleType,
  CharacterMetadata,
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
import { message } from 'antd';

// Define the style map for custom styles
const styleMap: DraftStyleMap = {
  'HIGHLIGHT': {
    backgroundColor: '#faed27',
    padding: '0 2px',
    borderRadius: '2px',
  },
  'CODE': {
    fontFamily: 'monospace',
    fontSize: '0.9em',
    backgroundColor: '#f5f5f5',
    padding: '2px 4px',
    borderRadius: '3px',
  },
};

// Define props for the RichTextEditor component
interface RichTextEditorProps {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// Define props for the Link component
interface LinkProps {
  contentState: ContentState;
  entityKey: string;
  children: React.ReactNode;
}

// Custom Link component for links in the editor
const Link: React.FC<LinkProps> = ({ contentState, entityKey, children }) => {
  const { url } = contentState.getEntity(entityKey).getData();
  return (
    <a
      href={url}
      style={{ color: '#3b5998', textDecoration: 'underline' }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

// Find link entities in the content
const findLinkEntities = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) => {
  contentBlock.findEntityRanges(
    (character: CharacterMetadata) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
};

// Create decorator for links
const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link as any,
  },
]);

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing your notes here...',
  readOnly = false,
  style,
  className,
}) => {
  const editorRef = useRef<Editor>(null);
  const [editorState, setEditorState] = useState(() => {
    if (content) {
      try {
        const parsedContent = JSON.parse(content);
        return EditorState.createWithContent(convertFromRaw(parsedContent), decorator);
      } catch (e) {
        console.error('Error parsing content:', e);
      }
    }
    return EditorState.createEmpty(decorator);
  });

  const handleChange = useCallback((newEditorState: EditorState) => {
    setEditorState(newEditorState);
    if (onChange) {
      const contentState = newEditorState.getCurrentContent();
      onChange(JSON.stringify(convertToRaw(contentState)));
    }
  }, [onChange]);

  const handleKeyCommand = useCallback((command: DraftEditorCommand | string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }, [handleChange]);

  const toggleInlineStyle = useCallback((style: string) => {
    handleChange(RichUtils.toggleInlineStyle(editorState, style));
  }, [editorState, handleChange]);

  const toggleBlockType = useCallback((blockType: string) => {
    handleChange(RichUtils.toggleBlockType(editorState, blockType));
  }, [editorState, handleChange]);

  // Update editor state when content prop changes
  useEffect(() => {
    if (content) {
      try {
        const parsedContent = JSON.parse(content);
        const contentState = convertFromRaw(parsedContent);
        if (contentState.getPlainText() !== editorState.getCurrentContent().getPlainText()) {
          setEditorState(EditorState.push(editorState, contentState, 'change-block-data'));
        }
      } catch (e) {
        // Silent error for malformed JSON or empty string
      }
    }
  }, [content]);

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
        const contentStateWithEntity = contentState.createEntity(
          'LINK',
          'MUTABLE',
          { url: href.startsWith('http') ? href : `https://${href}` }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        let newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        newEditorState = RichUtils.toggleLink(
          newEditorState,
          newEditorState.getSelection(),
          href ? entityKey : null
        );
        handleChange(newEditorState);
      }
    } else {
      message.info('Please select text to link');
    }
  }, [editorState, handleChange]);

  // Handle keyboard shortcuts for return
  const handleReturn = useCallback((e: React.KeyboardEvent): DraftHandleValue => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock = contentState.getBlockForKey(selection.getStartKey());
    const blockType = currentBlock.getType();

    if (blockType === 'unordered-list-item' || blockType === 'ordered-list-item') {
      if (currentBlock.getLength() === 0) {
        handleChange(RichUtils.toggleBlockType(editorState, 'unstyled'));
        return 'handled';
      }
    }
    return 'not-handled';
  }, [editorState, handleChange]);

  const blockStyleFn = (contentBlock: ContentBlock) => {
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
    <div className={`border rounded-md bg-white ${className || ''}`} style={style}>
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-2 border-b">
          <div className="flex border-r pr-2 mr-2">
            <button
              onClick={() => toggleInlineStyle('BOLD')}
              className={`p-2 rounded hover:bg-gray-100 ${hasInlineStyle('BOLD') ? 'bg-gray-200' : ''}`}
              title="Bold"
            >
              <FaBold />
            </button>
            <button
              onClick={() => toggleInlineStyle('ITALIC')}
              className={`p-2 rounded hover:bg-gray-100 ${hasInlineStyle('ITALIC') ? 'bg-gray-200' : ''}`}
              title="Italic"
            >
              <FaItalic />
            </button>
            <button
              onClick={() => toggleInlineStyle('UNDERLINE')}
              className={`p-2 rounded hover:bg-gray-100 ${hasInlineStyle('UNDERLINE') ? 'bg-gray-200' : ''}`}
              title="Underline"
            >
              <FaUnderline />
            </button>
            <button
              onClick={() => toggleInlineStyle('HIGHLIGHT')}
              className={`p-2 rounded hover:bg-gray-100 ${hasInlineStyle('HIGHLIGHT') ? 'bg-gray-200' : ''}`}
              title="Highlight"
            >
              <span className="text-yellow-600 font-bold">H</span>
            </button>
          </div>

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

          <div className="flex">
            <button
              onClick={promptForLink}
              className="p-2 rounded hover:bg-gray-100"
              title="Add Link"
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

export default RichTextEditor;
