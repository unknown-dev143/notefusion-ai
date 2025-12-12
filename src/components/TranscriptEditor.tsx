import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, List, Tag, Input, Modal, message, Tooltip, Divider } from 'antd';
import { 
  EditOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TranscriptSegment {
  id: string;
  timestamp: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
  confidence: number;
  isEdited?: boolean;
}

interface TranscriptSession {
  id: string;
  title: string;
  date: string;
  duration: number;
  segments: TranscriptSegment[];
}

const TranscriptEditor: React.FC = () => {
  const [sessions, setSessions] = useState<TranscriptSession[]>([
    {
      id: '1',
      title: 'Lecture 1 - Introduction to AI',
      date: new Date().toISOString(),
      duration: 3600,
      segments: [
        {
          id: '1',
          timestamp: '00:00:00',
          startTime: 0,
          endTime: 15,
          text: 'Welcome everyone to today\'s lecture on artificial intelligence.',
          speaker: 'Professor Smith',
          confidence: 0.95
        },
        {
          id: '2',
          timestamp: '00:00:15',
          startTime: 15,
          endTime: 32,
          text: 'In this session, we\'ll cover the fundamental concepts of machine learning.',
          speaker: 'Professor Smith',
          confidence: 0.92
        },
        {
          id: '3',
          timestamp: '00:00:32',
          startTime: 32,
          endTime: 48,
          text: 'Can anyone tell me what they already know about AI?',
          speaker: 'Professor Smith',
          confidence: 0.89
        }
      ]
    }
  ]);

  const [selectedSession, setSelectedSession] = useState<TranscriptSession | null>(null);
  const [editingSegment, setEditingSegment] = useState<TranscriptSegment | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editText, setEditText] = useState('');
  const [editSpeaker, setEditSpeaker] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSegments, setFilteredSegments] = useState<TranscriptSegment[]>([]);
  const [addSegmentModalVisible, setAddSegmentModalVisible] = useState(false);
  const [newSegmentTime, setNewSegmentTime] = useState('');
  const [newSegmentText, setNewSegmentText] = useState('');
  const [newSegmentSpeaker, setNewSegmentSpeaker] = useState('');

  useEffect(() => {
    if (selectedSession && searchTerm) {
      const filtered = selectedSession.segments.filter(segment =>
        segment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.speaker?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSegments(filtered);
    } else if (selectedSession) {
      setFilteredSegments(selectedSession.segments);
    }
  }, [selectedSession, searchTerm]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTimeString = (timeString: string) => {
    const parts = timeString.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseInt(parts[2]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  };

  const editSegment = (segment: TranscriptSegment) => {
    setEditingSegment(segment);
    setEditText(segment.text);
    setEditSpeaker(segment.speaker || '');
    setEditModalVisible(true);
  };

  const saveSegmentEdit = () => {
    if (editingSegment && selectedSession) {
      const updatedSegment = { 
        ...editingSegment, 
        text: editText,
        speaker: editSpeaker,
        isEdited: true
      };
      
      const updatedSegments = selectedSession.segments.map(seg => 
        seg.id === editingSegment.id ? updatedSegment : seg
      );
      
      const updatedSession = { ...selectedSession, segments: updatedSegments };
      setSelectedSession(updatedSession);
      setSessions(prev => prev.map(session => 
        session.id === selectedSession.id ? updatedSession : session
      ));
      
      setEditModalVisible(false);
      setEditingSegment(null);
      setEditText('');
      setEditSpeaker('');
      message.success('Transcript segment updated');
    }
  };

  const deleteSegment = (segmentId: string) => {
    if (selectedSession) {
      const updatedSegments = selectedSession.segments.filter(seg => seg.id !== segmentId);
      const updatedSession = { ...selectedSession, segments: updatedSegments };
      setSelectedSession(updatedSession);
      setSessions(prev => prev.map(session => 
        session.id === selectedSession.id ? updatedSession : session
      ));
      message.success('Segment deleted');
    }
  };

  const addNewSegment = () => {
    if (selectedSession && newSegmentTime && newSegmentText) {
      const startTime = parseTimeString(newSegmentTime);
      const newSegment: TranscriptSegment = {
        id: Date.now().toString(),
        timestamp: newSegmentTime,
        startTime,
        endTime: startTime + 10,
        text: newSegmentText,
        speaker: newSegmentSpeaker,
        confidence: 1.0,
        isEdited: true
      };
      
      const updatedSegments = [...selectedSession.segments, newSegment].sort((a, b) => a.startTime - b.startTime);
      const updatedSession = { ...selectedSession, segments: updatedSegments };
      setSelectedSession(updatedSession);
      setSessions(prev => prev.map(session => 
        session.id === selectedSession.id ? updatedSession : session
      ));
      
      setAddSegmentModalVisible(false);
      setNewSegmentTime('');
      setNewSegmentText('');
      setNewSegmentSpeaker('');
      message.success('New segment added');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'green';
    if (confidence >= 0.7) return 'orange';
    return 'red';
  };

  return (
    <Card title="Transcript Editor with Timestamps" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Session Selection */}
        <div>
          <Title level={4}>Select Session</Title>
          <List
            dataSource={sessions}
            renderItem={(session) => (
              <List.Item
                actions={[
                  <Button 
                    type="primary"
                    onClick={() => setSelectedSession(session)}
                  >
                    Edit
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={session.title}
                  description={
                    <Space>
                      <ClockCircleOutlined />
                      <Text>{formatTime(session.duration)}</Text>
                      <Text type="secondary">
                        {new Date(session.date).toLocaleDateString()}
                      </Text>
                      <Tag color="blue">{session.segments.length} segments</Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>

        {selectedSession && (
          <>
            <Divider />
            
            {/* Search and Add Controls */}
            <div>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Input
                  placeholder="Search transcript..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ maxWidth: 400 }}
                />
                <Button 
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddSegmentModalVisible(true)}
                >
                  Add Segment
                </Button>
              </Space>
            </div>

            {/* Transcript Segments */}
            <div>
              <Title level={4}>
                {selectedSession.title}
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
                  {filteredSegments.length} of {selectedSession.segments.length} segments
                </Text>
              </Title>
              
              <List
                dataSource={filteredSegments}
                renderItem={(segment) => (
                  <List.Item
                    actions={[
                      <Tooltip title="Edit segment">
                        <Button 
                          type="text" 
                          icon={<EditOutlined />}
                          onClick={() => editSegment(segment)}
                        />
                      </Tooltip>,
                      <Tooltip title="Delete segment">
                        <Button 
                          type="text" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => deleteSegment(segment.id)}
                        />
                      </Tooltip>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color="blue">{segment.timestamp}</Tag>
                          {segment.speaker && (
                            <Tag color="green" icon={<UserOutlined />}>
                              {segment.speaker}
                            </Tag>
                          )}
                          <Tag color={getConfidenceColor(segment.confidence)}>
                            {Math.round(segment.confidence * 100)}%
                          </Tag>
                          {segment.isEdited && (
                            <Tag color="purple">Edited</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <div>
                          <Paragraph style={{ marginBottom: 4 }}>
                            {segment.text}
                          </Paragraph>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Duration: {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </>
        )}

        {/* Edit Segment Modal */}
        <Modal
          title="Edit Transcript Segment"
          open={editModalVisible}
          onOk={saveSegmentEdit}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingSegment(null);
            setEditText('');
            setEditSpeaker('');
          }}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Timestamp:</Text>
              <Input 
                value={editingSegment?.timestamp}
                disabled
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text strong>Speaker:</Text>
              <Input
                value={editSpeaker}
                onChange={(e) => setEditSpeaker(e.target.value)}
                placeholder="Speaker name"
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text strong>Transcript:</Text>
              <TextArea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                placeholder="Edit transcript text..."
                style={{ marginTop: 4 }}
              />
            </div>
          </Space>
        </Modal>

        {/* Add Segment Modal */}
        <Modal
          title="Add New Segment"
          open={addSegmentModalVisible}
          onOk={addNewSegment}
          onCancel={() => {
            setAddSegmentModalVisible(false);
            setNewSegmentTime('');
            setNewSegmentText('');
            setNewSegmentSpeaker('');
          }}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Timestamp (HH:MM:SS):</Text>
              <Input
                value={newSegmentTime}
                onChange={(e) => setNewSegmentTime(e.target.value)}
                placeholder="00:05:30"
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text strong>Speaker:</Text>
              <Input
                value={newSegmentSpeaker}
                onChange={(e) => setNewSegmentSpeaker(e.target.value)}
                placeholder="Speaker name (optional)"
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text strong>Transcript:</Text>
              <TextArea
                value={newSegmentText}
                onChange={(e) => setNewSegmentText(e.target.value)}
                rows={4}
                placeholder="Enter transcript text..."
                style={{ marginTop: 4 }}
              />
            </div>
          </Space>
        </Modal>
      </Space>
    </Card>
  );
};

export default TranscriptEditor;
