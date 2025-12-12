import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, Typography, Avatar, List, Badge, Input, message, Tooltip, Modal, Select, Tag } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  MessageOutlined,
  VideoCameraOutlined,
  ShareAltOutlined,
  WifiOutlined,
  DisconnectOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  cursor?: { x: number; y: number };
  currentAction?: string;
  color: string;
  permissions: 'view' | 'edit' | 'admin';
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system' | 'action';
}

interface VersionHistory {
  id: string;
  version: number;
  author: string;
  timestamp: string;
  changes: string;
  autoSave: boolean;
}

const RealTimeCollaboration: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser] = useState<CollaborativeUser>({
    id: '1',
    name: 'You',
    email: 'user@example.com',
    status: 'online',
    color: '#1890ff',
    permissions: 'admin'
  });

  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([
    {
      id: '2',
      name: 'Alice Chen',
      email: 'alice@example.com',
      status: 'online',
      cursor: { x: 150, y: 200 },
      currentAction: 'Editing paragraph 2',
      color: '#52c41a',
      permissions: 'edit'
    },
    {
      id: '3',
      name: 'Bob Smith',
      email: 'bob@example.com',
      status: 'online',
      cursor: { x: 300, y: 150 },
      currentAction: 'Adding flashcards',
      color: '#fa8c16',
      permissions: 'edit'
    },
    {
      id: '4',
      name: 'Carol Davis',
      email: 'carol@example.com',
      status: 'away',
      color: '#722ed1',
      permissions: 'view'
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Alice Chen',
      content: 'Hey everyone! I\'m working on the calculus section.',
      timestamp: '2024-01-15T10:30:00',
      type: 'text'
    },
    {
      id: '2',
      userId: '3',
      userName: 'Bob Smith',
      content: 'Great! I\'ll focus on the physics flashcards then.',
      timestamp: '2024-01-15T10:32:00',
      type: 'text'
    },
    {
      id: '3',
      userId: 'system',
      userName: 'System',
      content: 'Alice Chen joined the session',
      timestamp: '2024-01-15T10:25:00',
      type: 'system'
    }
  ]);

  const [versionHistory] = useState<VersionHistory[]>([
    {
      id: '1',
      version: 1,
      author: 'You',
      timestamp: '2024-01-15T09:00:00',
      changes: 'Initial document creation',
      autoSave: true
    },
    {
      id: '2',
      version: 2,
      author: 'Alice Chen',
      timestamp: '2024-01-15T10:15:00',
      changes: 'Added calculus formulas',
      autoSave: true
    },
    {
      id: '3',
      version: 3,
      author: 'Bob Smith',
      timestamp: '2024-01-15T10:30:00',
      changes: 'Updated physics examples',
      autoSave: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [videoCallActive, setVideoCallActive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate connection
    setTimeout(() => {
      setIsConnected(true);
      message.success('Connected to collaborative session');
    }, 1000);

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update user cursors randomly
      setActiveUsers(prev => prev.map(user => ({
        ...user,
        cursor: user.cursor ? {
          x: Math.max(0, user.cursor.x + (Math.random() - 0.5) * 50),
          y: Math.max(0, user.cursor.y + (Math.random() - 0.5) * 30)
        } : undefined
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const shareWithUser = () => {
    if (!shareEmail.trim()) {
      message.warning('Please enter an email address');
      return;
    }

    const newUser: CollaborativeUser = {
      id: Date.now().toString(),
      name: shareEmail.split('@')[0],
      email: shareEmail,
      status: 'offline',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      permissions: sharePermission
    };

    setActiveUsers(prev => [...prev, newUser]);
    setShareEmail('');
    setShowShareModal(false);
    message.success(`Invitation sent to ${shareEmail}`);

    // Add system message
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      content: `${newUser.name} has been invited to collaborate`,
      timestamp: new Date().toISOString(),
      type: 'system'
    }]);
  };

  const updateUserPermission = (userId: string, permission: 'view' | 'edit' | 'admin') => {
    setActiveUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, permissions: permission } : user
    ));
    message.success('Permissions updated');
  };

  const removeUser = (userId: string) => {
    const user = activeUsers.find(u => u.id === userId);
    setActiveUsers(prev => prev.filter(u => u.id !== userId));
    
    if (user) {
      message.success(`${user.name} removed from session`);
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        userId: 'system',
        userName: 'System',
        content: `${user.name} left the session`,
        timestamp: new Date().toISOString(),
        type: 'system'
      }]);
    }
  };

  const startVideoCall = () => {
    setVideoCallActive(true);
    message.info('Starting video call...');
  };

  const endVideoCall = () => {
    setVideoCallActive(false);
    message.info('Video call ended');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'away': return '#faad14';
      case 'offline': return '#8c8c8c';
      default: return '#8c8c8c';
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin': return 'red';
      case 'edit': return 'blue';
      case 'view': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card 
      title={
        <Space>
          <TeamOutlined />
          <span>Real-time Collaboration</span>
          <Badge 
            status={isConnected ? 'success' : 'error'} 
            text={isConnected ? 'Connected' : 'Disconnected'}
          />
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Video Call">
            <Button 
              type={videoCallActive ? 'primary' : 'default'}
              icon={<VideoCameraOutlined />}
              onClick={videoCallActive ? endVideoCall : startVideoCall}
            >
              {videoCallActive ? 'End Call' : 'Start Call'}
            </Button>
          </Tooltip>
          <Button 
            icon={<ShareAltOutlined />}
            onClick={() => setShowShareModal(true)}
          >
            Share
          </Button>
          <Button 
            type={isConnected ? 'default' : 'primary'}
            icon={isConnected ? <DisconnectOutlined /> : <WifiOutlined />}
            onClick={() => setIsConnected(!isConnected)}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </Space>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Main Content Area */}
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* Active Users */}
          <Card size="small" title={`Active Users (${activeUsers.length + 1})`}>
            <List
              dataSource={[currentUser, ...activeUsers]}
              renderItem={(user) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <div style={{ position: 'relative' }}>
                        <Avatar 
                          src={user.avatar} 
                          icon={<UserOutlined />}
                          style={{ backgroundColor: user.color }}
                        />
                        <div 
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(user.status),
                            border: '1px solid white'
                          }}
                        />
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{user.name}</Text>
                        {user.id !== currentUser.id && (
                          <Tag color={getPermissionColor(user.permissions)}>
                            {user.permissions}
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {user.currentAction || 'Idle'}
                        </Text>
                        {user.cursor && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Cursor: ({Math.round(user.cursor.x)}, {Math.round(user.cursor.y)})
                          </Text>
                        )}
                      </Space>
                    }
                  />
                  {user.id !== currentUser.id && (
                    <Space>
                      <Select
                        value={user.permissions}
                        onChange={(value) => updateUserPermission(user.id, value)}
                        size="small"
                        style={{ width: 80 }}
                      >
                        <Select.Option value="view">View</Select.Option>
                        <Select.Option value="edit">Edit</Select.Option>
                        <Select.Option value="admin">Admin</Select.Option>
                      </Select>
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => removeUser(user.id)}
                      >
                        Remove
                      </Button>
                    </Space>
                  )}
                </List.Item>
              )}
            />
          </Card>

          {/* Version History */}
          <Card size="small" title="Version History">
            <List
              dataSource={versionHistory}
              renderItem={(version) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>v{version.version}</Text>
                        <Text>{version.author}</Text>
                        {version.autoSave && (
                          <Tag color="blue">Auto-saved</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">{version.changes}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(version.timestamp).toLocaleString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Space>

        {/* Chat Panel */}
        <Card 
          size="small" 
          title="Chat" 
          extra={<MessageOutlined />}
          style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            marginBottom: 16,
            padding: '0 8px'
          }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {chatMessages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: 8 }}>
                  {msg.type === 'system' ? (
                    <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                      {msg.content}
                    </Text>
                  ) : (
                    <div>
                      <Text strong style={{ fontSize: 12, color: activeUsers.find(u => u.id === msg.userId)?.color }}>
                        {msg.userName}
                      </Text>
                      <div style={{ 
                        backgroundColor: msg.userId === currentUser.id ? '#e6f7ff' : '#f0f0f0',
                        padding: '4px 8px',
                        borderRadius: 8,
                        marginTop: 4
                      }}>
                        <Text style={{ fontSize: 12 }}>{msg.content}</Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Text>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </Space>
          </div>
          
          <Space>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onPressEnter={sendMessage}
              style={{ flex: 1 }}
            />
            <Button type="primary" onClick={sendMessage}>
              Send
            </Button>
          </Space>
        </Card>
      </div>

      {/* Share Modal */}
      <Modal
        title="Share with Collaborators"
        open={showShareModal}
        onOk={shareWithUser}
        onCancel={() => {
          setShowShareModal(false);
          setShareEmail('');
          setSharePermission('view');
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Email Address:</Text>
            <Input
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Enter email address"
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Permissions:</Text>
            <Select
              value={sharePermission}
              onChange={setSharePermission}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Select.Option value="view">Can View</Select.Option>
              <Select.Option value="edit">Can Edit</Select.Option>
            </Select>
          </div>
        </Space>
      </Modal>
    </Card>
  );
};

export default RealTimeCollaboration;
