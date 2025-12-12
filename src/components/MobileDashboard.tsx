import React, { useState, useEffect } from 'react';
import { Card, Progress, List, Avatar, Button } from 'antd';
import {
  BookOutlined,
  RobotOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
} from '@ant-design/icons';
import './MobileDashboard.css';

interface DashboardStats {
  totalNotes: number;
  aiInteractions: number;
  studyTime: number;
  achievements: number;
}

interface RecentActivity {
  id: string;
  type: 'note' | 'ai' | 'collaboration' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

const MobileDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalNotes: 42,
    aiInteractions: 128,
    studyTime: 156,
    achievements: 8,
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'note',
      title: 'Machine Learning Notes',
      description: 'Created new study notes',
      timestamp: '2 hours ago',
      icon: <BookOutlined />,
    },
    {
      id: '2',
      type: 'ai',
      title: 'AI Tutor Session',
      description: 'Completed 30-minute session',
      timestamp: '4 hours ago',
      icon: <RobotOutlined />,
    },
    {
      id: '3',
      type: 'collaboration',
      title: 'Study Group',
      description: 'Joined collaborative session',
      timestamp: '6 hours ago',
      icon: <TeamOutlined />,
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Week Streak',
      description: '7 days of consistent study',
      timestamp: '1 day ago',
      icon: <TrophyOutlined />,
    },
  ]);

  const [streak] = useState(7);
  const [weeklyProgress] = useState(65);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        studyTime: prev.studyTime + 1,
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <BookOutlined style={{ color: '#1890ff' }} />;
      case 'ai':
        return <RobotOutlined style={{ color: '#52c41a' }} />;
      case 'collaboration':
        return <TeamOutlined style={{ color: '#722ed1' }} />;
      case 'achievement':
        return <TrophyOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#666' }} />;
    }
  };

  return (
    <div className="mobile-dashboard">
      {/* Header Section */}
      <div className="mobile-dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back!</h1>
          <p>Continue your learning journey</p>
        </div>
        <div className="streak-badge">
          <FireOutlined />
          <span>{streak} days</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mobile-stats-grid">
        <Card className="mobile-stat-card notes">
          <div className="stat-content">
            <BookOutlined className="stat-icon" />
            <div className="stat-number">{stats.totalNotes}</div>
            <div className="stat-label">Notes</div>
          </div>
        </Card>

        <Card className="mobile-stat-card ai">
          <div className="stat-content">
            <RobotOutlined className="stat-icon" />
            <div className="stat-number">{stats.aiInteractions}</div>
            <div className="stat-label">AI Chats</div>
          </div>
        </Card>

        <Card className="mobile-stat-card time">
          <div className="stat-content">
            <ClockCircleOutlined className="stat-icon" />
            <div className="stat-number">{stats.studyTime}h</div>
            <div className="stat-label">Study Time</div>
          </div>
        </Card>

        <Card className="mobile-stat-card achievements">
          <div className="stat-content">
            <TrophyOutlined className="stat-icon" />
            <div className="stat-number">{stats.achievements}</div>
            <div className="stat-label">Badges</div>
          </div>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="mobile-progress-card" title="Weekly Progress">
        <div className="progress-content">
          <Progress
            percent={weeklyProgress}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            trailColor="#f0f0f0"
            strokeWidth={8}
          />
          <div className="progress-text">
            <span>{weeklyProgress}% complete</span>
            <span>5 days left</span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="mobile-actions-card" title="Quick Actions">
        <div className="quick-actions">
          <Button type="primary" icon={<BookOutlined />} size="large" block>
            New Note
          </Button>
          <Button icon={<RobotOutlined />} size="large" block>
            AI Assistant
          </Button>
          <Button icon={<TeamOutlined />} size="large" block>
            Join Study
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="mobile-activity-card" title="Recent Activity">
        <List
          dataSource={recentActivity}
          renderItem={(item) => (
            <List.Item className="activity-item">
              <List.Item.Meta
                avatar={<Avatar icon={getActivityIcon(item.type)} />}
                title={item.title}
                description={item.description}
              />
              <div className="activity-time">{item.timestamp}</div>
            </List.Item>
          )}
        />
      </Card>

      {/* AI Insights */}
      <Card className="mobile-insights-card" title="AI Insights">
        <div className="insights-content">
          <div className="insight-item">
            <ThunderboltOutlined className="insight-icon" />
            <div className="insight-text">
              <strong>Peak Performance:</strong> You're most productive at 2 PM
            </div>
          </div>
          <div className="insight-item">
            <StarOutlined className="insight-icon" />
            <div className="insight-text">
              <strong>Recommended:</strong> Review Machine Learning notes
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MobileDashboard;
