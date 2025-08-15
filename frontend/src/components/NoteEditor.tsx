import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  Space, 
  message, 
  Tooltip, 
  Divider
} from 'antd';
import { 
  SaveOutlined, 
  PushpinOutlined, 
  PushpinFilled, 
  RobotOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import AIToolbar from './ai/AIToolbar';
import AITemplateManager from './ai/AITemplateManager';
import AISuggestions from './ai/AISuggestions';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'react-dynamic';

// Types
type SharePermission = 'view' | 'edit';

interface NoteEditorProps {
  noteId?: string;
  onClose?: () => void;
}

interface NoteEditorState {
  title: string;
  content: string;
  tags: string[];
  newTag: string;
  isPinned: boolean;
  isNewNote: boolean;
  showAITools: boolean;
  showTemplateManager: boolean;
  showAISuggestions: boolean;
  isSharing: boolean;
  shareEmail: string;
  sharePermission: string;
  isLoading: boolean;
}

// Dynamically import ReactQuill for better performance
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div><LoadingOutlined /> Loading editor...</div>,
});

// Define toolbar options for the rich text editor
const editorModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
      ['code-block'],
      ['ai-tools']
    ],
    handlers: {
      'ai-tools': () => toggleAITools()
    }
  },
};

// Register AI Tools button in Quill
useEffect(() => {
  if (typeof window === 'undefined') return;
  
  const quill = document.querySelector('.ql-toolbar');
  if (!quill) return;
  
  const aiButton = document.createElement('button');
  aiButton.className = 'ql-ai-tools';
  aiButton.innerHTML = '<span class="ql-ai-icon">AI</span>';
  aiButton.title = 'AI Tools';
  
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    setState(prev => ({
      ...prev,
      showAITools: !prev.showAITools
    }));
  };
  
  aiButton.addEventListener('click', handleClick);
  quill.appendChild(aiButton);
  
  return () => {
    aiButton.removeEventListener('click', handleClick);
    if (quill.contains(aiButton)) {
      quill.removeChild(aiButton);
    }
  };
}, []);

const editorFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'image', 'video',
  'code-block',
  'color', 'background',
  'align'
];

interface NoteEditorProps {
  noteId?: string;
  onClose?: () => void;
}

