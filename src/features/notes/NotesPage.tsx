import { useState } from 'react';
import { Button, Card, Typography, List, Input, Modal, Form, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search, TextArea } = Input;

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to NoteFusion',
    content: 'This is your first note. You can edit or delete it later.',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Getting Started',
    content: 'Click the "Add Note" button to create a new note.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchText.toLowerCase()) ||
    note.content.toLowerCase().includes(searchText.toLowerCase())
  );

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleSubmit = (values: { title: string; content: string }) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: values.title,
      content: values.content,
      createdAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    message.success('Note added successfully!');
    form.resetFields();
    setIsModalVisible(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>My Notes</Title>
      
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <Search
          placeholder="Search notes..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showModal}
        >
          Add Note
        </Button>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
        dataSource={filteredNotes}
        renderItem={note => (
          <List.Item>
            <Card 
              title={note.title} 
              style={{ height: '100%' }}
              hoverable
              extra={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {new Date(note.createdAt).toLocaleDateString()}
                </Text>
              }
            >
              <p style={{ whiteSpace: 'pre-line' }}>{note.content}</p>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Add New Note"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Note title" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter some content' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="Write your note here..." 
              style={{ resize: 'vertical' }}
            />
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save Note
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default NotesPage;
