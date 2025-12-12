import React, { useState, useEffect, useRef } from 'react';
import { Typography, Avatar, List, Badge, Input, message, Select } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

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

const RealTimeCollaborationFixed: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const currentUser: CollaborativeUser = {
    id: '1',
    name: 'You',
    email: 'user@example.com',
    status: 'online',
    color: '#1890ff',
    permissions: 'admin'
  };

  const activeUsers: CollaborativeUser[] = [
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
    }
  ];

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Alice Chen',
      content: 'Hey everyone! I\'m working on the calculus section.',
      timestamp: '2024-01-15T10:30:00',
      type: 'text'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      setIsConnected(true);
      message.success('Connected to collaborative session');
    }, 1000);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'away': return '#faad14';
      case 'offline': return '#8c8c8c';
      default: return '#8c8c8c';
    }
  };

  
  return (
    <div style={{ padding: 16 }}>
      <Title level={4}>
        <TeamOutlined /> Real-time Collaboration
        <Badge 
          status={isConnected ? 'success' : 'error'} 
          text={isConnected ? 'Connected' : 'Disconnected'}
          style={{ marginLeft: 16 }}
        />
      </Title>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Active Users */}
        <div>
          <Title level={5}>Active Users ({activeUsers.length + 1})</Title>
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
                    <span>
                      <Text strong>{user.name}</Text>
                      {user.id !== currentUser.id && (
                        <Select
                          value={user.permissions}
                          size="small"
                          style={{ width: 80, marginLeft: 8 }}
                        >
                          <Select.Option value="view">View</Select.Option>
                          <Select.Option value="edit">Edit</Select.Option>
                          <Select.Option value="admin">Admin</Select.Option>
                        </Select>
                      )}
                    </span>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {user.currentAction || 'Idle'}
                      </Text>
                      {user.cursor && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Cursor: ({Math.round(user.cursor.x)}, {Math.round(user.cursor.y)})
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>

        {/* Chat Panel */}
        <div>
          <Title level={5}>Chat</Title>
          <div style={{ 
            height: '300px', 
            overflowY: 'auto', 
            marginBottom: 16,
            padding: '0 8px',
            border: '1px solid #d9d9d9',
            borderRadius: 8
          }}>
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
          </div>
          
          <div>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onPressEnter={sendMessage}
              style={{ marginBottom: 8 }}
            />
            <button onClick={sendMessage} style={{ width: '100%' }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeCollaborationFixed;
