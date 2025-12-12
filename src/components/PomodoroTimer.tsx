import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, Typography, Progress, InputNumber, Row, Col, message, Statistic, Input } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined, 
  ReloadOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined,
  BookOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Session {
  id: string;
  type: 'work' | 'break' | 'longBreak';
  duration: number;
  completedAt: string;
  tasksCompleted: number;
}

interface Task {
  id: string;
  name: string;
  completed: boolean;
  sessions: number;
}

const PomodoroTimer: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [currentSession, setCurrentSession] = useState<'work' | 'break' | 'longBreak'>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [streak, setStreak] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessionDurations = {
    work: workDuration * 60,
    break: breakDuration * 60,
    longBreak: longBreakDuration * 60
  };

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeLeft]);

  const handleSessionComplete = () => {
    const sessionType = currentSession;
    let nextSession: 'work' | 'break' | 'longBreak' = 'work';
    
    if (sessionType === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      
      if (newSessionsCompleted % 4 === 0) {
        nextSession = 'longBreak';
        setStreak(prev => prev + 1);
        message.success('Great work! Time for a long break!');
      } else {
        nextSession = 'break';
        setStreak(prev => prev + 1);
        message.success('Work session complete! Time for a short break.');
      }
      
      setTotalFocusTime(prev => prev + workDuration);
      
      const newSession: Session = {
        id: Date.now().toString(),
        type: sessionType,
        duration: workDuration,
        completedAt: new Date().toISOString(),
        tasksCompleted: tasks.filter(t => t.completed).length
      };
      setSessionHistory(prev => [newSession, ...prev.slice(0, 9)]);
      
      if (currentTask) {
        setTasks(prev => prev.map(task => 
          task.name === currentTask 
            ? { ...task, completed: true, sessions: task.sessions + 1 }
            : task
        ));
      }
    } else {
      nextSession = 'work';
      message.success('Break over! Ready to focus?');
    }
    
    setCurrentSession(nextSession);
    setTimeLeft(sessionDurations[nextSession]);
    setIsRunning(false);
    setIsPaused(false);
  };

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(sessionDurations[currentSession]);
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(sessionDurations[currentSession]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(sessionDurations[currentSession]);
    setSessionsCompleted(0);
    setStreak(0);
  };

  const skipSession = () => {
    handleSessionComplete();
  };

  const addTask = () => {
    if (currentTask.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        name: currentTask.trim(),
        completed: false,
        sessions: 0
      };
      setTasks(prev => [newTask, ...prev.slice(0, 4)]);
      setCurrentTask('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work': return '#1890ff';
      case 'break': return '#52c41a';
      case 'longBreak': return '#faad14';
      default: return '#1890ff';
    }
  };

  const progress = ((sessionDurations[currentSession] - timeLeft) / sessionDurations[currentSession]) * 100;

  return (
    <Card 
      title={
        <Space>
          <ClockCircleOutlined />
          <span>Pomodoro Timer</span>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card size="small" style={{ textAlign: 'center' }}>
          <Title level={2} style={{ color: getSessionColor(), margin: 0 }}>
            {formatTime(timeLeft)}
          </Title>
          <Text type="secondary">
            {currentSession === 'work' ? 'Focus Time' : currentSession === 'break' ? 'Short Break' : 'Long Break'}
          </Text>
          <Progress 
            percent={progress} 
            strokeColor={getSessionColor()}
            style={{ marginTop: 16 }}
            showInfo={false}
          />
        </Card>

        <Row justify="center" gutter={[8, 8]}>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={isRunning && !isPaused ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={isRunning && !isPaused ? pauseTimer : startTimer}
              disabled={timeLeft === 0 && !isRunning}
            >
              {isRunning && !isPaused ? 'Pause' : 'Start'}
            </Button>
          </Col>
          <Col>
            <Button
              size="large"
              icon={<StopOutlined />}
              onClick={stopTimer}
            >
              Stop
            </Button>
          </Col>
          <Col>
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={resetTimer}
            >
              Reset
            </Button>
          </Col>
          <Col>
            <Button
              size="large"
              onClick={skipSession}
            >
              Skip
            </Button>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Sessions"
              value={sessionsCompleted}
              prefix={<BookOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Streak"
              value={streak}
              prefix={<FireOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Focus Time"
              value={Math.floor(totalFocusTime / 60)}
              suffix="min"
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Tasks"
              value={tasks.filter(t => t.completed).length}
              prefix={<TrophyOutlined />}
            />
          </Col>
        </Row>

        <Card size="small" title="Settings">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Space direction="vertical" size="small">
                <Text strong>Work Duration</Text>
                <InputNumber
                  value={workDuration}
                  onChange={(value) => setWorkDuration(value || 25)}
                  min={1}
                  max={60}
                  suffix="min"
                  disabled={isRunning}
                />
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" size="small">
                <Text strong>Break Duration</Text>
                <InputNumber
                  value={breakDuration}
                  onChange={(value) => setBreakDuration(value || 5)}
                  min={1}
                  max={30}
                  suffix="min"
                  disabled={isRunning}
                />
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" size="small">
                <Text strong>Long Break</Text>
                <InputNumber
                  value={longBreakDuration}
                  onChange={(value) => setLongBreakDuration(value || 15)}
                  min={1}
                  max={60}
                  suffix="min"
                  disabled={isRunning}
                />
              </Space>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="Current Task">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="What are you working on?"
              style={{ flex: 1 }}
              onPressEnter={addTask}
              disabled={isRunning}
            />
            <Button type="primary" onClick={addTask} disabled={isRunning}>
              Add
            </Button>
          </Space.Compact>
        </Card>

        {tasks.length > 0 && (
          <Card size="small" title="Tasks">
            <Space direction="vertical" style={{ width: '100%' }}>
              {tasks.map(task => (
                <div key={task.id} style={{ 
                  padding: 8, 
                  backgroundColor: task.completed ? '#f6ffed' : '#fafafa',
                  borderRadius: 4,
                  border: `1px solid ${task.completed ? '#b7eb8f' : '#d9d9d9'}`
                }}>
                  <Space>
                    <Text style={{ 
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? '#52c41a' : '#000'
                    }}>
                      {task.name}
                    </Text>
                    {task.sessions > 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {task.sessions} sessions
                      </Text>
                    )}
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        )}

        {sessionHistory.length > 0 && (
          <Card size="small" title="Recent Sessions">
            <Space direction="vertical" style={{ width: '100%' }}>
              {sessionHistory.map(session => (
                <div key={session.id} style={{ 
                  padding: 8, 
                  backgroundColor: '#fafafa',
                  borderRadius: 4
                }}>
                  <Space>
                    <Text strong>
                      {session.type === 'work' ? 'Work' : session.type === 'break' ? 'Break' : 'Long Break'}
                    </Text>
                    <Text type="secondary">{session.duration}min</Text>
                    <Text type="secondary">
                      {new Date(session.completedAt).toLocaleTimeString()}
                    </Text>
                    {session.tasksCompleted > 0 && (
                      <Text type="success">{session.tasksCompleted} tasks</Text>
                    )}
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default PomodoroTimer;
