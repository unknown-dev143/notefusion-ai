import React, { useState } from 'react';
import { Card, Typography, Button, Space, Progress, Statistic, Row, Col, Modal, Select, Input, Tag, message } from 'antd';
import { TrophyOutlined, FireOutlined, BookOutlined, AimOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface ProgressData {
  subject: string;
  totalHours: number;
  completedHours: number;
  sessionsCompleted: number;
  averageSessionLength: number;
  streak: number;
  lastActive: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedDate?: string;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  category: string;
}

const ProgressTracker: React.FC = () => {
  const [progressData] = useState<ProgressData[]>([
    {
      subject: 'Mathematics',
      totalHours: 50,
      completedHours: 32,
      sessionsCompleted: 24,
      averageSessionLength: 80,
      streak: 7,
      lastActive: '2024-01-16'
    },
    {
      subject: 'Physics',
      totalHours: 40,
      completedHours: 28,
      sessionsCompleted: 18,
      averageSessionLength: 93,
      streak: 5,
      lastActive: '2024-01-15'
    },
    {
      subject: 'Chemistry',
      totalHours: 30,
      completedHours: 12,
      sessionsCompleted: 8,
      averageSessionLength: 90,
      streak: 3,
      lastActive: '2024-01-14'
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first study session',
      icon: <BookOutlined />,
      unlocked: true,
      unlockedDate: '2024-01-10'
    },
    {
      id: '2',
      title: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      icon: <FireOutlined />,
      unlocked: true,
      unlockedDate: '2024-01-16'
    },
    {
      id: '3',
      title: 'Math Master',
      description: 'Complete 25 math sessions',
      icon: <TrophyOutlined />,
      unlocked: false
    },
    {
      id: '4',
      title: 'Time Champion',
      description: 'Study for 100 total hours',
      icon: <ClockCircleOutlined />,
      unlocked: false
    }
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Complete Calculus Course',
      target: 50,
      current: 32,
      unit: 'hours',
      deadline: '2024-02-15',
      category: 'Mathematics'
    },
    {
      id: '2',
      title: 'Read 10 Physics Chapters',
      target: 10,
      current: 6,
      unit: 'chapters',
      deadline: '2024-01-30',
      category: 'Physics'
    },
    {
      id: '3',
      title: 'Solve 100 Problems',
      target: 100,
      current: 67,
      unit: 'problems',
      deadline: '2024-02-01',
      category: 'Mathematics'
    }
  ]);

  const [selectedSubject, setSelectedSubject] = useState('all');
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: 10,
    unit: 'items',
    deadline: '',
    category: 'General'
  });

  const subjects = ['all', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

  const totalHours = progressData.reduce((acc, data) => acc + data.completedHours, 0);
  const totalSessions = progressData.reduce((acc, data) => acc + data.sessionsCompleted, 0);
  const currentStreak = Math.max(...progressData.map(data => data.streak));
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  const filteredGoals = selectedSubject === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedSubject);

  const createGoal = () => {
    if (!newGoal.title || !newGoal.deadline) {
      message.error('Please fill all required fields');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      target: newGoal.target,
      current: 0,
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      category: newGoal.category
    };

    setGoals(prev => [...prev, goal]);
    message.success('Goal created successfully!');
    setNewGoal({
      title: '',
      target: 10,
      unit: 'items',
      deadline: '',
      category: 'General'
    });
    setGoalModalVisible(false);
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, current: progress } : goal
    ));
    message.success('Goal progress updated!');
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 50) return '#1890ff';
    if (percentage >= 30) return '#faad14';
    return '#ff4d4f';
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Progress Tracker</Title>
      
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Overall Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Study Hours"
                value={totalHours}
                suffix="h"
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Sessions"
                value={totalSessions}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Current Streak"
                value={currentStreak}
                suffix="days"
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Achievements"
                value={unlockedAchievements}
                suffix={`/${achievements.length}`}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Subject Progress */}
        <Card title="Subject Progress">
          <Row gutter={[16, 16]}>
            {progressData.map((data) => (
              <Col xs={24} md={8} key={data.subject}>
                <Card size="small">
                  <Title level={5}>{data.subject}</Title>
                  <Progress
                    percent={Math.round((data.completedHours / data.totalHours) * 100)}
                    strokeColor={getProgressColor((data.completedHours / data.totalHours) * 100)}
                    format={() => `${data.completedHours}/${data.totalHours}h`}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Space wrap>
                      <Text type="secondary">{data.sessionsCompleted} sessions</Text>
                      <Text type="secondary">{data.averageSessionLength}min avg</Text>
                      <Text type="secondary">{data.streak} day streak</Text>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Goals */}
        <Card
          title="Learning Goals"
          extra={
            <Space>
              <Select
                value={selectedSubject}
                onChange={setSelectedSubject}
                style={{ width: 150 }}
              >
                {subjects.map(subject => (
                  <Option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </Option>
                ))}
              </Select>
              <Button type="primary" icon={<AimOutlined />} onClick={() => setGoalModalVisible(true)}>
                Add Goal
              </Button>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            {filteredGoals.map((goal) => {
              const percentage = Math.round((goal.current / goal.target) * 100);
              const daysLeft = getDaysUntilDeadline(goal.deadline);
              
              return (
                <Col xs={24} md={12} key={goal.id}>
                  <Card size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Title level={5}>{goal.title}</Title>
                        <Text type="secondary">{goal.category}</Text>
                        <Progress
                          percent={percentage}
                          strokeColor={getProgressColor(percentage)}
                          format={() => `${goal.current}/${goal.target} ${goal.unit}`}
                          style={{ margin: '8px 0' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Deadline: {goal.deadline}
                          </Text>
                          <Text type={daysLeft < 7 ? 'danger' : 'secondary'} style={{ fontSize: '12px' }}>
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                          </Text>
                        </div>
                      </div>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          const newProgress = Math.min(goal.current + 1, goal.target);
                          updateGoalProgress(goal.id, newProgress);
                        }}
                        disabled={goal.current >= goal.target}
                      >
                        +1
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>

        {/* Achievements */}
        <Card title="Achievements">
          <Row gutter={[16, 16]}>
            {achievements.map((achievement) => (
              <Col xs={24} sm={12} md={6} key={achievement.id}>
                <Card
                  size="small"
                  style={{
                    opacity: achievement.unlocked ? 1 : 0.5,
                    border: achievement.unlocked ? '2px solid #52c41a' : '1px solid #d9d9d9'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>
                      {achievement.icon}
                    </div>
                    <Title level={5}>{achievement.title}</Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {achievement.description}
                    </Text>
                    {achievement.unlocked && achievement.unlockedDate && (
                      <div style={{ marginTop: 8 }}>
                        <Tag color="green">Unlocked {achievement.unlockedDate}</Tag>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Space>

      <Modal
        title="Create New Goal"
        open={goalModalVisible}
        onOk={createGoal}
        onCancel={() => setGoalModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Goal Title</Text>
            <Input
              value={newGoal.title}
              onChange={(e: any) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter goal title"
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text strong>Target</Text>
              <Input
                type="number"
                value={newGoal.target}
                onChange={(e: any) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                min={1}
                style={{ marginTop: 4 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <Text strong>Unit</Text>
              <Input
                value={newGoal.unit}
                onChange={(e: any) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g., hours, chapters"
                style={{ marginTop: 4 }}
              />
            </div>
          </div>

          <div>
            <Text strong>Category</Text>
            <Select
              value={newGoal.category}
              onChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}
              style={{ width: '100%', marginTop: 4 }}
            >
              {subjects.filter(s => s !== 'all').map(subject => (
                <Option key={subject} value={subject}>
                  {subject}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text strong>Deadline</Text>
            <Input
              type="date"
              value={newGoal.deadline}
              onChange={(e: any) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
              style={{ marginTop: 4 }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ProgressTracker;
