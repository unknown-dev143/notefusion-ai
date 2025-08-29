import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Editor, 
  EditorState, 
  RichUtils, 
  getDefaultKeyBinding, 
  convertToRaw, 
  convertFromRaw, 
  ContentState, 
  DraftStyleMap, 
  CompositeDecorator, 
  ContentBlock, 
  DraftHandleValue, 
  RawDraftContentState,
  DraftEditorCommand,
  DraftBlockType,
  DraftInlineStyleType,
  CharacterMetadata,
  DraftDecorator,
  CompositeDecoratorProps
} from 'draft-js';

type DraftDecoratorType = DraftDecorator;

type BlockStyleFn = (block: ContentBlock) => string;
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

// Define interfaces for better type safety
interface RichTextEditorProps {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

interface LinkProps {
  contentState: ContentState;
  entityKey: string;
  children: React.ReactNode;
  decoratedText?: string;
  offsetKey: string;
  blockKey: string;
  dir?: string;
  end: number;
  start: number;
}

// Define the style map for custom styles
const editorStyleMap: DraftStyleMap = {
  'HIGHLIGHT': {
    backgroundColor: '#F7A5A5',
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

// Custom styles for the editor
const styles = {
  editor: {
    border: '1px solid #ddd',
    minHeight: '200px',
    padding: '10px',
    borderRadius: '4px',
  },
  toolbar: {
    border: '1px solid #ddd',
    padding: '8px',
    borderRadius: '4px 4px 0 0',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  button: {
    padding: '4px 8px',
    margin: '0 2px',
    cursor: 'pointer',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    borderRadius: '3px',
  },
  activeButton: {
    backgroundColor: '#e0e0e0',
  },
  link: {
    color: '#3b5998',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
} as const;

// Custom component for links
const Link: React.FC<LinkProps> = ({ contentState, entityKey, children }) => {
  const entity = contentState.getEntity(entityKey);
  const { url } = entity.getData();
  
  return React.createElement(
    'a',
    {
      href: url,
      style: styles.link,
      target: '_blank',
      rel: 'noopener noreferrer',
    } as React.AnchorHTMLAttributes<HTMLAnchorElement>,
    children
  ) as unknown as React.ReactElement;
};

// Helper function to find link entities
function findLinkEntities(
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) {
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
}

// Create decorator for links
const createDecorator = () => {
  return new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: Link as React.ComponentType<LinkProps>,
    },
  ]);
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing your notes here...',
  readOnly = false,
  style,
  className,
}) => {
  const editorRef = React.useRef<Editor>(null);
  const [editorState, setEditorState] = React.useState(() => {
    if (content) {
      try {
        const parsedContent = JSON.parse(content);
        return EditorState.createWithContent(convertFromRaw(parsedContent));
      } catch (e) {
        console.error('Error parsing content:', e);
      }
    }
    return EditorState.createEmpty();
  });

  const handleChange = React.useCallback((newEditorState: EditorState) => {
    setEditorState(newEditorState);
    if (onChange) {
      const contentState = newEditorState.getCurrentContent();
      onChange(JSON.stringify(convertToRaw(contentState)));
    }
  }, [onChange]);

  const handleKeyCommand = (command: DraftEditorCommand | string, editorState: EditorState): DraftHandleValue => {
    if (typeof command === 'string') {
      command = command as DraftEditorCommandType;
    }
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Add other handlers as needed
  const toggleInlineStyle = (inlineStyle: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle as DraftInlineStyleType));
  };

  const toggleBlockType = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType as DraftBlockType));
  };

  // Focus the editor when mounted
  React.useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Update editor state when content prop changes
  React.useEffect(() => {
    if (content) {
      try {
        const parsedContent = JSON.parse(content);
        const contentState = convertFromRaw(parsedContent);
        if (contentState !== editorState.getCurrentContent()) {
          setEditorState(EditorState.push(editorState, contentState, 'change-block-data'));
        }
      } catch (e) {
        console.error('Error updating editor content:', e);
      }
    }
  }, [content, editorState]);

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
  const hasInlineStyle = useCallback((style: DraftInlineStyleType): boolean => {
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
  const blockStyleFn: BlockStyleFn = (contentBlock: ContentBlock): string => {
    const type = contentBlock.getType();
    if (type === 'blockquote') {
      return 'RichEditor-blockquote';
    }
    return '';
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
              className={`p-2 rounded hover:bg-gray-100 ${editorState.getCurrentInlineStyle().has('HIGHLIGHT' as any) ? 'bg-gray-200' : ''}`}
              title="Highlight"
              onClick={() => toggleInlineStyle('HIGHLIGHT')}
            >
              <span className="text-yellow-600">H</span>
            </button>
          </div>

          {/* Block Types */}
          <div className="flex border-r pr-2 mr-2">
            {React.createElement('select', {
              value: getBlockType(),
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => toggleBlockType(e.target.value),
              className: 'p-1 text-sm border rounded bg-white',
              children: [
                React.createElement('option', { key: 'unstyled', value: 'unstyled' }, 'Normal'),
                React.createElement('option', { key: 'header-one', value: 'header-one' }, 'Heading 1'),
                React.createElement('option', { key: 'header-two', value: 'header-two' }, 'Heading 2'),
                React.createElement('option', { key: 'header-three', value: 'header-three' }, 'Heading 3'),
                React.createElement('option', { key: 'blockquote', value: 'blockquote' }, 'Quote'),
                React.createElement('option', { key: 'code-block', value: 'code-block' }, 'Code Block'),
              ]
            })}
          </div>

          {/* Lists */}
          {React.createElement('div', { className: 'flex border-r pr-2 mr-2' },
            React.createElement('button', {
              onClick: () => toggleBlockType('unordered-list-item'),
              className: `p-2 rounded hover:bg-gray-100 ${getBlockType() === 'unordered-list-item' ? 'bg-gray-200' : ''}`,
              title: 'Bullet List',
              key: 'unordered-list'
            }, React.createElement(FaListUl)),
            React.createElement('button', {
              onClick: () => toggleBlockType('ordered-list-item'),
              className: `p-2 rounded hover:bg-gray-100 ${getBlockType() === 'ordered-list-item' ? 'bg-gray-200' : ''}`,
              title: 'Numbered List',
              key: 'ordered-list'
            }, React.createElement(FaListOl))
          )}

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
          customStyleMap={editorStyleMap}
          blockStyleFn={blockStyleFn}
          spellCheck={true}
        />
      </div>
    </div>
  );
};
