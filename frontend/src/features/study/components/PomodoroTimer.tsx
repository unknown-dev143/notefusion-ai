import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Button, 
  Input, 
  Typography, 
  Card, 
  List, 
  Space, 
  Progress, 
  Badge, 
  Modal, 
  Form, 
  InputNumber, 
  Switch, 
  Select, 
  message,
  theme as antdTheme
} from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined, 
  SettingOutlined,
  SoundOutlined,
  SoundFilled
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { useToken } = antdTheme;

/**
 * Sound file played when a timer session completes
 * @type {HTMLAudioElement}
 */
const alarmSound = new Audio('/sounds/alert.mp5');

/**
 * Default timer settings (in seconds)
 */
interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  workDuration: 25 * 60, // 25 minutes
  shortBreakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: true,
  soundEnabled: true,
  soundVolume: 0.5,
  theme: 'system'
};

type TimerState = 'idle' | 'work' | 'break' | 'longBreak';

/**
 * Represents a task in the Pomodoro timer
 * @interface Task
 * @property {string} id - Unique identifier for the task
 * @property {string} text - The task description
 * @property {boolean} completed - Whether the task is completed
 * @property {Date} createdAt - When the task was created
 */
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

/**
 * Represents the statistics of the Pomodoro timer
 * @interface TimerStats
 * @property {number} totalSessions - Total number of work sessions completed
 * @property {number} totalFocusTime - Total focus time in minutes
 * @property {number} tasksCompleted - Total number of tasks completed
 * @property {Date} lastSessionDate - Date of the last work session
 */
interface TimerStats {
  totalSessions: number;
  totalFocusTime: number;
  tasksCompleted: number;
  lastSessionDate?: Date;
}

/**
 * Formats seconds into MM:SS format
 * @param {number} seconds - Total seconds to format
 * @returns {string} Formatted time string (MM:SS)
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Pomodoro Timer Component
 * 
 * A productivity timer that implements the Pomodoro Technique, alternating between
 * focused work sessions and short breaks, with task management and session statistics.
 * 
 * @component
 * @example
 * // Basic usage
 * <PomodoroTimer />
 * 
 * @example
 * // With custom settings
 * <PomodoroTimer 
 *   workDuration={30 * 60} 
 *   shortBreakDuration={5 * 60}
 *   longBreakDuration={15 * 60}
 *   longBreakInterval={4}
 * />
 * 
 * @returns {React.ReactElement} The rendered Pomodoro Timer component
 */
