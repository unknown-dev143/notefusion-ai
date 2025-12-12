import React, { useState, useEffect } from 'react';
import { Card, Typography, Progress, Space, Button, Row, Col, Calendar, Badge, Statistic, message } from 'antd';
import { 
  FireOutlined, 
  TrophyOutlined, 
  CalendarOutlined,
  StarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activeDates: string[];
  totalDaysActive: number;
  monthlyGoal: number;
}

const StreakTracker: React.FC = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 7,
    longestStreak: 15,
    lastActiveDate: new Date().toISOString(),
    activeDates: [],
    totalDaysActive: 45,
    monthlyGoal: 20
  });

  useEffect(() => {
    // Generate sample active dates
    const activeDates: string[] = [];
    for (let i = 0; i < 60; i++) {
      const date = dayjs().subtract(i, 'day');
      if (Math.random() > 0.3) {
        activeDates.push(date.format('YYYY-MM-DD'));
      }
    }
    setStreakData(prev => ({ ...prev, activeDates }));
  }, []);

  const markActivity = () => {
    const today = dayjs().format('YYYY-MM-DD');
    if (streakData.activeDates.includes(today)) {
      message.info('Already active today!');
      return;
    }

    const newActiveDates = [...streakData.activeDates, today];
    setStreakData(prev => ({
      ...prev,
      activeDates: newActiveDates,
      currentStreak: prev.currentStreak + 1,
      totalDaysActive: prev.totalDaysActive + 1
    }));
    message.success('Activity marked! Keep it up!');
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#ff4d4f';
    if (streak >= 14) return '#fa8c16';
    if (streak >= 7) return '#faad14';
    return '#52c41a';
  };

  const dateCellRender = (date: any) => {
    const dateStr = date.format('YYYY-MM-DD');
    const isActive = streakData.activeDates.includes(dateStr);
    
    return isActive ? (
      <Badge 
        dot 
        color={getStreakColor(streakData.currentStreak)}
        style={{ width: '100%', height: '100%' }}
      />
    ) : null;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Learning Streak</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Current Streak"
              value={streakData.currentStreak}
              suffix="days"
              prefix={<FireOutlined style={{ color: getStreakColor(streakData.currentStreak) }} />}
              valueStyle={{ color: getStreakColor(streakData.currentStreak) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Longest Streak"
              value={streakData.longestStreak}
              suffix="days"
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Active Days"
              value={streakData.totalDaysActive}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Monthly Goal"
              value={Math.round((streakData.activeDates.filter(d => 
                dayjs(d).isSame(dayjs(), 'month')
              ).length / dayjs().daysInMonth()) * 100)}
              suffix="%"
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Activity Calendar" extra={
            <Button 
              type="primary" 
              icon={<FireOutlined />}
              onClick={markActivity}
            >
              Mark Today's Activity
            </Button>
          }>
            <Calendar 
              cellRender={dateCellRender}
              fullscreen={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Streak Progress">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Monthly Progress</Text>
                <Progress 
                  percent={Math.round((streakData.activeDates.filter(d => 
                    dayjs(d).isSame(dayjs(), 'month')
                  ).length / dayjs().daysInMonth()) * 100)}
                  strokeColor="#52c41a"
                />
              </div>
              <div>
                <Text strong>Next Milestone: 30 Days</Text>
                <Progress 
                  percent={Math.min((streakData.currentStreak / 30) * 100, 100)}
                  strokeColor="#fa8c16"
                />
              </div>
              <div>
                <Text strong>Personal Best: {streakData.longestStreak} Days</Text>
                <Progress 
                  percent={Math.min((streakData.currentStreak / streakData.longestStreak) * 100, 100)}
                  strokeColor="#1890ff"
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StreakTracker;
