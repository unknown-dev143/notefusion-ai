import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Calendar, 
  List, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Slider, 
  Progress, 
  Tag, 
  Tooltip, 
  Row, 
  Col, 
  Divider,
  Badge,
  Alert,
  Timeline,
  Statistic
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  BookOutlined, 
  TrophyOutlined, 
  BulbOutlined, 
  AimOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface StudySession {
  id: string;
  title: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in-progress' | 'completed' | 'skipped';
  scheduledDate: string;
  scheduledTime: string;
  completedDuration?: number;
  notes?: string;
  resources: string[];
  prerequisites: string[];
  learningObjectives: string[];
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  totalSessions: number;
  completedSessions: number;
  subjects: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
}

interface StudyPlan {
  id: string;
  name: string;
  description: string;
  goals: StudyGoal[];
  sessions: StudySession[];
  totalStudyTime: number;
  completedStudyTime: number;
  averageSessionDuration: number;
  preferredStudyTimes: string[];
  breakDuration: number;
  difficultyProgression: 'linear' | 'adaptive' | 'custom';
}

interface AIRecommendation {
  type: 'session' | 'break' | 'review' | 'adjustment';
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  actionItems: string[];
}

const AIStudyPlanner: React.FC = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [form] = Form.useForm();

  // Load study plan from localStorage or API
  useEffect(() => {
    loadStudyPlan();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && currentSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentSession]);

  const loadStudyPlan = async () => {
    try {
      // In a real app, fetch from API
      const savedPlan = localStorage.getItem('studyPlan');
      if (savedPlan) {
        const plan = JSON.parse(savedPlan);
        setStudyPlan(plan);
        setSessions(plan.sessions || []);
        setGoals(plan.goals || []);
      }
    } catch (error) {
      console.error('Failed to load study plan:', error);
    }
  };

  const saveStudyPlan = async (plan: StudyPlan) => {
    try {
      localStorage.setItem('studyPlan', JSON.stringify(plan));
      setStudyPlan(plan);
      setSessions(plan.sessions);
      setGoals(plan.goals);
    } catch (error) {
      console.error('Failed to save study plan:', error);
    }
  };

  const generateAIRecommendations = useCallback(async () => {
    try {
      // Simulate AI API call
      const recommendations: AIRecommendation[] = [
        {
          type: 'session',
          title: 'Schedule Calculus Review',
          description: 'Based on your recent quiz scores, a review session would be beneficial',
          confidence: 0.85,
          reasoning: 'Quiz scores dropped 15% in calculus topics',
          actionItems: ['Schedule 45-minute review', 'Focus on derivatives', 'Practice problems']
        },
        {
          type: 'break',
          title: 'Take a Study Break',
          description: 'You\'ve been studying for 2 hours continuously',
          confidence: 0.92,
          reasoning: 'Optimal focus time is 45-90 minutes per session',
          actionItems: ['Take 15-minute break', 'Stretch or walk', 'Hydrate']
        },
        {
          type: 'review',
          title: 'Review Physics Notes',
          description: 'Review session needed for upcoming exam',
          confidence: 0.78,
          reasoning: 'Exam in 3 days, physics scores below target',
          actionItems: ['Review chapter 5-7', 'Complete practice test', 'Create summary sheet']
        }
      ];
      setAIRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    }
  }, []);

  const createStudySession = async (values: any) => {
    const session: StudySession = {
      id: `session_${Date.now()}`,
      title: values.title,
      subject: values.subject,
      topic: values.topic,
      duration: values.duration,
      difficulty: values.difficulty,
      priority: values.priority,
      status: 'planned',
      scheduledDate: values.date,
      scheduledTime: values.time,
      resources: values.resources || [],
      prerequisites: values.prerequisites || [],
      learningObjectives: values.objectives || []
    };

    const updatedPlan: StudyPlan = {
      ...studyPlan,
      sessions: [...(studyPlan?.sessions || []), session]
    };

    await saveStudyPlan(updatedPlan);
    setShowSessionModal(false);
    form.resetFields();
  };

  const createStudyGoal = async (values: any) => {
    const goal: StudyGoal = {
      id: `goal_${Date.now()}`,
      title: values.title,
      description: values.description,
      targetDate: values.targetDate,
      progress: 0,
      totalSessions: values.totalSessions,
      completedSessions: 0,
      subjects: values.subjects,
      priority: values.priority,
      status: 'active'
    };

    const updatedPlan: StudyPlan = {
      ...studyPlan,
      goals: [...(studyPlan?.goals || []), goal]
    };

    await saveStudyPlan(updatedPlan);
    setShowGoalModal(false);
    form.resetFields();
  };

  const startSession = (session: StudySession) => {
    setCurrentSession(session);
    setSessionTimer(0);
    setIsTimerRunning(true);
    
    // Update session status
    const updatedSessions = sessions.map(s => 
      s.id === session.id ? { ...s, status: 'in-progress' as const } : s
    );
    
    const updatedPlan: StudyPlan = { ...studyPlan, sessions: updatedSessions };
    saveStudyPlan(updatedPlan);
  };

  const pauseSession = () => {
    setIsTimerRunning(false);
  };

  const completeSession = () => {
    if (!currentSession) return;

    const completedSession = {
      ...currentSession,
      status: 'completed' as const,
      completedDuration: sessionTimer
    };

    const updatedSessions = sessions.map(s => 
      s.id === currentSession.id ? completedSession : s
    );

    // Update goal progress
    const updatedGoals = goals.map(goal => {
      if (goal.subjects.includes(currentSession.subject)) {
        return {
          ...goal,
          completedSessions: goal.completedSessions + 1,
          progress: ((goal.completedSessions + 1) / goal.totalSessions) * 100
        };
      }
      return goal;
    });

    const updatedPlan: StudyPlan = {
      ...studyPlan,
      sessions: updatedSessions,
      goals: updatedGoals,
      completedStudyTime: (studyPlan?.completedStudyTime || 0) + sessionTimer
    };

    saveStudyPlan(updatedPlan);
    setCurrentSession(null);
    setSessionTimer(0);
    setIsTimerRunning(false);
  };

  const skipSession = (sessionId: string) => {
    const updatedSessions = sessions.map(s => 
      s.id === sessionId ? { ...s, status: 'skipped' as const } : s
    );
    
    const updatedPlan: StudyPlan = { ...studyPlan, sessions: updatedSessions };
    saveStudyPlan(updatedPlan);
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    const updatedPlan: StudyPlan = { ...studyPlan, sessions: updatedSessions };
    saveStudyPlan(updatedPlan);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionsForDate = (date: dayjs.Dayjs): StudySession[] => {
    return sessions.filter(session => 
      dayjs(session.scheduledDate).isSame(date, 'day')
    );
  };

  const getStudyStats = () => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.completedDuration || 0), 0);
    const averageSessionLength = completedSessions > 0 ? totalMinutes / completedSessions : 0;
    
    return {
      totalSessions,
      completedSessions,
      totalMinutes,
      averageSessionLength,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
    };
  };

  const stats = getStudyStats();

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Stats Overview */}
        <Col span={24}>
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Sessions"
                  value={stats.totalSessions}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Completed"
                  value={stats.completedSessions}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Study Time"
                  value={Math.round(stats.totalMinutes / 60)}
                  suffix="hours"
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Completion Rate"
                  value={stats.completionRate}
                  precision={1}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: stats.completionRate > 70 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Current Session Timer */}
        {currentSession && (
          <Col span={24}>
            <Card title="Current Study Session" extra={
              <Space>
                {isTimerRunning ? (
                  <Button icon={<PauseCircleOutlined />} onClick={pauseSession}>
                    Pause
                  </Button>
                ) : (
                  <Button icon={<PlayCircleOutlined />} onClick={() => setIsTimerRunning(true)}>
                    Resume
                  </Button>
                )}
                <Button type="primary" onClick={completeSession}>
                  Complete
                </Button>
              </Space>
            }>
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <div>
                    <Title level={4}>{currentSession.title}</Title>
                    <Text type="secondary">{currentSession.subject} • {currentSession.topic}</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                      {formatTime(sessionTimer)}
                    </Title>
                    <Text type="secondary">of {currentSession.duration} minutes</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <Progress
                    percent={(sessionTimer / (currentSession.duration * 60)) * 100}
                    status="active"
                    strokeColor="#52c41a"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* Calendar View */}
        <Col span={16}>
          <Card 
            title="Study Calendar" 
            extra={
              <Space>
                <Button 
                  icon={<BulbOutlined />} 
                  onClick={() => {
                    generateAIRecommendations();
                    setShowAIModal(true);
                  }}
                >
                  AI Suggestions
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setShowSessionModal(true)}
                >
                  Add Session
                </Button>
              </Space>
            }
          >
            <Calendar
              value={selectedDate}
              onSelect={setSelectedDate}
              dateCellRender={(date) => {
                const daySessions = getSessionsForDate(date);
                return (
                  <div>
                    {daySessions.map(session => (
                      <Tag
                        key={session.id}
                        color={
                          session.status === 'completed' ? 'green' :
                          session.status === 'in-progress' ? 'blue' :
                          session.status === 'skipped' ? 'red' : 'default'
                        }
                        style={{ margin: '2px', fontSize: '10px' }}
                      >
                        {session.title}
                      </Tag>
                    ))}
                  </div>
                );
              }}
            />
          </Card>
        </Col>

        {/* Sessions List */}
        <Col span={8}>
          <Card 
            title="Upcoming Sessions" 
            extra={
              <Button 
                icon={<AimOutlined />} 
                onClick={() => setShowGoalModal(true)}
              >
                Goals
              </Button>
            }
          >
            <List
              dataSource={getSessionsForDate(selectedDate).sort((a, b) => 
                a.scheduledTime.localeCompare(b.scheduledTime)
              )}
              renderItem={(session) => (
                <List.Item
                  actions={[
                    session.status === 'planned' && (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => startSession(session)}
                      >
                        Start
                      </Button>
                    ),
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {/* Edit session */}}
                    />,
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteSession(session.id)}
                    />
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        status={
                          session.status === 'completed' ? 'success' :
                          session.status === 'in-progress' ? 'processing' :
                          session.status === 'skipped' ? 'error' : 'default'
                        }
                      />
                    }
                    title={
                      <Space>
                        <span>{session.title}</span>
                        <Tag color={session.priority === 'high' ? 'red' : session.priority === 'medium' ? 'orange' : 'green'}>
                          {session.priority}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">{session.subject} • {session.duration}min</Text>
                        <Text type="secondary">{session.scheduledTime}</Text>
                        {session.learningObjectives.length > 0 && (
                          <div>
                            {session.learningObjectives.slice(0, 2).map((obj, idx) => (
                              <Tag key={idx}>{obj}</Tag>
                            ))}
                          </div>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Goals Progress */}
        <Col span={24}>
          <Card title="Study Goals">
            <Row gutter={16}>
              {goals.map(goal => (
                <Col span={8} key={goal.id}>
                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Title level={5}>{goal.title}</Title>
                        <Text type="secondary">{goal.description}</Text>
                      </div>
                      <Progress
                        percent={goal.progress}
                        status={goal.status === 'completed' ? 'success' : 'active'}
                      />
                      <div>
                        <Text type="secondary">
                          {goal.completedSessions}/{goal.totalSessions} sessions
                        </Text>
                        <br />
                        <Text type="secondary">
                          Due: {dayjs(goal.targetDate).format('MMM DD, YYYY')}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Add Session Modal */}
      <Modal
        title="Add Study Session"
        open={showSessionModal}
        onCancel={() => setShowSessionModal(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={createStudySession} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="Session Title" rules={[{ required: true }]}>
                <Input placeholder="e.g., Calculus Chapter 5 Review" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
                <Select placeholder="Select subject">
                  <Option value="mathematics">Mathematics</Option>
                  <Option value="physics">Physics</Option>
                  <Option value="chemistry">Chemistry</Option>
                  <Option value="biology">Biology</Option>
                  <Option value="computer-science">Computer Science</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="topic" label="Topic" rules={[{ required: true }]}>
                <Input placeholder="e.g., Derivatives" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration" label="Duration (minutes)" rules={[{ required: true }]}>
                <Slider min={15} max={180} step={15} marks={{ 15: '15', 60: '1h', 120: '2h', 180: '3h' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="difficulty" label="Difficulty">
                <Select defaultValue="medium">
                  <Option value="easy">Easy</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="hard">Hard</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="priority" label="Priority">
                <Select defaultValue="medium">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="time" label="Time" rules={[{ required: true }]}>
            <Input type="time" />
          </Form.Item>
          <Form.Item name="objectives" label="Learning Objectives">
            <Select mode="tags" placeholder="Add learning objectives" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Goal Modal */}
      <Modal
        title="Add Study Goal"
        open={showGoalModal}
        onCancel={() => setShowGoalModal(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={createStudyGoal} layout="vertical">
          <Form.Item name="title" label="Goal Title" rules={[{ required: true }]}>
            <Input placeholder="e.g., Master Calculus" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe your goal..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="targetDate" label="Target Date" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="totalSessions" label="Total Sessions" rules={[{ required: true }]}>
                <Input type="number" min={1} placeholder="Number of sessions" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="subjects" label="Subjects" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Select subjects">
              <Option value="mathematics">Mathematics</Option>
              <Option value="physics">Physics</Option>
              <Option value="chemistry">Chemistry</Option>
              <Option value="biology">Biology</Option>
              <Option value="computer-science">Computer Science</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="Priority">
            <Select defaultValue="medium">
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI Recommendations Modal */}
      <Modal
        title="AI Study Recommendations"
        open={showAIModal}
        onCancel={() => setShowAIModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowAIModal(false)}>
            Close
          </Button>,
          <Button key="apply" type="primary">
            Apply All
          </Button>
        ]}
      >
        <Timeline>
          {aiRecommendations.map((rec, index) => (
            <Timeline.Item
              key={index}
              color={rec.type === 'break' ? 'orange' : rec.type === 'review' ? 'blue' : 'green'}
              dot={
                rec.type === 'break' ? <ExclamationCircleOutlined /> :
                rec.type === 'review' ? <BookOutlined /> :
                <BulbOutlined />
              }
            >
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Title level={5}>{rec.title}</Title>
                    <Text type="secondary">{rec.description}</Text>
                  </div>
                  <div>
                    <Text strong>Confidence: </Text>
                    <Text>{Math.round(rec.confidence * 100)}%</Text>
                  </div>
                  <div>
                    <Text strong>Reasoning: </Text>
                    <Text type="secondary">{rec.reasoning}</Text>
                  </div>
                  {rec.actionItems.length > 0 && (
                    <div>
                      <Text strong>Actions:</Text>
                      <List
                        size="small"
                        dataSource={rec.actionItems}
                        renderItem={(item) => <List.Item>{item}</List.Item>}
                      />
                    </div>
                  )}
                </Space>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </Modal>
    </div>
  );
};

export default AIStudyPlanner;
