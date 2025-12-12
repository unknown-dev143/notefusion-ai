import React, { useState, useCallback, useMemo } from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  CloseOutlined, 
  FilePdfOutlined, 
  FileWordOutlined 
} from '@ant-design/icons';
import RichTextEditorWithDrawing from './RichTextEditorWithDrawing.new';
import { Note } from '../types';
import './NoteViewer.css';

const { Title } = Typography;

interface NoteViewerProps {
  note: Note;
  onSave: (updatedNote: Note) => Promise<void>;
  onExportPDF?: () => void;
  onExportDOCX?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const NoteViewer: React.FC<NoteViewerProps> = ({ 
  note, 
  onSave, 
  onExportPDF, 
  onExportDOCX,
  className = '',
  style = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedNote, setEditedNote] = useState<Note>({ ...note });

  const handleEditToggle = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await onSave(editedNote);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editedNote, onSave]);

  const handleCancel = useCallback(() => {
    setEditedNote({ ...note });
    setIsEditing(false);
  }, [note]);

  const handleContentChange = useCallback((content: string) => {
    setEditedNote(prev => ({
      ...prev,
      content
    }));
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedNote(prev => ({
      ...prev,
      title: e.target.value
    }));
  }, []);

  const titleContent = useMemo(() => {
    if (!isEditing) {
      return <Title level={2} className="m-0">{note.title}</Title>;
    }
    
    return (
      <input
        type="text"
        value={editedNote.title}
        onChange={handleTitleChange}
        className="note-title-input"
        aria-label="Note title"
        placeholder="Enter note title"
      />
    );
  }, [isEditing, note.title, editedNote.title, handleTitleChange]);

  const actionButtons = useMemo(() => {
    if (!isEditing) {
      return (
        <>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={handleEditToggle}
          >
            Edit
          </Button>
          {onExportPDF && (
            <Button 
              icon={<FilePdfOutlined />}
              onClick={onExportPDF}
            >
              Export PDF
            </Button>
          )}
          {onExportDOCX && (
            <Button 
              icon={<FileWordOutlined />}
              onClick={onExportDOCX}
            >
              Export DOCX
            </Button>
          )}
        </>
      );
    }
    
    return (
      <>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSave}
          loading={isSaving}
        >
          Save
        </Button>
        <Button 
          icon={<CloseOutlined />} 
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </>
    );
  }, [isEditing, isSaving, handleEditToggle, handleSave, handleCancel, onExportPDF, onExportDOCX]);

  return (
    <Card
      className={`${className} note-viewer`}
      style={style}
      title={
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {titleContent}
          </div>
          <Space className="action-buttons">
            {actionButtons}
          </Space>
        </div>
      }
    >
      <div className="note-content">
        {isEditing ? (
          <div className="rich-text-editor-container">
            <RichTextEditorWithDrawing 
              initialContent={editedNote.content}
              onChange={handleContentChange}
              aria-label="Note content editor"
            />
          </div>
        ) : (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: note.content || '' }}
            aria-label="Note content"
          />
        )}
      </div>
    </Card>
  );
};

// Export as named export
export { NoteViewer };

export default NoteViewer;
