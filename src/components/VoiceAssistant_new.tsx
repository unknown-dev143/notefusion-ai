import { useState } from 'react';
import { Card, Input, Button, Typography, Space, List, Avatar } from 'antd';
import { RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const VoiceAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I am your AI assistant. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you said: "${userMessage.content}". This is a simulated response. How can I assist you further?`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ padding: 24, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <RobotOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>AI Assistant</Title>
        </Space>
      </Card>

      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          <List
            dataSource={messages}
            renderItem={(message) => (
              <List.Item style={{ border: 'none', padding: '8px 0' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                  }}>
                    <Avatar
                      icon={message.type === 'assistant' ? <RobotOutlined /> : <UserOutlined />}
                      style={{
                        backgroundColor: message.type === 'assistant' ? '#1890ff' : '#52c41a',
                        flexShrink: 0
                      }}
                    />
                    <div>
                      <div style={{
                        backgroundColor: message.type === 'assistant' ? '#f0f0f0' : '#1890ff',
                        color: message.type === 'assistant' ? '#000' : '#fff',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        wordBreak: 'break-word'
                      }}>
                        <Text style={{ color: 'inherit' }}>{message.content}</Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                        {message.timestamp.toLocaleTimeString()}
                      </Text>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ flex: 1 }}
              disabled={isLoading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              loading={isLoading}
              style={{ height: 'auto' }}
            >
              Send
            </Button>
          </Space.Compact>
        </div>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
