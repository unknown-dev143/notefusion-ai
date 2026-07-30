import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Space, Typography, message, Tag, Tooltip, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { SaveOutlined, TagOutlined, DeleteOutlined, ArrowLeftOutlined, ExportOutlined, FilePdfOutlined, FileWordOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Note } from '../../features/notes/context/NoteContext';
import './NoteEditor.css';
import AIAssistant from '../ai/AIAssistant';
import SynapseSidebar from './SynapseSidebar';
import { Share2, Zap, Brain } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDelete,
  onBack,
  loading,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSynapseOpen, setIsSynapseOpen] = useState(false);
  const [isDeepWork, setIsDeepWork] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [lastTypedAt, setLastTypedAt] = useState<number>(Date.now());
  const [hasNudged, setHasNudged] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        
        if (isDeepWork && !hasNudged) {
           const stallTime = (Date.now() - lastTypedAt) / 1000;
           if (stallTime > 15 && content.length > 20) {
              setHasNudged(true);
              message.info({
                 content: 'Neural Nudge: What is the core principle you are trying to capture here?',
                 duration: 8,
                 icon: <Brain className="text-blue-500 animate-pulse" size={18} />
              });
           }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isDeepWork, lastTypedAt, hasNudged, content.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim()) {
      message.error('Please enter a title');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        title,
        content,
        tags,
        updatedAt: new Date().toISOString(),
      });
      message.success('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleExportPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <h1>${title || 'Untitled Note'}</h1>
      ${content}
    `;
    const opt = {
      margin: 1,
      filename: `${title || 'note'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt as any).save();
    message.success('Exporting PDF...');
  };

  const handleExportWord = async () => {
    try {
      const htmlString = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${title || 'Untitled Note'}</title>
          </head>
          <body>
            <h1>${title || 'Untitled Note'}</h1>
            ${content}
          </body>
        </html>
      `;
      const blob = await asBlob(htmlString);
      saveAs(blob as Blob, `${title || 'note'}.docx`);
      message.success('Exporting Word Document...');
    } catch (error) {
      console.error('Error exporting Word:', error);
      message.error('Failed to export Word document');
    }
  };

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: 'Export as PDF',
      onClick: handleExportPDF,
    },
    {
      key: 'word',
      icon: <FileWordOutlined />,
      label: 'Export as Word',
      onClick: handleExportWord,
    },
  ];

  return (
    <Card
      className={`note-editor ${isDeepWork ? 'deep-work-active' : ''}`}
      title={
        <Space className="note-editor-header">
          {!isDeepWork && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              className="back-button"
              style={{ marginRight: 8 }}
            />
          )}
          {isDeepWork && (
            <div className="deep-work-badge flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full mr-4">
              <Zap size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">{formatTime(timer)}</span>
            </div>
          )}
          <Input
            className="note-title-input"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            bordered={false}
            style={{ fontSize: '1.5em', fontWeight: 'bold' }}
          />
        </Space>
      }
      extra={
        <Space>
          {!isDeepWork && (
            <Tooltip title="Neural Synapse Connections">
              <Button
                className="synapse-toggle-btn"
                onClick={() => setIsSynapseOpen(!isSynapseOpen)}
                icon={<Share2 size={16} />}
                type={isSynapseOpen ? 'primary' : 'default'}
                style={{ marginRight: 8 }}
              />
            </Tooltip>
          )}
          <Button
            onClick={() => {
              setIsDeepWork(!isDeepWork);
              setIsTimerRunning(!isDeepWork);
              if (isDeepWork) setTimer(0);
            }}
            className={isDeepWork ? 'deep-work-btn-active' : ''}
            icon={<Brain size={16} />}
            type={isDeepWork ? 'primary' : 'default'}
          >
            {isDeepWork ? 'Exit Deep Work' : 'Deep Work'}
          </Button>
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <Button icon={<ExportOutlined />}>Export</Button>
          </Dropdown>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isSaving || loading}
          >
            Save
          </Button>
          {note?.id && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => note?.id && onDelete(note.id)}
              loading={loading}
            >
              Delete
            </Button>
          )}
        </Space>
      }
    >
      <div className="note-tags" style={{ marginBottom: 16 }}>
        <Space size={[0, 8]} wrap>
          {tags.map((tag) => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(tag)}
              className="note-tag"
            >
              {tag}
            </Tag>
          ))}
          <Input
            size="small"
            className="note-tag-input"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            prefix={<TagOutlined />}
            style={{ width: 100 }}
          />
        </Space>
      </div>

      <div className="note-content" style={{ minHeight: '60vh' }}>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={(val) => {
             setContent(val);
             setLastTypedAt(Date.now());
             if (hasNudged) setHasNudged(false);
          }}
          placeholder="Start writing your note here..."
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              ['clean'],
              ['code-block'],
            ],
          }}
        />
      </div>

      {note?.updatedAt && (
        <div className="note-footer" style={{ marginTop: 16, textAlign: 'right' }}>
          <Text type="secondary">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </Text>
        </div>
      )}

      <AIAssistant
        noteId={note?.id}
        content={content}
        onContentUpdate={(newContent) => {
          setContent(newContent);
          message.success('AI updated your note content');
        }}
        onTagsUpdate={(newTags) => {
          setTags(prev => [...new Set([...prev, ...newTags])]);
          message.success('AI suggested new tags');
        }}
        initialTags={tags}
        defaultTab="summarize"
        isVisible={false}
        onClose={() => {}}
      />
      <SynapseSidebar 
        content={content} 
        isOpen={isSynapseOpen} 
        onClose={() => setIsSynapseOpen(false)} 
      />
    </Card>
  );
};

export default NoteEditor;
