<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import './RichTextEditor.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Form, Input, Tag, message, Popconfirm, Spin } from 'antd';
import type { FormInstance } from 'antd/es/form';
import ReactQuill from 'react-quill';
=======
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Form, Input, Tag, Select, Spin, message, Popconfirm } from 'antd';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  DeleteOutlined, 
<<<<<<< HEAD
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
=======
  StarOutlined, 
  StarFilled,
  TagOutlined
} from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNoteStore } from '../store/useNoteStore';
import { Note, CreateNoteDto } from '../types';

const { TextArea } = Input;
const { Option } = Select;

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['clean'],
  ['link', 'image', 'video']
];

export const RichTextEditor: React.FC<{ isNew?: boolean }> = ({ isNew = false }) => {
  const [form] = Form.useForm();
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
<<<<<<< HEAD
  const formRef = React.useRef<FormInstance<NoteFormValues>>(null);
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  
  const { 
    currentNote, 
    fetchNote, 
    createNote, 
    updateNote, 
    deleteNote, 
<<<<<<< HEAD
=======
    togglePinNote,
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
        title: currentNote.title || '',
        content: currentNote.content || ''
=======
        title: currentNote.title,
        content: currentNote.content,
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      });
      setTags(currentNote.tags || []);
    } else if (isNew) {
      form.resetFields();
      setTags([]);
    }
  }, [currentNote, isNew, form]);

<<<<<<< HEAD
  // Handle form submission
  const handleSubmit = async (formData: NoteFormValues) => {
    try {
      setIsSaving(true);
      const noteData: NoteData = {
        ...formData,
=======
  const handleTagClose = (removedTag: string) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const handleTagAdd = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]);
      setInputTag('');
    }
  };

  const handleSave = async (values: Pick<CreateNoteDto, 'title' | 'content'>) => {
    try {
      setIsSaving(true);
      const noteData = {
        ...values,
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
      console.error('Error saving note:', error);
      message.error('Failed to save note');
=======
      message.error(`Failed to save note: ${error instanceof Error ? error.message : 'Unknown error'}`);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    } finally {
      setIsSaving(false);
    }
  };

<<<<<<< HEAD
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
=======
  const handlePinToggle = async () => {
    if (!id) return;
    try {
      await togglePinNote(id);
      message.success(`Note ${currentNote?.isPinned ? 'unpinned' : 'pinned'} successfully`);
    } catch (error) {
      message.error(`Failed to toggle pin status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  };

  const handleDelete = async () => {
    if (!id) return;
<<<<<<< HEAD
    
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    try {
      setIsDeleting(true);
      await deleteNote(id);
      message.success('Note deleted successfully');
      navigate('/notes');
    } catch (error) {
<<<<<<< HEAD
      console.error('Error deleting note:', error);
      message.error('Failed to delete note');
=======
      message.error(`Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    } finally {
      setIsDeleting(false);
    }
  };

<<<<<<< HEAD
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
=======
  if (isLoading && !isNew) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="p-4">
=======
    <div className="note-editor">
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
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
=======
            <span>{isNew ? 'New Note' : 'Edit Note'}</span>
            <Space>
              {!isNew && id && (
                <>
                  <Button 
                    icon={currentNote?.isPinned ? <StarFilled /> : <StarOutlined />}
                    onClick={handlePinToggle}
                    type="text"
                  >
                    {currentNote?.isPinned ? 'Pinned' : 'Pin Note'}
                  </Button>
                  <Popconfirm
                    title="Are you sure you want to delete this note?"
                    onConfirm={handleDelete}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ loading: isDeleting }}
                  >
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      loading={isDeleting}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              )}
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
<<<<<<< HEAD
                onClick={handleFormSubmit}
                loading={isSaving}
                htmlType="submit"
=======
                onClick={() => form.submit()}
                loading={isSaving}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              >
                Save
              </Button>
            </Space>
          </div>
        }
      >
<<<<<<< HEAD
        <Form<NoteFormValues>
          form={form}
          onFinish={handleSubmit}
          onValuesChange={handleFormChange}
          layout="vertical"
          initialValues={{
            title: '',
            content: ''
=======
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            title: '',
            content: '',
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Note title" size="large" />
          </Form.Item>

<<<<<<< HEAD
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
=======
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <TagOutlined className="mr-2" />
              <span className="mr-2">Tags:</span>
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
            <Space.Compact style={{ width: '100%' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              <Input
                placeholder="Add a tag"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onPressEnter={(e) => {
                  e.preventDefault();
                  handleTagAdd();
                }}
<<<<<<< HEAD
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
=======
              />
              <Button type="primary" onClick={handleTagAdd}>
                Add
              </Button>
            </Space.Compact>
          </div>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter some content' }]}
          >
            <ReactQuill
              theme="snow"
              modules={{
                toolbar: toolbarOptions,
              }}
              placeholder="Start writing your note here..."
              className="h-96 mb-12"
            />
          </Form.Item>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        </Form>
      </Card>
    </div>
  );
};

export default RichTextEditor;
