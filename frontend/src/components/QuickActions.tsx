import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { 
  PlusOutlined, 
  RobotOutlined, 
  FileTextOutlined, 
  BookOutlined,
  CheckSquareOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: <FileTextOutlined />,
      title: 'New Note',
      description: 'Create a new note',
      onClick: () => navigate('/notes'),
      color: '#1890ff'
    },
    {
      icon: <BookOutlined />,
      title: 'Create Flashcard',
      description: 'Make a new flashcard',
      onClick: () => navigate('/flashcards'),
      color: '#52c41a'
    },
    {
      icon: <CheckSquareOutlined />,
      title: 'Add Task',
      description: 'Create a new task',
      onClick: () => navigate('/tasks'),
      color: '#fa8c16'
    },
    {
      icon: <RobotOutlined />,
      title: 'AI Assistant',
      description: 'Chat with AI',
      onClick: () => navigate('/ai-chat'),
      color: '#722ed1'
    },
    {
      icon: <BulbOutlined />,
      title: 'Study Mode',
      description: 'Focus study session',
      onClick: () => console.log('Study mode coming soon!'),
      color: '#eb2f96'
    },
    {
      icon: <PlusOutlined />,
      title: 'Quick Capture',
      description: 'Quick note capture',
      onClick: () => console.log('Quick capture coming soon!'),
      color: '#13c2c2'
    }
  ];

  return (
    <Card title="Quick Actions" style={{ margin: '1rem 0' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1rem' 
      }}>
        {actions.map((action, index) => (
          <Button
            key={index}
            size="large"
            style={{
              height: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${action.color}20`,
              backgroundColor: `${action.color}10`,
              borderRadius: '8px'
            }}
            onClick={action.onClick}
          >
            <div style={{ fontSize: '24px', color: action.color, marginBottom: '8px' }}>
              {action.icon}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {action.title}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>
                {action.description}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};
