import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Button, Space, Row, Col, List, Avatar, Tag, message, Modal, Input, Select, Badge } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  MessageOutlined,
  ShareAltOutlined,
  PlusOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  CommentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  isOnline: boolean;
  cursor?: {
    slide: number;
    x: number;
    y: number;
  };
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  slide: number;
  timestamp: Date;
  resolved: boolean;
}

interface PresentationSession {
  id: string;
  title: string;
  users: User[];
  comments: Comment[];
  currentSlide: number;
  isLive: boolean;
  createdAt: Date;
  lastModified: Date;
}

const PresentationCollaboration: React.FC = () => {
  const [sessions, setSessions] = useState<PresentationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PresentationSession | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [newComment, setNewComment] = useState('');
  const [selectedSlide, setSelectedSlide] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize with sample data
    const sampleSession: PresentationSession = {
      id: 'session-1',
      title: 'Q4 Marketing Presentation',
      users: [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'owner',
          isOnline: true,
          cursor: { slide: 0, x: 100, y: 200 }
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'editor',
          isOnline: true,
          cursor: { slide: 0, x: 300, y: 150 }
        },
        {
          id: 'user-3',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          role: 'viewer',
          isOnline: false
        }
      ],
      comments: [
        {
          id: 'comment-1',
          userId: 'user-2',
          userName: 'Jane Smith',
          content: 'Can we add more data to this slide?',
          slide: 0,
          timestamp: new Date(Date.now() - 3600000),
          resolved: false
        },
        {
          id: 'comment-2',
          userId: 'user-3',
          userName: 'Bob Wilson',
          content: 'The colors look great!',
          slide: 1,
          timestamp: new Date(Date.now() - 7200000),
          resolved: true
        }
      ],
      currentSlide: 0,
      isLive: true,
      createdAt: new Date(Date.now() - 86400000),
      lastModified: new Date()
    };

    setSessions([sampleSession]);
    setCurrentSession(sampleSession);
  }, []);

  const createSession = () => {
    if (!sessionTitle.trim()) {
      message.error('Please enter a session title');
      return;
    }

    const newSession: PresentationSession = {
      id: `session-${Date.now()}`,
      title: sessionTitle,
      users: [
        {
          id: 'current-user',
          name: 'You',
          email: 'you@example.com',
          role: 'owner',
          isOnline: true
        }
      ],
      comments: [],
      currentSlide: 0,
      isLive: false,
      createdAt: new Date(),
      lastModified: new Date()
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setSessionTitle('');
    setIsModalVisible(false);
    message.success('Collaboration session created!');
  };

  const inviteUser = () => {
    if (!inviteEmail.trim() || !currentSession) {
      message.error('Please enter an email address');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      isOnline: false
    };

    const updatedSession = {
      ...currentSession,
      users: [...currentSession.users, newUser],
      lastModified: new Date()
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    setInviteEmail('');
    setInviteModalVisible(false);
    message.success(`Invitation sent to ${inviteEmail}`);
  };

  const addComment = () => {
    if (!newComment.trim() || !currentSession) {
      message.error('Please enter a comment');
      return;
    }

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      content: newComment,
      slide: selectedSlide,
      timestamp: new Date(),
      resolved: false
    };

    const updatedSession = {
      ...currentSession,
      comments: [...currentSession.comments, comment],
      lastModified: new Date()
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    setNewComment('');
    setCommentModalVisible(false);
    message.success('Comment added!');
  };

  const resolveComment = (commentId: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      comments: currentSession.comments.map(c => 
        c.id === commentId ? { ...c, resolved: true } : c
      ),
      lastModified: new Date()
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    message.success('Comment resolved!');
  };

  const removeUser = (userId: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      users: currentSession.users.filter(u => u.id !== userId),
      lastModified: new Date()
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    message.success('User removed from session');
  };

  const startLiveSession = () => {
    if (!currentSession) return;

    // Simulate WebSocket connection
    try {
      wsRef.current = new WebSocket('ws://localhost:8006/ws/collaboration');
      
      wsRef.current.onopen = () => {
        message.success('Live session started!');
        const updatedSession = {
          ...currentSession,
          isLive: true,
          lastModified: new Date()
        };
        setCurrentSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
      };

      wsRef.current.onerror = () => {
        message.warning('Live session simulation - WebSocket not available');
      };
    } catch (error) {
      message.warning('Live session started in simulation mode');
      const updatedSession = {
        ...currentSession,
        isLive: true,
        lastModified: new Date()
      };
      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    }
  };

  const stopLiveSession = () => {
    if (!currentSession) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const updatedSession = {
      ...currentSession,
      isLive: false,
      lastModified: new Date()
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    message.success('Live session stopped');
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Presentation Collaboration</Title>
            <Text type="secondary">Real-time collaboration on presentations</Text>
          </Col>
          <Col>
            <Space>
              <Badge count={sessions.length} showZero>
                <Tag color="blue">Sessions</Tag>
              </Badge>
              {currentSession?.isLive && <Tag color="red">LIVE</Tag>}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Sessions" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
                block
              >
                Create Session
              </Button>

              <List
                dataSource={sessions}
                renderItem={(session) => (
                  <List.Item
                    style={{ cursor: 'pointer' }}
                    onClick={() => setCurrentSession(session)}
                    className={currentSession?.id === session.id ? 'selected-session' : ''}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<TeamOutlined />} />}
                      title={session.title}
                      description={
                        <Space>
                          <Tag color="blue">{session.users.length} users</Tag>
                          {session.isLive && <Tag color="red">LIVE</Tag>}
                          <Text type="secondary">{formatTimestamp(session.lastModified)}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {currentSession ? (
            <>
              <Card title={currentSession.title} size="small">
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <Tag color="blue">{currentSession.users.length} collaborators</Tag>
                      <Tag color="green">{currentSession.comments.filter(c => !c.resolved).length} active comments</Tag>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      {currentSession.isLive ? (
                        <Button
                          danger
                          icon={<VideoCameraOutlined />}
                          onClick={stopLiveSession}
                        >
                          Stop Live
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          icon={<VideoCameraOutlined />}
                          onClick={startLiveSession}
                        >
                          Start Live
                        </Button>
                      )}
                      <Button
                        icon={<ShareAltOutlined />}
                        onClick={() => setInviteModalVisible(true)}
                      >
                        Invite
                      </Button>
                      <Button
                        icon={<CommentOutlined />}
                        onClick={() => setCommentModalVisible(true)}
                      >
                        Add Comment
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>

              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                  <Card title="Active Collaborators" size="small">
                    <List
                      dataSource={currentSession.users}
                      renderItem={(user) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <div style={{ position: 'relative' }}>
                                <Avatar icon={<UserOutlined />} src={user.avatar} />
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: user.isOnline ? '#52c41a' : '#d9d9d9',
                                    border: '1px solid white'
                                  }}
                                />
                              </div>
                            }
                            title={
                              <Space>
                                <Text>{user.name}</Text>
                                <Tag color={user.role === 'owner' ? 'red' : user.role === 'editor' ? 'blue' : 'default'}>
                                  {user.role}
                                </Tag>
                              </Space>
                            }
                            description={
                              <Space>
                                <Text type="secondary">{user.email}</Text>
                                {user.isOnline && <Tag color="green">Online</Tag>}
                                {user.cursor && <Text type="secondary">Slide {user.cursor.slide + 1}</Text>}
                              </Space>
                            }
                          />
                          {user.role !== 'owner' && (
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeUser(user.id)}
                            />
                          )}
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="Comments" size="small">
                    <List
                      dataSource={currentSession.comments}
                      renderItem={(comment) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<MessageOutlined />} />}
                            title={
                              <Space>
                                <Text>{comment.userName}</Text>
                                <Tag color="blue">Slide {comment.slide + 1}</Tag>
                                {comment.resolved && <Tag color="green">Resolved</Tag>}
                              </Space>
                            }
                            description={
                              <div>
                                <Text>{comment.content}</Text>
                                <div style={{ marginTop: 4 }}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {formatTimestamp(comment.timestamp)}
                                  </Text>
                                  {!comment.resolved && (
                                    <Button
                                      size="small"
                                      type="link"
                                      onClick={() => resolveComment(comment.id)}
                                    >
                                      Resolve
                                    </Button>
                                  )}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <TeamOutlined style={{ fontSize: 48 }} />
                <div style={{ marginTop: 16 }}>Select a session or create a new one to start collaborating</div>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title="Create Collaboration Session"
        open={isModalVisible}
        onOk={createSession}
        onCancel={() => setIsModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Session Title:</Text>
            <Input
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter session title"
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>

      <Modal
        title="Invite Collaborator"
        open={inviteModalVisible}
        onOk={inviteUser}
        onCancel={() => setInviteModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Email Address:</Text>
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Role:</Text>
            <Select
              value={inviteRole}
              onChange={setInviteRole}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value="editor">Editor</Option>
              <Option value="viewer">Viewer</Option>
            </Select>
          </div>
        </Space>
      </Modal>

      <Modal
        title="Add Comment"
        open={commentModalVisible}
        onOk={addComment}
        onCancel={() => setCommentModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Slide:</Text>
            <Select
              value={selectedSlide}
              onChange={setSelectedSlide}
              style={{ width: '100%', marginTop: 8 }}
            >
              {[0, 1, 2, 3, 4].map(slide => (
                <Option key={slide} value={slide}>
                  Slide {slide + 1}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Text strong>Comment:</Text>
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment"
              rows={4}
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default PresentationCollaboration;
