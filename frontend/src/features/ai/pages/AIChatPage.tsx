import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorBoundary from '../../../components/ErrorBoundary';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const AIChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. How can I help you with your notes today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `I understand you're asking about: "${inputText}". This is a simulated response. In production, this would connect to an AI service to provide intelligent responses about your notes.`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Failed to get AI response');
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Title level={2}>Please log in to access AI Chat</Title>
      </div>
    );
  }

  return (
    <ErrorBoundary componentName="AIChatPage">
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '2rem',
        height: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Title level={2}>AI Assistant</Title>
        
        <Card 
          style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          bodyStyle={{ 
            flex: 1,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            marginBottom: '1rem',
            padding: '0.5rem'
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '1rem'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: message.sender === 'user' ? '#1890ff' : '#f0f0f0',
                    color: message.sender === 'user' ? 'white' : 'black'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    {message.sender === 'ai' ? <RobotOutlined /> : <UserOutlined />}
                    <Text strong style={{ marginLeft: '0.5rem' }}>
                      {message.sender === 'ai' ? 'AI Assistant' : 'You'}
                    </Text>
                  </div>
                  <Text>{message.text}</Text>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#f0f0f0', borderRadius: '12px' }}>
                  <RobotOutlined /> Thinking...
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything about your notes..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={isLoading}
              disabled={!inputText.trim()}
            >
              Send
            </Button>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
};
