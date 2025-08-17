import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Form, Input, Tag, Select, Spin, message, Popconfirm } from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  DeleteOutlined, 
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    currentNote, 
    fetchNote, 
    createNote, 
    updateNote, 
    deleteNote, 
    togglePinNote,
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
        title: currentNote.title,
        content: currentNote.content,
      });
      setTags(currentNote.tags || []);
    } else if (isNew) {
      form.resetFields();
      setTags([]);
    }
  }, [currentNote, isNew, form]);

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
      message.error(`Failed to save note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePinToggle = async () => {
    if (!id) return;
    try {
      await togglePinNote(id);
      message.success(`Note ${currentNote?.isPinned ? 'unpinned' : 'pinned'} successfully`);
    } catch (error) {
      message.error(`Failed to toggle pin status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await deleteNote(id);
      message.success('Note deleted successfully');
      navigate('/notes');
    } catch (error) {
      message.error(`Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && !isNew) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="note-editor">
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
              )}
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={() => form.submit()}
                loading={isSaving}
              >
                Save
              </Button>
            </Space>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            title: '',
            content: '',
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Note title" size="large" />
          </Form.Item>

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
              <Input
                placeholder="Add a tag"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onPressEnter={(e) => {
                  e.preventDefault();
                  handleTagAdd();
                }}
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
        </Form>
      </Card>
    </div>
  );
};

export default RichTextEditor;
