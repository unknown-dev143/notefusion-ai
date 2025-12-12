import React, { useState, useEffect, useRef } from 'react';
import { Card, List, Avatar, Button, Input, message, Badge, Space, Typography, Divider, Modal } from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  EyeOutlined, 
  CommentOutlined, 
  TeamOutlined,
  VideoCameraOutlined,
  ShareAltOutlined,
  SyncOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import './Collaboration.css';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  cursor?: { x: number; y: number };
  selection?: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
}

interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  collaborators: User[];
  comments: Comment[];
}

const Collaboration: React.FC = () => {
  const [document, setDocument] = useState<Document>({
    id: 'doc-1',
    title: 'Study Notes - Machine Learning',
    content: '# Machine Learning Fundamentals\n\n## Introduction\nMachine learning is a subset of artificial intelligence...',
    lastModified: new Date(),
    collaborators: [
      { id: '1', name: 'John Doe', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
      { id: '2', name: 'Jane Smith', status: 'online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
      { id: '3', name: 'Bob Wilson', status: 'away', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' }
    ],
    comments: []
  });

  const [activeUsers, setActiveUsers] = useState<User[]>(document.collaborators);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [liveChanges, setLiveChanges] = useState<string[]>([]);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Simulate real-time collaboration
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate cursor movements
      setActiveUsers(prev => prev.map(user => ({
        ...user,
        cursor: {
          x: Math.random() * 100,
          y: Math.random() * 100
        }
      })));

      // Simulate live changes
      const randomUser = document.collaborators[Math.floor(Math.random() * document.collaborators.length)];
      const changes = [
        `${randomUser.name} is viewing the document`,
        `${randomUser.name} made an edit`,
        `${randomUser.name} added a comment`
      ];
      
      setLiveChanges(prev => [changes[Math.floor(Math.random() * changes.length)], ...prev.slice(0, 4)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [document.collaborators]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setDocument(prev => ({
      ...prev,
      content: newContent,
      lastModified: new Date()
    }));

    // Simulate broadcasting change to other users
    message.info('Changes saved and shared with collaborators');
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      content: newComment,
      timestamp: new Date(),
      resolved: false
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    message.success('Comment added');
  };

  const shareDocument = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Document link copied to clipboard!');
  };

  const startVideoCall = () => {
    setShowVideoCall(true);
    message.info('Video call feature would integrate with WebRTC');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'away': return '#faad14';
      case 'offline': return '#8c8c8c';
      default: return '#8c8c8c';
    }
  };

  return (
    <div className="collaboration-container">
      <div className="collaboration-header">
        <Title level={3}>{document.title}</Title>
        <Space>
          <Badge count={activeUsers.filter(u => u.status === 'online').length} showZero>
            <Button icon={<TeamOutlined />}>
              {activeUsers.length} Collaborators
            </Button>
          </Badge>
          <Button icon={<VideoCameraOutlined />} onClick={startVideoCall}>
            Video Call
          </Button>
          <Button icon={<ShareAltOutlined />} onClick={shareDocument}>
            Share
          </Button>
          <Button icon={<SyncOutlined />} loading={isEditing}>
            {isEditing ? 'Syncing...' : 'Sync'}
          </Button>
        </Space>
      </div>

      <div className="collaboration-content">
        <div className="editor-section">
          <Card title="Document Editor" className="editor-card">
            <div className="editor-toolbar">
              <Space>
                <Button 
                  icon={<EditOutlined />} 
                  type={isEditing ? 'primary' : 'default'}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Editing' : 'Edit'}
                </Button>
                <Button icon={<EyeOutlined />}>
                  Preview
                </Button>
              </Space>
            </div>
            
            <TextArea
              ref={editorRef}
              value={document.content}
              onChange={handleContentChange}
              disabled={!isEditing}
              placeholder="Start typing to collaborate..."
              className="collaboration-editor"
              rows={20}
            />

            <div className="live-activity">
              <Text type="secondary">
                <ClockCircleOutlined /> Last modified: {document.lastModified.toLocaleTimeString()}
              </Text>
            </div>
          </Card>

          {/* Live Changes Feed */}
          <Card title="Live Activity" size="small" className="live-changes-card">
            <List
              size="small"
              dataSource={liveChanges}
              renderItem={(change, index) => (
                <List.Item key={index}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {change}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </div>

        <div className="sidebar">
          {/* Active Collaborators */}
          <Card title="Active Collaborators" className="collaborators-card">
            <List
              dataSource={activeUsers}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{ position: 'relative' }}>
                        <Avatar src={user.avatar} icon={<UserOutlined />} />
                        <div 
                          className="status-indicator"
                          style={{ backgroundColor: getStatusColor(user.status) }}
                        />
                      </div>
                    }
                    title={user.name}
                    description={
                      <Space>
                        <Text type="secondary" style={{ textTransform: 'capitalize' }}>
                          {user.status}
                        </Text>
                        {user.cursor && (
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            Active
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Comments Section */}
          <Card title="Comments" className="comments-card">
            <div className="comment-input">
              <TextArea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <Button 
                type="primary" 
                icon={<CommentOutlined />}
                onClick={addComment}
                style={{ marginTop: 8 }}
              >
                Add Comment
              </Button>
            </div>

            <Divider />

            <List
              dataSource={comments}
              renderItem={(comment) => (
                <List.Item key={comment.id}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <Text strong>{comment.userName}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {comment.timestamp.toLocaleTimeString()}
                        </Text>
                      </Space>
                    }
                    description={comment.content}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>

      {/* Video Call Modal */}
      <Modal
        title="Video Call"
        open={showVideoCall}
        onCancel={() => setShowVideoCall(false)}
        footer={[
          <Button key="end" onClick={() => setShowVideoCall(false)}>
            End Call
          </Button>
        ]}
        width={800}
      >
        <div className="video-call-placeholder">
          <VideoCameraOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={4}>Video Call Feature</Title>
          <Text>
            This would integrate with WebRTC for real-time video collaboration.
            Multiple participants could join and share screens.
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default Collaboration;
