import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Button, Space, Select, Progress, Statistic, message, Modal, Tag } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, RedoOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface Session {
  id: string;
  date: string;
  duration: number;
  type: 'pomodoro' | 'short-break' | 'long-break' | 'custom';
  completed: boolean;
}

const StudyTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'pomodoro' | 'short-break' | 'long-break' | 'custom'>('pomodoro');
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      date: '2024-01-15',
      duration: 25 * 60,
      type: 'pomodoro',
      completed: true
    }
  ]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [customDuration, setCustomDuration] = useState(25);
  const [sessionCount, setSessionCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessionDurations = {
    'pomodoro': 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60,
    'custom': customDuration * 60
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    message.success('Session completed! Great job!');
    
    const newSession: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      duration: sessionDurations[sessionType],
      type: sessionType,
      completed: true
    };
    
    setSessions(prev => [newSession, ...prev]);
    setSessionCount(prev => prev + 1);
    
    // Auto-switch to break after pomodoro
    if (sessionType === 'pomodoro') {
      const nextSession = sessionCount % 4 === 3 ? 'long-break' : 'short-break';
      setSessionType(nextSession);
      setTimeLeft(sessionDurations[nextSession]);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionDurations[sessionType]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionDurations[sessionType]);
  };

  const changeSessionType = (type: 'pomodoro' | 'short-break' | 'long-break' | 'custom') => {
    setSessionType(type);
    setTimeLeft(sessionDurations[type]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = (type: string) => {
    const colors = {
      'pomodoro': '#ff4d4f',
      'short-break': '#52c41a',
      'long-break': '#1890ff',
      'custom': '#722ed1'
    };
    return colors[type as keyof typeof colors];
  };

  const totalStudyTime = sessions
    .filter(s => s.type === 'pomodoro' && s.completed)
    .reduce((acc, s) => acc + s.duration, 0);

  const todaySessions = sessions.filter(s => s.date === new Date().toISOString().split('T')[0]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Study Timer</Title>
      
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Timer Display */}
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={1} style={{ 
              color: getSessionColor(sessionType),
              fontSize: '4rem',
              margin: 0
            }}>
              {formatTime(timeLeft)}
            </Title>
            <Text type="secondary" style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>
              {sessionType.replace('-', ' ')}
            </Text>
          </div>

          <Progress
            percent={((sessionDurations[sessionType] - timeLeft) / sessionDurations[sessionType]) * 100}
            strokeColor={getSessionColor(sessionType)}
            showInfo={false}
            style={{ margin: '24px 0' }}
          />

          <Space style={{ width: '100%', justifyContent: 'center' }}>
            {!isRunning ? (
              <Button 
                type="primary" 
                size="large" 
                icon={<PlayCircleOutlined />}
                onClick={startTimer}
              >
                Start
              </Button>
            ) : (
              <Button 
                size="large" 
                icon={<PauseCircleOutlined />}
                onClick={pauseTimer}
              >
                Pause
              </Button>
            )}
            <Button 
              size="large" 
              icon={<StopOutlined />}
              onClick={stopTimer}
            >
              Stop
            </Button>
            <Button 
              size="large" 
              icon={<RedoOutlined />}
              onClick={resetTimer}
            >
              Reset
            </Button>
            <Button 
              size="large" 
              icon={<SettingOutlined />}
              onClick={() => setSettingsModalVisible(true)}
            >
              Settings
            </Button>
          </Space>
        </Card>

        {/* Session Type Selector */}
        <Card title="Session Type">
          <Select
            value={sessionType}
            onChange={changeSessionType}
            style={{ width: '100%' }}
            size="large"
          >
            <Option value="pomodoro">🍅 Pomodoro (25 min)</Option>
            <Option value="short-break">☕ Short Break (5 min)</Option>
            <Option value="long-break">🌿 Long Break (15 min)</Option>
            <Option value="custom">⚙️ Custom ({customDuration} min)</Option>
          </Select>
        </Card>

        {/* Statistics */}
        <Card title="Today's Statistics">
          <Space wrap style={{ width: '100%', justifyContent: 'space-around' }}>
            <Statistic
              title="Sessions Completed"
              value={todaySessions.length}
              suffix="/ 8"
            />
            <Statistic
              title="Total Study Time"
              value={Math.floor(totalStudyTime / 60)}
              suffix="minutes"
            />
            <Statistic
              title="Current Streak"
              value={sessionCount}
              suffix="sessions"
            />
          </Space>
        </Card>

        {/* Recent Sessions */}
        <Card title="Recent Sessions">
          <Space direction="vertical" style={{ width: '100%' }}>
            {sessions.slice(0, 5).map(session => (
              <div key={session.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div>
                  <Text strong>{session.type.replace('-', ' ').toUpperCase()}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {session.date} • {Math.floor(session.duration / 60)} minutes
                  </Text>
                </div>
                <Tag color={session.completed ? 'green' : 'default'}>
                  {session.completed ? 'Completed' : 'Incomplete'}
                </Tag>
              </div>
            ))}
          </Space>
        </Card>
      </Space>

      {/* Settings Modal */}
      <Modal
        title="Timer Settings"
        open={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSettingsModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Custom Duration (minutes)</Text>
            <input
              type="number"
              value={customDuration}
              onChange={(e) => setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px'
              }}
              min="1"
              max="120"
              placeholder="Enter duration in minutes"
              title="Custom timer duration in minutes"
            />
          </div>
          
          <div>
            <Text strong>Timer Presets</Text>
            <Space wrap style={{ marginTop: 8 }}>
              <Button onClick={() => setCustomDuration(15)}>15 min</Button>
              <Button onClick={() => setCustomDuration(30)}>30 min</Button>
              <Button onClick={() => setCustomDuration(45)}>45 min</Button>
              <Button onClick={() => setCustomDuration(60)}>60 min</Button>
            </Space>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default StudyTimer;
