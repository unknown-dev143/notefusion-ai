import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Button, Space, List, Tag, Switch, Badge, Alert, Tooltip, Modal, Row, Col } from 'antd';
import { 
  AudioOutlined, 
  StopOutlined, 
  PlayCircleOutlined,
  SettingOutlined,
  BulbOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  category: 'navigation' | 'editing' | 'creation' | 'system';
  enabled: boolean;
  confidence: number;
  lastUsed?: string;
}

interface VoiceSettings {
  enabled: boolean;
  language: string;
  sensitivity: number;
  autoExecute: boolean;
  confirmActions: boolean;
  wakeWord: string;
}

const VoiceCommands: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    language: 'en-US',
    sensitivity: 0.7,
    autoExecute: false,
    confirmActions: true,
    wakeWord: 'Hey Fusion'
  });
  const [commands, setCommands] = useState<VoiceCommand[]>([
    {
      id: '1',
      phrase: 'Go to dashboard',
      action: 'navigate:/dashboard',
      category: 'navigation',
      enabled: true,
      confidence: 0.95,
      lastUsed: '2024-01-15 10:30'
    },
    {
      id: '2',
      phrase: 'Create new note',
      action: 'create:note',
      category: 'creation',
      enabled: true,
      confidence: 0.88
    },
    {
      id: '3',
      phrase: 'Open settings',
      action: 'navigate:/settings',
      category: 'navigation',
      enabled: true,
      confidence: 0.92
    },
    {
      id: '4',
      phrase: 'Save document',
      action: 'save:document',
      category: 'editing',
      enabled: true,
      confidence: 0.85
    },
    {
      id: '5',
      phrase: 'Start recording',
      action: 'start:recording',
      category: 'system',
      enabled: false,
      confidence: 0.78
    }
  ]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = settings.language;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        const confidence = event.results[current][0].confidence;
        
        setTranscript(transcript);
        setConfidence(confidence);
        
        // Check if transcript matches any commands
        const matchedCommand = commands.find(cmd => 
          cmd.enabled && transcript.toLowerCase().includes(cmd.phrase.toLowerCase())
        );
        
        if (matchedCommand && confidence > settings.sensitivity) {
          setLastCommand(matchedCommand);
          executeCommand(matchedCommand);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [settings.language, settings.sensitivity, commands]);

  const startListening = () => {
    if (recognitionRef.current && settings.enabled) {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
      setConfidence(0);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const executeCommand = (command: VoiceCommand) => {
    if (settings.autoExecute) {
      // Execute command immediately
      console.log('Executing:', command.action);
    } else if (settings.confirmActions) {
      // Show confirmation modal
      Modal.confirm({
        title: 'Execute Command?',
        content: `Do you want to execute: "${command.phrase}"?`,
        onOk: () => {
          console.log('Executing:', command.action);
        }
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      navigation: 'blue',
      editing: 'green',
      creation: 'orange',
      system: 'purple'
    };
    return colors[category as keyof typeof colors] || 'default';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      navigation: <EyeOutlined />,
      editing: <EditOutlined />,
      creation: <PlusOutlined />,
      system: <SettingOutlined />
    };
    return icons[category as keyof typeof icons] || <BulbOutlined />;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <Space>
          <AudioOutlined />
          Voice Commands
        </Space>
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Voice Control" extra={
            <Space>
              <Badge status={isListening ? 'processing' : 'default'} text={isListening ? 'Listening' : 'Idle'} />
              <Switch
                checked={settings.enabled}
                onChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
              />
            </Space>
          }>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Button
                  type={isListening ? 'primary' : 'primary'}
                  danger={isListening}
                  size="large"
                  icon={isListening ? <StopOutlined /> : <PlayCircleOutlined />}
                  onClick={isListening ? stopListening : startListening}
                  disabled={!settings.enabled}
                >
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </Button>
              </div>

              {transcript && (
                <Alert
                  message="Voice Input"
                  description={
                    <div>
                      <Text strong>{transcript}</Text>
                      <br />
                      <Text type="secondary">Confidence: {(confidence * 100).toFixed(1)}%</Text>
                    </div>
                  }
                  type="info"
                  showIcon
                />
              )}

              {lastCommand && (
                <Alert
                  message="Command Executed"
                  description={
                    <div>
                      <Text strong>{lastCommand.phrase}</Text>
                      <br />
                      <Text type="secondary">{lastCommand.action}</Text>
                    </div>
                  }
                  type="success"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Voice Settings">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Language</Text>
                <Text type="secondary">Select your preferred language</Text>
              </div>

              <div>
                <Text strong>Sensitivity</Text>
                <Text type="secondary">Minimum confidence level</Text>
              </div>

              <div>
                <Text strong>Wake Word</Text>
                <Text type="secondary">"{settings.wakeWord}"</Text>
              </div>

              <div>
                <Text strong>Auto Execute</Text>
                <Text type="secondary">Run commands without confirmation</Text>
              </div>

              <div>
                <Text strong>Confirm Actions</Text>
                <Text type="secondary">Show confirmation dialog</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Available Commands" style={{ marginTop: '16px' }}>
        <List
          dataSource={commands}
          renderItem={(command) => (
            <List.Item
              actions={[
                <Switch
                  checked={command.enabled}
                  onChange={(enabled) => {
                    setCommands(prev => prev.map(cmd => 
                      cmd.id === command.id ? { ...cmd, enabled } : cmd
                    ));
                  }}
                />,
                <Tooltip title="Edit">
                  <Button type="text" icon={<EditOutlined />} />
                </Tooltip>,
                <Tooltip title="Delete">
                  <Button type="text" icon={<DeleteOutlined />} danger />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                avatar={getCategoryIcon(command.category)}
                title={
                  <Space>
                    <Text strong>{command.phrase}</Text>
                    <Tag color={getCategoryColor(command.category)}>
                      {command.category}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">{command.action}</Text>
                    {command.lastUsed && (
                      <Text type="secondary">Last used: {command.lastUsed}</Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default VoiceCommands;
