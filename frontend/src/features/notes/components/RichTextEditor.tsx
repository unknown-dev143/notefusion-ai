import React, { useState, useEffect } from 'react';
import './RichTextEditor.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Form, Input, Tag, message, Popconfirm, Spin } from 'antd';
import type { FormInstance } from 'antd/es/form';
import ReactQuill from 'react-quill';
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  DeleteOutlined, 
  TagOutlined 
} from '@ant-design/icons';
import 'react-quill/dist/quill.snow.css';
import { useNoteStore } from '../store/useNoteStore';

// Extend FormInstance to include missing methods
declare module 'antd/es/form/Form' {
  interface FormInstance<Values = any> {
    submit: () => void;
    setFieldsValue: (values: Partial<Values>) => void;
    resetFields: (fields?: string[]) => void;
  }
}

declare module 'antd/es/form/interface' {
  interface FormInstance<Values = any> {
    submit: () => void;
  }
}

// Define the note data interface
interface NoteData {
  title: string;
  content: string;
  tags?: string[];
}

// Form values type
type NoteFormValues = Omit<NoteData, 'tags'>;

const RichTextEditor: React.FC<{ isNew?: boolean }> = ({ isNew = false }) => {
  const [form] = Form.useForm<NoteFormValues>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const formRef = React.useRef<FormInstance<NoteFormValues>>(null);
  
  const { 
    currentNote, 
    fetchNote, 
    createNote, 
    updateNote, 
    deleteNote, 
    isLoading 
  } = useNoteStore();

  // Load note if editing
  useEffect(() => {
    if (!isNew && id) {
      fetchNote(id);
    }
  }, [id, isNew, fetchNote]);

  // Set form values when currentNote changes
  useEffect(() => {
    if (currentNote && !isNew) {
      form.setFieldsValue({
        title: currentNote.title || '',
        content: currentNote.content || ''
      });
      setTags(currentNote.tags || []);
    } else if (isNew) {
      form.resetFields();
      setTags([]);
    }
  }, [currentNote, isNew, form]);

  // Handle form submission
  const handleSubmit = async (formData: NoteFormValues) => {
    try {
      setIsSaving(true);
      const noteData: NoteData = {
        ...formData,
        tags,
      };

      if (isNew) {
        await createNote(noteData);
        message.success('Note created successfully');
      } else if (id) {
        await updateNote(id, noteData);
        message.success('Note updated successfully');
      }
      
      navigate('/notes');
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form submission from button click
  const handleFormSubmit = () => {
    form.submit();
  };

  // Handle content change in the editor
  const handleContentChange = (content: string) => {
    form.setFieldsValue({ content });
  };

  // Handle form field changes
  const handleFormChange = (changedValues: any, allValues: NoteFormValues) => {
    // Handle form field changes if needed
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deleteNote(id);
      message.success('Note deleted successfully');
      navigate('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      message.error('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTagClose = (removedTag: string) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const handleTagAdd = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]);
      setInputTag('');
    }
  };

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image']
    ],
  };

  if (isLoading && !isNew) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4">Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Back to Notes
        </Button>
      </div>

      <Card
        title={
          <div className="flex justify-between items-center">
            <span>{isNew ? 'Create New Note' : 'Edit Note'}</span>
            <Space>
              {!isNew && (
                <Popconfirm
                  title="Are you sure you want to delete this note?"
                  onConfirm={handleDelete}
                  okText="Yes"
                  cancelText="No"
                  placement="bottomRight"
                >
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    loading={isDeleting}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              )}
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleFormSubmit}
                loading={isSaving}
                htmlType="submit"
              >
                Save
              </Button>
            </Space>
          </div>
        }
      >
        <Form<NoteFormValues>
          form={form}
          onFinish={handleSubmit}
          onValuesChange={handleFormChange}
          layout="vertical"
          initialValues={{
            title: '',
            content: ''
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Note title" size="large" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter note content' }]}
          >
            <div className="quill-container">
              <ReactQuill
                theme="snow"
                modules={quillModules}
                className="rich-text-editor"
                placeholder="Write your note here..."
                onChange={handleContentChange}
              />
            </div>
          </Form.Item>

          <div className="mt-4">
            <div className="flex items-center mb-2">
              <Input
                placeholder="Add a tag"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onPressEnter={(e) => {
                  e.preventDefault();
                  handleTagAdd();
                }}
                className="w-48"
              />
              <Button 
                type="text" 
                icon={<TagOutlined />} 
                onClick={handleTagAdd}
                className="ml-2"
              >
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Tag 
                  key={tag} 
                  closable 
                  onClose={() => handleTagClose(tag)}
                  className="mb-2"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RichTextEditor;
