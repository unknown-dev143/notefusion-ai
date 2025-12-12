import React, { useState } from 'react';
import { Card, Typography, Button, Space, List, Tag, Modal, Input, DatePicker, message, Tabs } from 'antd';
import { 
  FolderOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CalendarOutlined,
  BookOutlined,
  AudioOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface SessionContent {
  audioRecording?: {
    duration: number;
    blob?: Blob;
    transcript?: string;
  };
  pdfDocuments?: Array<{
    id: string;
    name: string;
    pageCount: number;
    extractedText: string;
  }>;
  whiteboard?: {
    data: string;
    timestamp: string;
  };
  generatedNotes?: string;
  flashcards?: Array<{
    question: string;
    answer: string;
  }>;
}

interface StudySession {
  id: string;
  title: string;
  moduleCode: string;
  description: string;
  date: string;
  duration: number;
  status: 'active' | 'completed' | 'archived';
  content: SessionContent;
  tags: string[];
  participants: string[];
}

const SessionManager: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      moduleCode: 'CS301',
      description: 'Fundamental concepts of machine learning and neural networks',
      date: new Date().toISOString(),
      duration: 7200,
      status: 'completed',
      content: {
        audioRecording: {
          duration: 3600,
          transcript: 'Welcome to the first lecture on machine learning...'
        },
        pdfDocuments: [
          {
            id: '1',
            name: 'ML_Textbook_Chapter1.pdf',
            pageCount: 45,
            extractedText: 'Machine learning is a subset of artificial intelligence...'
          }
        ],
        generatedNotes: '# Machine Learning Fundamentals\n\n## Key Concepts\n- Supervised Learning\n- Unsupervised Learning\n- Neural Networks',
        flashcards: [
          { question: 'What is machine learning?', answer: 'A subset of AI that enables systems to learn from data' }
        ]
      },
      tags: ['machine-learning', 'fundamentals', 'introduction'],
      participants: ['Professor Smith', '30 students']
    },
    {
      id: '2',
      title: 'Deep Learning Architectures',
      moduleCode: 'CS301',
      description: 'Advanced neural network architectures and applications',
      date: new Date(Date.now() + 86400000).toISOString(),
      duration: 5400,
      status: 'active',
      content: {
        audioRecording: { duration: 1800 },
        pdfDocuments: [],
        whiteboard: { data: 'whiteboard-data-url', timestamp: new Date().toISOString() }
      },
      tags: ['deep-learning', 'neural-networks', 'architectures'],
      participants: ['Professor Smith', '25 students']
    }
  ]);

  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    moduleCode: '',
    description: '',
    date: null as dayjs.Dayjs | null,
    tags: [] as string[],
    participants: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [newParticipant, setNewParticipant] = useState('');

  const statusColors = {
    active: 'blue',
    completed: 'green',
    archived: 'default'
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const createSession = () => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      title: sessionForm.title,
      moduleCode: sessionForm.moduleCode,
      description: sessionForm.description,
      date: sessionForm.date?.toISOString() || new Date().toISOString(),
      duration: 0,
      status: 'active',
      content: {},
      tags: sessionForm.tags,
      participants: sessionForm.participants
    };

    setSessions(prev => [newSession, ...prev]);
    setCreateModalVisible(false);
    resetForm();
    message.success('Session created successfully');
  };

  const updateSession = () => {
    if (selectedSession) {
      const updatedSession = {
        ...selectedSession,
        title: sessionForm.title,
        moduleCode: sessionForm.moduleCode,
        description: sessionForm.description,
        date: sessionForm.date?.toISOString() || selectedSession.date,
        tags: sessionForm.tags,
        participants: sessionForm.participants
      };

      setSessions(prev => prev.map(session => 
        session.id === selectedSession.id ? updatedSession : session
      ));
      
      setSelectedSession(updatedSession);
      setEditModalVisible(false);
      resetForm();
      message.success('Session updated successfully');
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
    }
    message.success('Session deleted');
  };

  const resetForm = () => {
    setSessionForm({
      title: '',
      moduleCode: '',
      description: '',
      date: null,
      tags: [],
      participants: []
    });
    setNewTag('');
    setNewParticipant('');
  };

  const addTag = () => {
    if (newTag.trim() && !sessionForm.tags.includes(newTag.trim())) {
      setSessionForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSessionForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addParticipant = () => {
    if (newParticipant.trim() && !sessionForm.participants.includes(newParticipant.trim())) {
      setSessionForm(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant.trim()]
      }));
      setNewParticipant('');
    }
  };

  const removeParticipant = (participantToRemove: string) => {
    setSessionForm(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== participantToRemove)
    }));
  };

  const startEditSession = (session: StudySession) => {
    setSelectedSession(session);
    setSessionForm({
      title: session.title,
      moduleCode: session.moduleCode,
      description: session.description,
      date: dayjs(session.date),
      tags: session.tags,
      participants: session.participants
    });
    setEditModalVisible(true);
  };

  const renderSessionContent = (session: StudySession) => {
    return (
      <Tabs defaultActiveKey="overview">
        <TabPane tab="Overview" key="overview">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Paragraph>{session.description}</Paragraph>
            <Space>
              <Tag color="blue">{session.moduleCode}</Tag>
              <Tag color={statusColors[session.status]}>{session.status}</Tag>
              <ClockCircleOutlined />
              <Text>{formatDuration(session.duration)}</Text>
            </Space>
            <div>
              <Text strong>Tags: </Text>
              <Space wrap>
                {session.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </Space>
            </div>
            <div>
              <Text strong>Participants: </Text>
              <Space wrap>
                {session.participants.map((participant, index) => (
                  <Tag key={index} icon={<UserOutlined />}>{participant}</Tag>
                ))}
              </Space>
            </div>
          </Space>
        </TabPane>
        
        <TabPane tab="Audio" key="audio" disabled={!session.content.audioRecording}>
          {session.content.audioRecording && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <AudioOutlined />
                <Text>Recording Duration: {formatDuration(session.content.audioRecording.duration)}</Text>
              </Space>
              {session.content.audioRecording.transcript && (
                <div>
                  <Text strong>Transcript:</Text>
                  <Paragraph style={{ background: '#f5f5f5', padding: '12px', marginTop: 8 }}>
                    {session.content.audioRecording.transcript}
                  </Paragraph>
                </div>
              )}
            </Space>
          )}
        </TabPane>
        
        <TabPane tab="Documents" key="documents" disabled={!session.content.pdfDocuments?.length}>
          {session.content.pdfDocuments && (
            <List
              dataSource={session.content.pdfDocuments}
              renderItem={(doc) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<FileTextOutlined />}
                    title={doc.name}
                    description={`${doc.pageCount} pages`}
                  />
                </List.Item>
              )}
            />
          )}
        </TabPane>
        
        <TabPane tab="Whiteboard" key="whiteboard" disabled={!session.content.whiteboard}>
          {session.content.whiteboard && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <BookOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              <div style={{ marginTop: '8px' }}>
                <Text>Whiteboard saved at {new Date(session.content.whiteboard.timestamp).toLocaleString()}</Text>
              </div>
            </div>
          )}
        </TabPane>
        
        <TabPane tab="Notes" key="notes" disabled={!session.content.generatedNotes}>
          {session.content.generatedNotes && (
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {session.content.generatedNotes}
              </pre>
            </div>
          )}
        </TabPane>
        
        <TabPane tab="Flashcards" key="flashcards" disabled={!session.content.flashcards?.length}>
          {session.content.flashcards && (
            <List
              dataSource={session.content.flashcards}
              renderItem={(flashcard, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={`Q${index + 1}: ${flashcard.question}`}
                    description={`A: ${flashcard.answer}`}
                  />
                </List.Item>
              )}
            />
          )}
        </TabPane>
      </Tabs>
    );
  };

  return (
    <Card title="Session Management System" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Header with Create Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Study Sessions</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Session
          </Button>
        </div>

        {/* Sessions List */}
        <List
          dataSource={sessions}
          renderItem={(session) => (
            <List.Item
              actions={[
                <Button 
                  type="text" 
                  icon={<EyeOutlined />}
                  onClick={() => setSelectedSession(session)}
                >
                  View
                </Button>,
                <Button 
                  type="text" 
                  icon={<EditOutlined />}
                  onClick={() => startEditSession(session)}
                >
                  Edit
                </Button>,
                <Button 
                  type="text" 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteSession(session.id)}
                >
                  Delete
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<FolderOutlined style={{ fontSize: '24px' }} />}
                title={
                  <Space>
                    {session.title}
                    <Tag color="blue">{session.moduleCode}</Tag>
                    <Tag color={statusColors[session.status]}>{session.status}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">{session.description}</Text>
                    <Space>
                      <CalendarOutlined />
                      <Text>{new Date(session.date).toLocaleDateString()}</Text>
                      <ClockCircleOutlined />
                      <Text>{formatDuration(session.duration)}</Text>
                    </Space>
                    <Space wrap>
                      {session.tags.slice(0, 3).map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                      {session.tags.length > 3 && (
                        <Tag>+{session.tags.length - 3} more</Tag>
                      )}
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />

        {/* Session Detail Modal */}
        <Modal
          title={selectedSession?.title}
          open={!!selectedSession}
          onCancel={() => setSelectedSession(null)}
          footer={null}
          width={800}
        >
          {selectedSession && renderSessionContent(selectedSession)}
        </Modal>

        {/* Create Session Modal */}
        <Modal
          title="Create New Session"
          open={createModalVisible}
          onOk={createSession}
          onCancel={() => {
            setCreateModalVisible(false);
            resetForm();
          }}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Session Title"
              value={sessionForm.title}
              onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              placeholder="Module Code (e.g., CS301)"
              value={sessionForm.moduleCode}
              onChange={(e) => setSessionForm(prev => ({ ...prev, moduleCode: e.target.value }))}
            />
            <TextArea
              placeholder="Session Description"
              value={sessionForm.description}
              onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <DatePicker
              showTime
              placeholder="Session Date & Time"
              value={sessionForm.date}
              onChange={(date) => setSessionForm(prev => ({ ...prev, date: date }))}
              style={{ width: '100%' }}
            />
            
            <div>
              <Text strong>Tags:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onPressEnter={addTag}
                />
                <Button onClick={addTag}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {sessionForm.tags.map((tag, index) => (
                  <Tag key={index} closable onClose={() => removeTag(tag)}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
            
            <div>
              <Text strong>Participants:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add participant"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onPressEnter={addParticipant}
                />
                <Button onClick={addParticipant}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {sessionForm.participants.map((participant, index) => (
                  <Tag key={index} closable onClose={() => removeParticipant(participant)}>
                    {participant}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>

        {/* Edit Session Modal */}
        <Modal
          title="Edit Session"
          open={editModalVisible}
          onOk={updateSession}
          onCancel={() => {
            setEditModalVisible(false);
            resetForm();
          }}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Session Title"
              value={sessionForm.title}
              onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              placeholder="Module Code (e.g., CS301)"
              value={sessionForm.moduleCode}
              onChange={(e) => setSessionForm(prev => ({ ...prev, moduleCode: e.target.value }))}
            />
            <TextArea
              placeholder="Session Description"
              value={sessionForm.description}
              onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <DatePicker
              showTime
              placeholder="Session Date & Time"
              value={sessionForm.date}
              onChange={(date) => setSessionForm(prev => ({ ...prev, date: date }))}
              style={{ width: '100%' }}
            />
            
            <div>
              <Text strong>Tags:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onPressEnter={addTag}
                />
                <Button onClick={addTag}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {sessionForm.tags.map((tag, index) => (
                  <Tag key={index} closable onClose={() => removeTag(tag)}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
            
            <div>
              <Text strong>Participants:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add participant"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onPressEnter={addParticipant}
                />
                <Button onClick={addParticipant}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {sessionForm.participants.map((participant, index) => (
                  <Tag key={index} closable onClose={() => removeParticipant(participant)}>
                    {participant}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>
      </Space>
    </Card>
  );
};

export default SessionManager;
