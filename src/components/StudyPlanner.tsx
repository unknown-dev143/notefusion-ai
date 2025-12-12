import React, { useState } from 'react';
import { Card, Typography, Button, Space, Modal, Input, Select, Progress, Tag, List, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, ClockCircleOutlined, BookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface StudyPlan {
  id: string;
  title: string;
  subject: string;
  startDate: string;
  endDate: string;
  goals: string[];
  dailyHours: number;
  progress: number;
  status: 'active' | 'completed' | 'paused';
}

interface StudySession {
  id: string;
  planId: string;
  date: string;
  topic: string;
  duration: number;
  completed: boolean;
}

const StudyPlanner: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([
    {
      id: '1',
      title: 'Calculus Mastery',
      subject: 'Mathematics',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      goals: ['Complete derivatives', 'Master integrals', 'Practice problems'],
      dailyHours: 2,
      progress: 45,
      status: 'active'
    },
    {
      id: '2',
      title: 'Physics Fundamentals',
      subject: 'Physics',
      startDate: '2024-01-10',
      endDate: '2024-01-30',
      goals: ['Understand mechanics', 'Learn thermodynamics'],
      dailyHours: 1.5,
      progress: 70,
      status: 'active'
    }
  ]);

  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: '1',
      planId: '1',
      date: '2024-01-16',
      topic: 'Derivatives Practice',
      duration: 120,
      completed: true
    },
    {
      id: '2',
      planId: '1',
      date: '2024-01-17',
      topic: 'Integration Basics',
      duration: 90,
      completed: false
    }
  ]);

  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);

  const [planForm, setPlanForm] = useState({
    title: '',
    subject: '',
    startDate: '',
    endDate: '',
    goals: [] as string[],
    dailyHours: 2
  });

  const [sessionForm, setSessionForm] = useState({
    date: '',
    topic: '',
    duration: 60
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature'];

  const createPlan = () => {
    if (!planForm.title || !planForm.subject || !planForm.startDate || !planForm.endDate) {
      message.error('Please fill all required fields');
      return;
    }

    const newPlan: StudyPlan = {
      id: Date.now().toString(),
      title: planForm.title,
      subject: planForm.subject,
      startDate: planForm.startDate,
      endDate: planForm.endDate,
      goals: planForm.goals,
      dailyHours: planForm.dailyHours,
      progress: 0,
      status: 'active'
    };

    setPlans(prev => [...prev, newPlan]);
    message.success('Study plan created successfully!');
    resetPlanForm();
  };

  const createSession = () => {
    if (!selectedPlan || !sessionForm.date || !sessionForm.topic) {
      message.error('Please fill all required fields');
      return;
    }

    const newSession: StudySession = {
      id: Date.now().toString(),
      planId: selectedPlan.id,
      date: sessionForm.date,
      topic: sessionForm.topic,
      duration: sessionForm.duration,
      completed: false
    };

    setSessions(prev => [...prev, newSession]);
    message.success('Study session scheduled successfully!');
    resetSessionForm();
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== id));
    setSessions(prev => prev.filter(session => session.planId !== id));
    message.success('Study plan deleted successfully!');
  };

  const toggleSessionComplete = (sessionId: string) => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId ? { ...session, completed: !session.completed } : session
    ));
  };

  const resetPlanForm = () => {
    setPlanForm({
      title: '',
      subject: '',
      startDate: '',
      endDate: '',
      goals: [],
      dailyHours: 2
    });
    setPlanModalVisible(false);
  };

  const resetSessionForm = () => {
    setSessionForm({
      date: '',
      topic: '',
      duration: 60
    });
    setSessionModalVisible(false);
    setSelectedPlan(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'green',
      'completed': 'blue',
      'paused': 'orange'
    };
    return colors[status as keyof typeof colors];
  };

  const getPlanSessions = (planId: string) => {
    return sessions.filter(session => session.planId === planId);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Study Planner</Title>
      
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card
          title="Study Plans"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setPlanModalVisible(true)}>
              Create Plan
            </Button>
          }
        >
          <List
            dataSource={plans}
            renderItem={(plan) => (
              <List.Item
                actions={[
                  <Button key="session" icon={<CalendarOutlined />} onClick={() => {
                    setSelectedPlan(plan);
                    setSessionModalVisible(true);
                  }}>
                    Add Session
                  </Button>,
                  <Button key="edit" icon={<EditOutlined />} type="link">Edit</Button>,
                  <Button key="delete" icon={<DeleteOutlined />} type="link" danger onClick={() => deletePlan(plan.id)}>
                    Delete
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      {plan.title}
                      <Tag color={getStatusColor(plan.status)}>
                        {plan.status}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Space wrap>
                        <Tag icon={<BookOutlined />}>{plan.subject}</Tag>
                        <Tag icon={<ClockCircleOutlined />}>{plan.dailyHours}h/day</Tag>
                      </Space>
                      <br />
                      <Text type="secondary">
                        {plan.startDate} - {plan.endDate}
                      </Text>
                      <br />
                      <Progress percent={plan.progress} size="small" style={{ marginTop: 8, maxWidth: 300 }} />
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {getPlanSessions(plan.id).length} sessions scheduled
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <Card title="Upcoming Study Sessions">
          <List
            dataSource={sessions
              .filter(session => !session.completed)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)}
            renderItem={(session) => {
              const plan = plans.find(p => p.id === session.planId);
              return (
                <List.Item
                  actions={[
                    <Button
                      key="complete"
                      type={session.completed ? 'default' : 'primary'}
                      onClick={() => toggleSessionComplete(session.id)}
                    >
                      {session.completed ? 'Completed' : 'Mark Complete'}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={session.topic}
                    description={
                      <div>
                        <Text>{plan?.title}</Text>
                        <br />
                        <Text type="secondary">
                          {session.date} • {session.duration} minutes
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      </Space>

      <Modal
        title="Create Study Plan"
        open={planModalVisible}
        onOk={createPlan}
        onCancel={resetPlanForm}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Plan Title</Text>
            <Input
              value={planForm.title}
              onChange={(e) => setPlanForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter plan title"
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text strong>Subject</Text>
              <Select
                value={planForm.subject}
                onChange={(value) => setPlanForm(prev => ({ ...prev, subject: value }))}
                style={{ width: '100%', marginTop: 4 }}
              >
                {subjects.map(subject => (
                  <Option key={subject} value={subject}>
                    {subject}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ flex: 1 }}>
              <Text strong>Daily Hours</Text>
              <Input
                type="number"
                value={planForm.dailyHours}
                onChange={(e) => setPlanForm(prev => ({ ...prev, dailyHours: parseInt(e.target.value) || 1 }))}
                min={0.5}
                max={8}
                step={0.5}
                style={{ marginTop: 4 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text strong>Start Date</Text>
              <Input
                type="date"
                value={planForm.startDate}
                onChange={(e) => setPlanForm(prev => ({ ...prev, startDate: e.target.value }))}
                style={{ marginTop: 4 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <Text strong>End Date</Text>
              <Input
                type="date"
                value={planForm.endDate}
                onChange={(e) => setPlanForm(prev => ({ ...prev, endDate: e.target.value }))}
                style={{ marginTop: 4 }}
              />
            </div>
          </div>
        </Space>
      </Modal>

      <Modal
        title="Add Study Session"
        open={sessionModalVisible}
        onOk={createSession}
        onCancel={resetSessionForm}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Plan</Text>
            <Input value={selectedPlan?.title} disabled style={{ marginTop: 4 }} />
          </div>

          <div>
            <Text strong>Topic</Text>
            <Input
              value={sessionForm.topic}
              onChange={(e) => setSessionForm(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Enter session topic"
              style={{ marginTop: 4 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text strong>Date</Text>
              <Input
                type="date"
                value={sessionForm.date}
                onChange={(e) => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                style={{ marginTop: 4 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <Text strong>Duration (minutes)</Text>
              <Input
                type="number"
                value={sessionForm.duration}
                onChange={(e) => setSessionForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                min={15}
                max={240}
                step={15}
                style={{ marginTop: 4 }}
              />
            </div>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default StudyPlanner;
