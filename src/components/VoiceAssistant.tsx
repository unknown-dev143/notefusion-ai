import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, List, Avatar, Dropdown, Badge, Tooltip, Switch, Tag } from 'antd';
import { 
  RobotOutlined, SendOutlined, UserOutlined, 
  AudioOutlined, StopOutlined, ClearOutlined,
  HistoryOutlined, SettingOutlined, BulbOutlined,
  DownloadOutlined, CopyOutlined, LikeOutlined,
  DislikeOutlined, ReloadOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const VoiceAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I am your AI assistant. How can I help you today?',
      timestamp: new Date(),
      liked: false,
      disliked: false
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
      liked: false,
      disliked: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response with better context
    setTimeout(() => {
      const responses = [
        `I understand you said: "${userMessage.content}". Let me help you with that.`,
        `That's interesting! Based on what you said about "${userMessage.content}", I suggest...`,
        `I can help you with "${userMessage.content}". Here's what I recommend...`,
        `Great question about "${userMessage.content}". Let me provide some guidance...`
      ];
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        liked: false,
        disliked: false
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        // TODO: Send audioBlob to speech-to-text service
        console.log('Audio blob created:', audioBlob.size, 'bytes');
        setInputText('Voice message recorded (speech-to-text would be processed here)');
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: Date.now().toString(),
      type: 'assistant',
      content: 'Conversation cleared. How can I help you today?',
      timestamp: new Date(),
      liked: false,
      disliked: false
    }]);
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.type === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const rateMessage = (messageId: string, rating: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          liked: rating === 'like',
          disliked: rating === 'dislike'
        };
      }
      return msg;
    }));
  };

  const regenerateResponse = (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0 && messages[messageIndex].type === 'assistant') {
      const userMessage = messages[messageIndex - 1];
      setIsLoading(true);
      
      setTimeout(() => {
        const newResponse = {
          ...messages[messageIndex],
          content: `Regenerated response to: "${userMessage.content}". Here's a different perspective...`,
          timestamp: new Date()
        };
        
        setMessages(prev => prev.map((msg, index) => 
          index === messageIndex ? newResponse : msg
        ));
        setIsLoading(false);
      }, 1000);
    }
  };

  const quickActions = [
    { key: 'summarize', label: 'Summarize last message', icon: <BulbOutlined /> },
    { key: 'explain', label: 'Explain in detail', icon: <ReloadOutlined /> },
    { key: 'translate', label: 'Translate to English', icon: <CopyOutlined /> },
    { key: 'code', label: 'Convert to code', icon: <CopyOutlined /> }
  ];

  const handleQuickAction = (action: string) => {
    setInputText(`Please ${action.toLowerCase()} the previous message.`);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ padding: 24, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <RobotOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>AI Assistant</Title>
            {isVoiceEnabled && <Badge color="green" text="Voice Enabled" />}
          </Space>
          
          <Space>
            <Tooltip title="Voice Settings">
              <Switch
                checked={isVoiceEnabled}
                onChange={setIsVoiceEnabled}
                size="small"
                checkedChildren={<AudioOutlined />}
                unCheckedChildren={<AudioOutlined />}
              />
            </Tooltip>
            
            <Dropdown
              menu={{
                items: [
                  { key: 'clear', label: 'Clear Conversation', icon: <ClearOutlined />, onClick: clearConversation },
                  { key: 'export', label: 'Export Chat', icon: <DownloadOutlined />, onClick: exportConversation },
                  { key: 'history', label: 'Chat History', icon: <HistoryOutlined /> },
                  { key: 'settings', label: 'Settings', icon: <SettingOutlined />, onClick: () => setShowSettings(!showSettings) }
                ]
              }}
              trigger={['click']}
            >
              <Button icon={<SettingOutlined />} size="small" />
            </Dropdown>
          </Space>
        </div>
      </Card>

      {showSettings && (
        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f5f5f5' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Quick Actions:</Text>
            <Space wrap>
              {quickActions.map(action => (
                <Button
                  key={action.key}
                  size="small"
                  icon={action.icon}
                  onClick={() => handleQuickAction(action.key)}
                >
                  {action.label}
                </Button>
              ))}
            </Space>
          </Space>
        </Card>
      )}

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
                    <div style={{ flex: 1 }}>
                      <div style={{
                        backgroundColor: message.type === 'assistant' ? '#f0f0f0' : '#1890ff',
                        color: message.type === 'assistant' ? '#000' : '#fff',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        wordBreak: 'break-word'
                      }}>
                        <Text style={{ color: 'inherit' }}>{message.content}</Text>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {message.timestamp.toLocaleTimeString()}
                        </Text>
                        
                        {message.type === 'assistant' && (
                          <Space size="small">
                            <Tooltip title="Copy">
                              <Button
                                type="text"
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={() => copyMessage(message.content)}
                                style={{ fontSize: 10 }}
                              />
                            </Tooltip>
                            
                            <Tooltip title="Regenerate">
                              <Button
                                type="text"
                                size="small"
                                icon={<ReloadOutlined />}
                                onClick={() => regenerateResponse(message.id)}
                                style={{ fontSize: 10 }}
                                loading={isLoading}
                              />
                            </Tooltip>
                            
                            <Tooltip title="Like">
                              <Button
                                type="text"
                                size="small"
                                icon={<LikeOutlined />}
                                onClick={() => rateMessage(message.id, 'like')}
                                style={{ 
                                  fontSize: 10, 
                                  color: message.liked ? '#1890ff' : 'inherit' 
                                }}
                              />
                            </Tooltip>
                            
                            <Tooltip title="Dislike">
                              <Button
                                type="text"
                                size="small"
                                icon={<DislikeOutlined />}
                                onClick={() => rateMessage(message.id, 'dislike')}
                                style={{ 
                                  fontSize: 10, 
                                  color: message.disliked ? '#ff4d4f' : 'inherit' 
                                }}
                              />
                            </Tooltip>
                          </Space>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <Space.Compact style={{ width: '100%' }}>
            {isVoiceEnabled && (
              <Button
                type={isRecording ? 'primary' : 'default'}
                danger={isRecording}
                icon={isRecording ? <StopOutlined /> : <AudioOutlined />}
                onClick={isRecording ? stopRecording : startRecording}
                style={{ height: 'auto' }}
              >
                {isRecording ? 'Recording...' : 'Voice'}
              </Button>
            )}
            
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isVoiceEnabled ? "Type or speak your message..." : "Type your message..."}
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
              disabled={!inputText.trim() && !isRecording}
            >
              Send
            </Button>
          </Space.Compact>
          
          {isVoiceEnabled && (
            <div style={{ marginTop: 8 }}>
              <Tag color="blue">
                <AudioOutlined /> Voice input is enabled
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Click the voice button to start recording
              </Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
