import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  List,
  Tag,
  Progress,
  Switch,
  Input,
  message,
  Row,
  Col,
  Divider,
  Badge,
  Statistic,
  Avatar,
  FloatButton,
  Drawer,
  Modal,
} from 'antd';
import './RobotAssistant.css';
import {
  RobotOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  MessageOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// Animated Robot Face Component
const RobotFace: React.FC = () => (
  <div className="robot-face">
    <div className="robot-eyes">
      <div className="robot-eye"></div>
      <div className="robot-eye"></div>
    </div>
    <div className="robot-mouth"></div>
  </div>
);

interface RobotTask {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  category: string;
  startTime?: string;
  endTime?: string;
  result?: any;
}

interface RobotCapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  category: 'analysis' | 'automation' | 'security' | 'optimization';
}

const RobotAssistant: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState<RobotTask[]>([]);
  const [currentTask, setCurrentTask] = useState<RobotTask | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [capabilities, setCapabilities] = useState<RobotCapability[]>([
    {
      id: 'code-analysis',
      name: 'Code Analysis',
      description: 'Analyze code quality and suggest improvements',
      icon: <CodeOutlined />,
      enabled: true,
      category: 'analysis',
    },
    {
      id: 'data-mining',
      name: 'Data Mining',
      description: 'Extract insights from your notes and data',
      icon: <DatabaseOutlined />,
      enabled: true,
      category: 'analysis',
    },
    {
      id: 'task-automation',
      name: 'Task Automation',
      description: 'Automate repetitive tasks and workflows',
      icon: <ApiOutlined />,
      enabled: true,
      category: 'automation',
    },
    {
      id: 'security-scan',
      name: 'Security Scan',
      description: 'Scan for security vulnerabilities and issues',
      icon: <SecurityScanOutlined />,
      enabled: false,
      category: 'security',
    },
    {
      id: 'performance-opt',
      name: 'Performance Optimization',
      description: 'Optimize application performance',
      icon: <ThunderboltOutlined />,
      enabled: true,
      category: 'optimization',
    },
    {
      id: 'smart-suggestions',
      name: 'Smart Suggestions',
      description: 'Provide intelligent suggestions based on context',
      icon: <ThunderboltOutlined />,
      enabled: true,
      category: 'analysis',
    },
  ]);
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string, timestamp: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{id: string, x: number, y: number}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    setChatMessages([{
      role: 'robot',
      content: 'Hello! I\'m your Robot Assistant. I can help with code analysis, automation, security scans, and more. How can I assist you today?',
      timestamp: new Date().toISOString()
    }]);

    // Create particle effects
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticles = prev.filter(p => Date.now() - parseInt(p.id) < 3000);
        if (newParticles.length < 5) {
          newParticles.push({
            id: Date.now().toString(),
            x: Math.random() * 100,
            y: Math.random() * 100
          });
        }
        return newParticles;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Voice Assistant Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;

        if (event.results[current].isFinal) {
          processVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        message.error('Voice recognition error. Please try again.');
      };

      recognitionRef.current = recognition;
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      synthRef.current.speak(utterance);
    }
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Process voice commands
    if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      const response = "Hello! I'm your Robot Assistant. How can I help you?";
      speak(response);
      addChatMessage('user', command);
      addChatMessage('robot', response);
    } else if (lowerCommand.includes('analyze code')) {
      executeTask('code-analysis');
      speak('Starting code analysis...');
    } else if (lowerCommand.includes('security scan')) {
      executeTask('security-scan');
      speak('Running security scan...');
    } else if (lowerCommand.includes('status')) {
      const response = `I am ${isOnline ? 'online and ready' : 'offline'}. Currently ${isProcessing ? 'processing a task' : 'idle'}.`;
      speak(response);
    } else if (lowerCommand.includes('stop listening')) {
      stopListening();
      speak('Voice recognition stopped');
    } else {
      const response = `I heard: "${command}". I'm still learning commands. You can ask me to analyze code, run security scans, or check status.`;
      speak(response);
      addChatMessage('user', command);
      addChatMessage('robot', response);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addChatMessage = (role: string, content: string) => {
    const newMessage = {
      role,
      content,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const executeTask = async (capabilityId: string) => {
    const capability = capabilities.find(c => c.id === capabilityId);
    if (!capability || !capability.enabled) return;

    const newTask: RobotTask = {
      id: Date.now().toString(),
      name: capability.name,
      description: `Executing ${capability.name}...`,
      status: 'running',
      progress: 0,
      category: capability.category,
      startTime: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);
    setCurrentTask(newTask);
    setIsProcessing(true);

    // Simulate task execution
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTasks(prev => prev.map(task => 
        task.id === newTask.id ? { ...task, progress } : task
      ));
    }

    // Complete the task
    const completedTask = {
      ...newTask,
      status: 'completed' as const,
      progress: 100,
      endTime: new Date().toISOString(),
      result: `${capability.name} completed successfully!`
    };

    setTasks(prev => prev.map(task => 
      task.id === newTask.id ? completedTask : task
    ));
    setCurrentTask(completedTask);
    setIsProcessing(false);

    message.success(`${capability.name} completed successfully!`);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate robot response
    setTimeout(() => {
      const robotResponse = {
        role: 'robot' as const,
        content: `I understand you want to: "${inputMessage}". Let me help you with that. I can analyze your request and provide the best assistance.`,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, robotResponse]);
    }, 1000);
  };

  const toggleCapability = (capabilityId: string) => {
    setCapabilities(prev => prev.map(cap => 
      cap.id === capabilityId ? { ...cap, enabled: !cap.enabled } : cap
    ));
  };

  const clearTasks = () => {
    setTasks([]);
    setCurrentTask(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'processing';
      case 'completed': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <SyncOutlined spin />;
      case 'completed': return <CheckCircleOutlined />;
      case 'error': return <CloseCircleOutlined />;
      default: return <PlayCircleOutlined />;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <FloatButton
        icon={<RobotOutlined />}
        className="fab-robot"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setChatVisible(true)}
        badge={{ dot: isProcessing }}
      />

      <Drawer
        title={
          <Space>
            <Avatar 
              size="large" 
              className={`robot-avatar ${isProcessing ? 'processing' : ''}`}
              icon={<RobotFace />}
            />
            <span>Robot Assistant</span>
            <Badge 
              status={isProcessing ? 'processing' : 'success'}
              text={isProcessing ? 'Processing...' : 'Online'}
            />
          </Space>
        }
        placement="right"
        onClose={() => setChatVisible(false)}
        open={chatVisible}
        width={400}
      >
        <div className="chat-container">
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <Card size="small" style={{ marginBottom: 8 }}>
                  <Text>{msg.content}</Text>
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <Input.Search
              placeholder="Ask me anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onSearch={sendMessage}
              enterButton="Send"
            />
          </div>
        </div>
      </Drawer>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="particle-container">
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <Avatar 
                size={80} 
                className={`robot-avatar ${isProcessing ? 'processing' : ''}`}
                icon={<RobotFace />}
              />
              <div className="status-indicator online">
                <Badge 
                  status={isOnline ? 'success' : 'error'}
                  text={isOnline ? 'Online' : 'Offline'}
                />
              </div>
              
              {particles.map(particle => (
                <div
                  key={particle.id}
                  className="particle"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                  }}
                />
              ))}
            </div>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic title="Tasks Completed" value={tasks.filter(t => t.status === 'completed').length} />
              <Statistic title="Capabilities Active" value={capabilities.filter(c => c.enabled).length} />
              <Button 
                type="primary" 
                icon={<MessageOutlined />}
                onClick={() => setChatVisible(true)}
                block
              >
                Chat with Robot
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Capabilities */}
        <Col xs={24} lg={16}>
          <Card title="Robot Capabilities" extra={<Button onClick={clearTasks}>Clear Tasks</Button>}>
            <Row gutter={[16, 16]}>
              {capabilities.map(capability => (
                <Col xs={24} sm={12} md={8} key={capability.id}>
                  <Card
                    size="small"
                    hoverable
                    className={`capability-card ${capability.enabled ? 'enabled' : 'disabled'}`}
                    actions={[
                      <Switch
                        key="toggle"
                        checked={capability.enabled}
                        onChange={() => toggleCapability(capability.id)}
                        size="small"
                      />,
                      <Button
                        key="execute"
                        type="primary"
                        size="small"
                        icon={<PlayCircleOutlined />}
                        onClick={() => executeTask(capability.id)}
                        disabled={!capability.enabled || isProcessing}
                      >
                        Execute
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      avatar={<Avatar icon={capability.icon} />}
                      title={capability.name}
                      description={
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {capability.description}
                          </Text>
                          <div style={{ marginTop: '4px' }}>
                            <Tag color={capability.category === 'analysis' ? 'blue' : 
                                      capability.category === 'automation' ? 'green' :
                                      capability.category === 'security' ? 'red' : 'orange'}>
                              {capability.category}
                            </Tag>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Current Task Progress */}
        {currentTask && (
          <Col xs={24}>
            <Card 
              title={
                <Space>
                  <Avatar icon={getStatusIcon(currentTask.status)} />
                  <span>Current Task: {currentTask.name}</span>
                  <Badge status={getStatusColor(currentTask.status)} text={currentTask.status} />
                </Space>
              }
            >
              <Progress 
                percent={currentTask.progress} 
                status={currentTask.status === 'running' ? 'active' : 'normal'}
                className="task-progress"
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary">{currentTask.description}</Text>
              </div>
            </Card>
          </Col>
        )}

        {/* Task History */}
        <Col xs={24}>
          <Card title="Task History">
            <List
              dataSource={tasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Badge key="status" status={getStatusColor(task.status)} text={task.status} />,
                    <Text key="progress">{task.progress}%</Text>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={getStatusIcon(task.status)} />}
                    title={task.name}
                    description={
                      <div>
                        <Text type="secondary">{task.description}</Text>
                        {task.startTime && (
                          <div style={{ marginTop: '4px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Started: {new Date(task.startTime).toLocaleTimeString()}
                            </Text>
                          </div>
                        )}
                        {task.endTime && (
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Completed: {new Date(task.endTime).toLocaleTimeString()}
                            </Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No tasks executed yet' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Chat Drawer */}
      <Drawer
        title="Robot Assistant Chat"
        placement="right"
        onClose={() => setChatVisible(false)}
        open={chatVisible}
        width={400}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflow: 'auto', marginBottom: '16px' }}>
            {chatMessages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' 
                }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: msg.role === 'user' ? '#1890ff' : '#f0f0f0',
                    color: msg.role === 'user' ? 'white' : 'black'
                  }}>
                    {msg.role === 'robot' && <RobotOutlined style={{ marginRight: '4px' }} />}
                    <Text style={{ fontSize: '12px' }}>{msg.content}</Text>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <Input.Search
            placeholder="Ask the robot assistant..."
            enterButton="Send"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onSearch={sendMessage}
          />
        </div>
      </Drawer>

      {/* Settings Modal */}
      <Modal
        title="Robot Assistant Settings"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSettingsVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Robot Status</Text>
            <div style={{ marginTop: '8px' }}>
              <Switch 
                checked={isOnline} 
                onChange={setIsOnline}
                checkedChildren="Online"
                unCheckedChildren="Offline"
              />
            </div>
          </div>
          <Divider />
          <div>
            <Text strong>Enabled Capabilities</Text>
            <div style={{ marginTop: '8px' }}>
              {capabilities.map(cap => (
                <div key={cap.id} style={{ marginBottom: '8px' }}>
                  <Switch
                    checked={cap.enabled}
                    onChange={() => toggleCapability(cap.id)}
                    checkedChildren={cap.name}
                    unCheckedChildren={cap.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default RobotAssistant;