const PomodoroTimer: React.FC = () => {
  // Theme and token
  const { token } = useToken();
  
  // Settings state
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    try {
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_TIMER_SETTINGS;
    } catch (e) {
      console.error('Failed to parse saved settings', e);
      return DEFAULT_TIMER_SETTINGS;
    }
  });
  
  // Timer state with persistence
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const savedState = localStorage.getItem('pomodoroState');
    return savedState ? JSON.parse(savedState).timeLeft : settings.workDuration;
  });
  
  const [isActive, setIsActive] = useState<boolean>(() => {
    const savedState = localStorage.getItem('pomodoroState');
    return savedState ? JSON.parse(savedState).isActive : false;
  });
  
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const savedState = localStorage.getItem('pomodoroState');
    return savedState ? JSON.parse(savedState).timerState : 'idle';
  });
  
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  
  // Task management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>(''); // Initialize with empty string
  
  // Session statistics
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [totalFocusTime, setTotalFocusTime] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0); // Initialize completedTasks
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const alarmSoundRef = useRef<HTMLAudioElement | null>(null); // Initialize with null
  const isInitialMount = useRef<boolean>(true);

  /**
   * Plays the alarm sound when a timer session completes
   * @returns {void}
   */
  const playSound = useCallback(() => {
    if (!soundEnabled || !alarmSoundRef.current) return;
    
    try {
      alarmSoundRef.current.volume = settings.soundVolume;
      alarmSoundRef.current.play().catch(error => {
        console.error('Error playing sound:', error);
        message.warning('Could not play sound notification');
      });
    } catch (error) {
      console.error('Error with audio playback:', error);
    }
  }, [soundEnabled, settings.soundVolume]);

  /**
   * Toggles the sound notifications on or off
   * @returns {void}
   */
  const toggleSound = useCallback(() => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    setSettings(prev => ({
      ...prev,
      soundEnabled: newSoundState
    }));
    
    message.success(`Sound ${newSoundState ? 'enabled' : 'disabled'}`);
  }, [soundEnabled]);

  /**
   * Loads the saved timer statistics from localStorage
   * @returns {TimerStats} The loaded timer statistics
   */
  const loadStats = (): TimerStats => {
    const savedStats = localStorage.getItem('pomodoroStats');
    return savedStats 
      ? JSON.parse(savedStats) 
      : { totalSessions: 0, totalFocusTime: 0, tasksCompleted: 0 };
  };
  
  /**
   * Saves the timer statistics to localStorage
   * @param {TimerStats} stats - The timer statistics to save
   * @returns {void}
   */
  const saveStats = (stats: TimerStats): void => {
    localStorage.setItem('pomodoroStats', JSON.stringify({
      ...stats,
      lastSessionDate: new Date().toISOString()
    }));
  };

  // Load saved tasks and stats on component mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('pomodoroTasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      
      const stats = loadStats();
      setSessionCount(stats.totalSessions);
      setTotalFocusTime(stats.totalFocusTime);
      setCompletedTasks(stats.tasksCompleted);
    } catch (error) {
      console.error('Failed to load Pomodoro data:', error);
      message.error('Failed to load saved data');
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const state = {
      timeLeft,
      isActive,
      timerState,
      sessionCount,
      totalFocusTime,
      tasks
    };
    
    try {
      localStorage.setItem('pomodoroState', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save timer state:', error);
      message.error('Failed to save timer state');
    }
  }, [timeLeft, isActive, timerState, sessionCount, totalFocusTime, tasks]);

  // Handle timer countdown and state transitions
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      try {
        playSound();
        
        if (timerState === 'work') {
          // Work session completed
          const newSessionCount = sessionCount + 1;
          const newFocusTime = totalFocusTime + (settings.workDuration / 60);
          
          setSessionCount(newSessionCount);
          setTotalFocusTime(newFocusTime);
          
          // Determine next break type
          const isLongBreak = newSessionCount > 0 && 
                             newSessionCount % settings.longBreakInterval === 0;
          const nextState: TimerState = isLongBreak ? 'longBreak' : 'break';
          const breakDuration = isLongBreak 
            ? settings.longBreakDuration 
            : settings.shortBreakDuration;
          
          // Update state for break
          setTimerState(nextState);
          setTimeLeft(breakDuration);
          
          // Save updated stats
          const updatedStats: TimerStats = {
            totalSessions: newSessionCount,
            totalFocusTime: newFocusTime,
            tasksCompleted: completedTasks,
            lastSessionDate: new Date()
          };
          saveStats(updatedStats);
          
          // Show appropriate message
          const breakMessage = isLongBreak 
            ? 'Great job! Time for a long break!' 
            : 'Time for a short break!';
          message.success(breakMessage, 5);
          
        } else if (timerState === 'break' || timerState === 'longBreak') {
          // Break completed, start work session
          setTimerState('work');
          setTimeLeft(settings.workDuration);
          message.info('Break time is over! Back to work!', 3);
        }
        
        // Auto-start next session
        if (timerState !== 'idle') {
          const nextTimer = setTimeout(() => {
            setIsActive(true);
          }, 1000);
          
          return () => clearTimeout(nextTimer);
        }
        
      } catch (error) {
        console.error('Timer error:', error);
        message.error('An error occurred with the timer');
        setIsActive(false);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, timerState, sessionCount, totalFocusTime, completedTasks]);

  /**
   * Saves the tasks to localStorage and updates the stats when tasks change
   * @returns {void}
   */
  useEffect(() => {
    if (!isInitialMount.current) {
      try {
        localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
        
        // Update completed tasks count
        const completed = tasks.filter(task => task.completed).length;
        setCompletedTasks(completed);
        
        // Update stats
        const stats = loadStats();
        saveStats({
          ...stats,
          tasksCompleted: completed
        });
        
      } catch (error) {
        console.error('Failed to save tasks:', error);
        message.error('Failed to save tasks');
      }
    } else {
      isInitialMount.current = false;
    }
  }, [tasks]);

  /**
   * Starts the timer
   * @returns {void}
   */
  const startTimer = (): void => {
    if (timerState === 'idle') {
      setTimerState('work');
      setTimeLeft(settings.workDuration);
    }
    setIsActive(true);
  };

  /**
   * Pauses the timer
   * @returns {void}
   */
  const pauseTimer = (): void => {
    setIsActive(false);
  };

  /**
   * Resets the timer to its initial state
   * @returns {void}
   */
  const resetTimer = (): void => {
    setIsActive(false);
    setTimerState('idle');
    setTimeLeft(settings.workDuration);
  };

  /**
   * Adds a new task to the task list
   * @returns {void}
   */
  const addTask = (): void => {
    const taskText = newTask.trim();
    if (taskText) {
      const newTaskItem: Task = { 
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        createdAt: new Date()
      };
      
      setTasks(prevTasks => [...prevTasks, newTaskItem]);
      setNewTask('');
      message.success('Task added!', 2);
    }
  };

  /**
   * Toggles the completion status of a task
   * @param {string} taskId - The ID of the task to toggle
   * @returns {void}
   */
  const toggleTask = (taskId: string): void => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );
  };
  
  /**
   * Delete a task
   * @param taskId - ID of the task to delete
   */
  const deleteTask = (taskId: string): void => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    message.info('Task removed', 2);
  };
  
  /**
   * Handle keyboard events for adding tasks
   * @param e - Keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  /**
   * Calculate progress percentage for the progress circle
   */
  const getProgressPercent = (): number => {
    let totalDuration: number;
    
    switch (timerState) {
      case 'work':
        totalDuration = settings.workDuration;
        break;
      case 'break':
        totalDuration = settings.shortBreakDuration;
        break;
      case 'longBreak':
        totalDuration = settings.longBreakDuration;
        break;
      default:
        return 0;
    }
    
    return Math.min(100, ((totalDuration - timeLeft) / totalDuration) * 100);
  };

  /**
   * Get status text based on current timer state
   */
  const getStatusText = (): string => {
    switch (timerState) {
      case 'work':
        return 'Focus Time';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Ready to Focus';
    }
  };

  /**
   * Get color based on current timer state
   */
  const getStatusColor = (): string => {
    switch (timerState) {
      case 'work':
        return '#ff4d4f'; // Red for focus
      case 'break':
        return '#52c41a'; // Green for short break
      case 'longBreak':
        return '#722ed1'; // Purple for long break
      default:
        return '#1890ff'; // Blue for idle
    }
  };

  // Settings modal
  const showSettingsModal = () => {
    setShowSettings(true);
  };

  const handleSettingsSubmit = (values: Partial<TimerSettings>) => {
    const newSettings = {
      ...settings,
      ...values
    };
    setSettings(newSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
    setShowSettings(false);
    message.success('Settings saved');
  };

  const resetSettings = () => {
    setSettings(DEFAULT_TIMER_SETTINGS);
    localStorage.setItem('pomodoroSettings', JSON.stringify(DEFAULT_TIMER_SETTINGS));
    message.success('Settings reset to defaults');
  };

  return (
    <div 
      className="pomodoro-timer" 
      style={{
        '--primary-color': isDarkMode ? '#722ed1' : '#1890ff',
        '--success-color': isDarkMode ? '#52c41a' : '#52c41a',
        '--error-color': isDarkMode ? '#ff4d4f' : '#ff4d4f',
        '--text-color': isDarkMode ? '#fff' : '#000',
        '--bg-color': isDarkMode ? '#141414' : '#fff',
        '--card-bg': isDarkMode ? '#1f1f1f' : '#f5f5f5',
        '--border-color': isDarkMode ? '#303030' : '#d9d9d9',
      } as React.CSSProperties}
    >
      <audio 
        ref={alarmSoundRef} 
        src="/sounds/alert.mp5" 
        preload="auto" 
        aria-label="Timer completion sound"
      />
      
      <Card 
        className="timer-card"
        title={
          <div style={{ textAlign: 'center' }}>
            <Space size="middle" align="center">
              <Title 
                level={3} 
                style={{ 
                  margin: 0, 
                  color: getStatusColor(),
                  transition: 'color 0.3s ease'
                }}
                aria-live="polite"
                aria-atomic="true"
              >
                {getStatusText()}
              </Title>
              <Button 
                type="text" 
                icon={soundEnabled ? <SoundFilled /> : <SoundOutlined />} 
                onClick={toggleSound}
                aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              />
              <Button 
                type="text" 
                icon={<SettingOutlined />} 
                onClick={showSettingsModal}
                aria-label="Settings"
              />
            </Space>
            <Text type="secondary" aria-live="polite">
              Session {sessionCount + 1}
            </Text>
          </div>
        }
        headStyle={{
          borderBottom: `1px solid ${isDarkMode ? '#303030' : '#d9d9d9'}`,
          backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
        }}
        bodyStyle={{
          backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div 
            style={{ 
              fontSize: '4rem', 
              fontWeight: 'bold', 
              margin: '20px 0',
              fontVariantNumeric: 'tabular-nums',
              transition: 'color 0.3s ease',
              color: isDarkMode ? '#fff' : '#000'
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {formatTime(timeLeft)}
          </div>
          
          <Progress 
            percent={getProgressPercent()}
            type="circle"
            width={200}
            strokeColor={getStatusColor()}
            trailColor={isDarkMode ? '#303030' : '#f0f0f0'}
            format={() => formatTime(timeLeft)}
            aria-valuenow={timeLeft}
            aria-valuemin={0}
            aria-valuemax={timerState === 'work' ? settings.workDuration : 
                          timerState === 'break' ? settings.shortBreakDuration : 
                          settings.longBreakDuration}
            role="progressbar"
            aria-valuetext={`${formatTime(timeLeft)} remaining`}
          />
          
          <div style={{ marginTop: 24 }}>
            <Space>
              {!isActive ? (
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<PlayCircleOutlined />} 
                  onClick={startTimer}
                  style={{ marginRight: 8 }}
                  data-testid="start-timer-button"
                  aria-label={timerState === 'idle' ? 'Start timer' : 'Resume timer'}
                >
                  {timerState === 'idle' ? 'Start' : 'Resume'}
                </Button>
              ) : (
                <Button 
                  type="default" 
                  size="large" 
                  icon={<PauseCircleOutlined />} 
                  onClick={pauseTimer}
                  style={{ marginRight: 8 }}
                  data-testid="pause-timer-button"
                  aria-label="Pause timer"
                >
                  Pause
                </Button>
              )}
              <Button 
                type="text" 
                size="large" 
                icon={<ReloadOutlined />} 
                onClick={resetTimer}
                data-testid="reset-timer-button"
                aria-label="Reset timer"
              >
                Reset
              </Button>
            </Space>
          </div>
        </div>
        
        <div className="task-section">
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <Input
              placeholder="Add a task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ marginRight: 8 }}
              data-testid="task-input"
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={addTask}
              disabled={!newTask.trim()}
              data-testid="add-task-button"
            >
              Add
            </Button>
          </div>
          
          <List
            dataSource={[...tasks].sort((a, b) => 
              a.completed === b.completed 
                ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                : a.completed ? 1 : -1
            )}
            renderItem={(task) => (
              <List.Item 
                actions={[
                  <Button 
                    type={task.completed ? 'default' : 'text'} 
                    icon={task.completed ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CheckCircleOutlined />}
                    onClick={() => toggleTask(task.id)}
                    data-testid={`task-checkbox-${task.id}`}
                  />,
                  <Button 
                    type="text" 
                    danger 
                    size="small"
                    onClick={() => deleteTask(task.id)}
                    data-testid={`delete-task-${task.id}`}
                  >
                    Delete
                  </Button>
                ]}
                className={task.completed ? 'completed-task' : ''}
                data-testid={`task-item-${task.id}`}
              >
                <Text 
                  delete={task.completed}
                  type={task.completed ? 'secondary' : undefined}
                  style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    opacity: task.completed ? 0.7 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {task.text}
                </Text>
              </List.Item>
            )}
            locale={{ emptyText: 'No tasks yet. Add one above!' }}
            data-testid="task-list"
          />
        </div>
        
        <div className="stats" style={{ marginTop: 24, textAlign: 'center' }}>
          <Space size="large" wrap>
            <Tooltip title="Completed sessions">
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }} data-testid="session-count">
                  {sessionCount}
                </div>
                <Text type="secondary">Sessions</Text>
              </div>
            </Tooltip>
            <Tooltip title="Total focused time">
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }} data-testid="focus-time">
                  {Math.round(totalFocusTime)}
                </div>
                <Text type="secondary">Minutes</Text>
              </div>
            </Tooltip>
            <Tooltip title="Tasks completed">
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }} data-testid="tasks-completed">
                  {tasks.filter(t => t.completed).length}/{tasks.length || 1}
                </div>
                <Text type="secondary">Tasks</Text>
              </div>
            </Tooltip>
          </Space>
        </div>
      </Card>
      
      {/* Settings Modal */}
      <Modal
        title="Timer Settings"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        footer={[
          <Button key="reset" onClick={resetSettings}>
            Reset to Defaults
          </Button>,
          <Button key="cancel" onClick={() => setShowSettings(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            form.validateFields().then(values => {
              handleSettingsSave(values);
            });
          }}>
            Save Settings
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={settings}
          onFinish={handleSettingsSave}
        >
          <Form.Item
            label="Work Duration (minutes)"
            name="workDuration"
            rules={[{ required: true, message: 'Please input work duration' }]}
          >
            <InputNumber min={1} max={120} step={1} />
          </Form.Item>
          
          <Form.Item
            label="Short Break Duration (minutes)"
            name="shortBreakDuration"
            rules={[{ required: true, message: 'Please input short break duration' }]}
          >
            <InputNumber min={1} max={30} step={1} />
          </Form.Item>
          
          <Form.Item
            label="Long Break Duration (minutes)"
            name="longBreakDuration"
            rules={[{ required: true, message: 'Please input long break duration' }]}
          >
            <InputNumber min={1} max={60} step={1} />
          </Form.Item>
          
          <Form.Item
            label="Long Break Interval"
            name="longBreakInterval"
            tooltip="Number of work sessions before a long break"
          >
            <InputNumber min={1} max={10} step={1} />
          </Form.Item>
          
          <Form.Item
            name="autoStartBreaks"
            valuePropName="checked"
            label="Auto-start breaks"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="autoStartPomodoros"
            valuePropName="checked"
            label="Auto-start work sessions"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="soundEnabled"
            valuePropName="checked"
            label="Enable sound notifications"
          >
            <Switch />
          </Form.Item>
          
          {settings.soundEnabled && (
            <Form.Item
              name="soundVolume"
              label="Sound Volume"
              tooltip="Adjust the volume of the timer notification sound"
            >
              <InputNumber 
                min={0.1} 
                max={1} 
                step={0.1} 
                style={{ width: '100%' }} 
              />
            </Form.Item>
          )}
          
          <Form.Item
            name="theme"
            label="Theme"
          >
            <Select>
              <Select.Option value="system">System Default</Select.Option>
              <Select.Option value="light">Light</Select.Option>
              <Select.Option value="dark">Dark</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      <style jsx global>{`
        .pomodoro-timer {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          color: var(--text-color);
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        .timer-card {
          margin-bottom: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
        }
        
        .task-section {
          margin-top: 24px;
        }
        
        .completed-task {
          opacity: 0.6;
        }
        
        .ant-card-head-title {
          text-align: center;
        }
        
        @media (max-width: 480px) {
          .pomodoro-timer {
            padding: 10px;
          }
          
          .timer-card {
            margin-bottom: 10px;
          }
          
          .ant-progress-circle {
            width: 180px !important;
            height: 180px !important;
          }
        }
      `}</style>
            }
            
            .timer-card .ant-card-body {
              padding: 16px !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default PomodoroTimer;