interface NoteEditorState {
  title: string;
const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, onClose }) => {
  const [state, setState] = useState<NoteEditorState>({
    title: '',
    content: '',
    tags: [],
    newTag: '',
    isPinned: false,
    isNewNote: !noteId,
    showAITools: false,
    showTemplateManager: false,
    showAISuggestions: false,
    isSharing: false,
    shareEmail: '',
    sharePermission: 'view',
    isLoading: false,
  });

  const editorRef = useRef<ReactQuill>(null);
  const { 
    getNote, 
    createNote, 
    updateNote, 
    deleteNote, 
    addMediaToNote,
    togglePinNote,
    loading 
  } = useNotes();
  
  useEffect(() => {
    const loadNote = async () => {
      if (noteId) {
        const note = await getNote(noteId);
        if (note) {
          setState(prev => ({
            ...prev,
            title: note.title,
            content: note.content,
            tags: note.tags || [],
            isPinned: note.isPinned || false,
            isNewNote: false
          }));
        }
      }
    };
    
    loadNote();
  }, [noteId, getNote]);

  const handleContentChange = (value: string) => {
    setState(prev => ({
      ...prev,
      content: value
    }));
  };

  const handleContentUpdate = useCallback((newContent: string) => {
    setState(prev => ({
      ...prev,
      content: newContent
    }));
  }, []);

  const handlePinToggle = () => {
    setState(prev => ({
      ...prev,
      isPinned: !prev.isPinned
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && state.newTag) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleShareViaEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.shareEmail) return;
    
    try {
      await shareNote(noteId || '', {
        email: state.shareEmail,
        permission: state.sharePermission,
        message: `Check out this note: ${state.title}`
      });
      message.success('Note shared successfully');
      setState(prev => ({
        ...prev,
        shareEmail: '',
        isSharing: false
      }));
    } catch (error) {
      console.error('Error sharing note:', error);
      message.error('Failed to share note');
    }
  };

  const handleExport = (format: 'pdf' | 'markdown' | 'html') => {
    try {
      exportNote({
        id: noteId || 'new-note',
        title: state.title,
        content: state.content,
        format
      });
      message.success(`Exported to ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Error exporting note:', error);
      message.error('Failed to export note');
    }
  };

  const handleMediaUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file');
      return '';
    }
  };

  // toggleAITools is now handled directly in the effect

  const toggleTemplateManager = useCallback(() => {
    setState(prev => ({
      ...prev,
      showTemplateManager: !prev.showTemplateManager
    }));
  }, []);

  const handleApplyTemplate = useCallback((template: { content: string; name: string }) => {
    setState(prev => ({
      ...prev,
      content: template.content,
      showTemplateManager: false
    }));
    message.success(`Applied template: ${template.name}`);
  }, []);

  const handleSave = async () => {
    try {
      if (!state.title.trim()) {
        message.error('Please enter a title');
        return;
      }

      const noteData = {
        title: state.title.trim(),
        content: state.content,
        tags: state.tags,
        isPinned: state.isPinned,
        updatedAt: new Date().toISOString(),
      };

      if (state.isNewNote) {
        await createNote(noteData);
        message.success('Note created successfully');
      } else if (noteId) {
        await updateNote(noteId, noteData);
        message.success('Note updated successfully');
      }

      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note');
    }
  };

  const handleDelete = async () => {
    if (!noteId) return;
    
    try {
      await deleteNote(noteId);
      message.success('Note deleted successfully');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error deleting note:', error);
      message.error('Failed to delete note');
    }
  };

  const handleAddTag = () => {
    if (!state.newTag.trim() || state.tags.includes(state.newTag.trim())) return;
    setState(prev => ({
      ...prev,
      tags: [...prev.tags, state.newTag.trim()],
      newTag: ''
    }));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleMediaEmbed = (url: string, type: 'image' | 'video') => {
    let mediaHtml = '';
    
    switch (type) {
      case 'image':
        mediaHtml = `<img src="${url}" alt="Embedded image" style="max-width: 100%;" />`;
        break;
      case 'video':
        mediaHtml = `
          <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden;">
            <video 
              src="${url}" 
              controls 
              style="position:absolute; top:0; left:0; width:100%; height:100%;"
            ></video>
          </div>
        `;
        break;
      default:
        mediaHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    }
    
    setState(prev => ({ ...prev, content: prev.content + mediaHtml }));
  };

  const handleUpload = async (file: File) => {
    if (!noteId) {
      message.warning('Please save the note before uploading files');
      return '';
    }
    
    try {
      const url = await addMediaToNote(noteId, file);
      return url;
    } catch (error) {
      message.error('Failed to upload file');
      throw error;
    }
  };

  const handleTogglePin = async () => {
    if (noteId) {
      await togglePinNote(noteId);
      setState(prev => ({ ...prev, isPinned: !prev.isPinned }));
    }
  };

  const handleApplySuggestion = useCallback((type: string, content: string) => {
    setState(prev => ({
      ...prev,
      content: content
    }));
  }, []);
        // Add summary at the top of the content
        setState(prev => ({ ...prev, content: `<h2>Summary</h2><p>${content}</p>\n\n${prev.content}` }));
        break;
      case 'related-note':
        // Add related note link
        setState(prev => ({ ...prev, content: `${prev.content}\n\nRelated: ${content}` }));
        break;
      default:
        break;
    }
  };

  const handleShareNote = async () => {
    if (!noteId) return;
    
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/shared/${noteId}`);
      message.success('Shareable link copied to clipboard');
    } catch (error) {
      message.error('Failed to copy share link');
    }
  };

  const handleShareViaEmail = async () => {
    if (!state.shareEmail) {
      message.warning('Please enter an email address');
      return;
    }

    try {
      // In a real app, you would call your API to send the email
      message.loading({ content: 'Sharing note...', key: 'share' });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      message.success({ 
        content: `Note shared with ${state.shareEmail} (${state.sharePermission} access)`,
        key: 'share'
      });
      setState(prev => ({ ...prev, shareEmail: '', isSharing: false }));
    } catch (error) {
      message.error({ content: 'Failed to share note', key: 'share' });
    }
  };

  const exportAsPDF = () => {
    // In a real app, you would generate a PDF from the note content
    message.info('Exporting as PDF...');
    // This is a placeholder for PDF generation logic
  };

  const exportAsMarkdown = () => {
    // Convert HTML to Markdown (simplified)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = state.content;
    
    // Simple HTML to Markdown conversion (would need a proper library in production)
    let markdown = `# ${state.title}\n\n`;
    markdown += tempDiv.innerText;
    
    // Create download link
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareMenu = (
    <Menu
      items={[
        {
          key: 'email',
          label: 'Share via Email',
          icon: <MailOutlined />,
          onClick: handleShareNote
        },
        {
          key: 'email',
          label: 'Share via Email',
          icon: <MailOutlined />,
          onClick: () => setState(prev => ({ ...prev, isSharing: true }))
        },
        {
          key: 'collaborate',
          label: 'Invite Collaborators',
          icon: <TeamOutlined />,
          disabled: true // Future feature
        },
        {
          type: 'divider'
        },
        {
          key: 'export-pdf',
          label: 'Export as PDF',
          icon: <FilePdfOutlined />,
          onClick: exportAsPDF
        },
        {
          key: 'export-markdown',
          label: 'Export as Markdown',
          icon: <FileMarkdownOutlined />,
          onClick: exportAsMarkdown
        }
      ]}
    />
  );

  const exportMenuItems = [
    {
      key: 'pdf',
      label: 'Export as PDF',
      icon: <FilePdfOutlined />,
      onClick: exportAsPDF,
    },
    {
      key: 'markdown',
      label: 'Export as Markdown',
      icon: <FileMarkdownOutlined />,
      onClick: exportAsMarkdown,
    },
  ];

  return (
    <div className="note-editor">
      <Card
        title={
          <Input
            placeholder="Note Title"
          value={state.title}
          onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
          bordered={false}
          className="text-2xl font-bold"
        />
      }
      extra={[
        <Space key="actions" size="middle">
          <Tooltip title={state.isPinned ? 'Unpin' : 'Pin'}>
            <Button
              type="text"
              icon={state.isPinned ? <PushpinFilled /> : <PushpinOutlined />}
              onClick={handleTogglePin}
            />
          </Tooltip>
          <Tooltip title="AI Suggestions">
            <Button
              type="text"
              icon={<BulbOutlined />}
              onClick={toggleAISuggestions}
              className={state.showAISuggestions ? 'bg-blue-50' : ''}
            />
          </Tooltip>
          <Dropdown overlay={shareMenu} trigger={['click']}>
            <Button icon={<ShareAltOutlined />}>Share</Button>
          </Dropdown>
          <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
            <Button>Export</Button>
          </Dropdown>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={state.isLoading}
          >
            Save
          </Button>
          {!state.isNewNote && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              disabled={state.isLoading}
            />
          )}
          {onClose && (
            <Button icon={<CloseOutlined />} onClick={onClose} />
          )}
        </Space>
      ]}
      className="h-full flex flex-col"
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
    >
      <div className="p-4 border-b">
        <Space size={[0, 8]} wrap>
          {state.tags.map(tag => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(tag)}
              className="flex items-center"
            >
              {tag}
            </Tag>
          ))}
          <Input
            size="small"
            placeholder="Add tag"
            value={state.newTag}
            onChange={(e) => setState(prev => ({ ...prev, newTag: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            onBlur={handleAddTag}
            className="w-24"
            prefix={<TagOutlined />}
          />
        </Space>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="editor-toolbar" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <Space>
            <Tooltip title="Save">
              <Button 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                disabled={!state.title.trim()}
              />
            </Tooltip>
            
            <Tooltip title="AI Tools">
              <Button 
                icon={<RobotOutlined />} 
                onClick={toggleAITools}
                type={state.showAITools ? 'primary' : 'default'}
              />
            </Tooltip>
            
            <Tooltip title="Templates">
              <Button 
                icon={<FileTextOutlined />} 
                onClick={toggleTemplateManager}
              />
            </Tooltip>
            
            <Divider type="vertical" />
            
            <Tooltip title={state.isPinned ? 'Unpin' : 'Pin to top'}>
              <Button 
                icon={state.isPinned ? <PushpinFilled /> : <PushpinOutlined />} 
                onClick={handleTogglePin}
              />
            </Tooltip>
          </Space>
        </div>
        <div className="editor-content">
          {state.showAITools && (
            <div className="ai-toolbar-container" style={{ marginBottom: '16px' }}>
              <AIToolbar 
                noteId={noteId || 'new'}
                content={state.content}
                onContentUpdate={handleContentUpdate}
                onSaveTemplate={() => toggleTemplateManager()}
              />
            </div>
          )}
          <ReactQuill
            theme="snow"
            value={state.content}
            onChange={handleContentChange}
            modules={editorModules}
            placeholder="Start writing your note here..."
            style={{ height: '50vh' }}
          />
          <AISuggestions
            noteId={noteId || 'new'}
            content={state.content}
            onApplySuggestion={handleContentUpdate}
          />
        </div>
      )}
      <Modal
        title="Share Note"
        open={state.isSharing}
        onCancel={() => setState(prev => ({ ...prev, isSharing: false }))}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleShareViaEmail}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input email address' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              placeholder="Enter email address"
              value={state.shareEmail}
              onChange={(e) => setState(prev => ({ ...prev, shareEmail: e.target.value }))}
            />
          </Form.Item>
          <Form.Item
            label="Permission"
            name="permission"
            initialValue={state.sharePermission}
          >
            <select
              className="w-full p-2 border rounded"
              value={state.sharePermission}
              onChange={(e) => setState(prev => ({
                ...prev,
                sharePermission: e.target.value as SharePermission
              }))}
            >
              <option value="view">Can View</option>
              <option value="edit">Can Edit</option>
            </select>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Share
          </Button>
        </Form>
      </Modal>
    </Card>
  );

export default NoteEditor;
