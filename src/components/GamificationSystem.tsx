import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  List, 
  Avatar, 
  Button, 
  Space, 
  Typography
} from 'antd';
import { 
  TrophyOutlined, 
  StarOutlined, 
  CrownOutlined, 
  FireOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Enhanced Interfaces
interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  streak: number;
  rank: number;
  avatar?: string;
  level: number;
  badges: string[];
  achievements: Achievement[];
  lastActive: string;
  studyTime: number;
  accuracy: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'study' | 'social' | 'milestone' | 'special' | 'challenge';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  isHidden: boolean;
  prerequisites?: string[];
  rewards?: Reward[];
}

interface Reward {
  id: string;
  type: 'badge' | 'title' | 'avatar' | 'theme' | 'points' | 'feature';
  name: string;
  description: string;
  value: number | string;
  isClaimed: boolean;
  expiresAt?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  requirements: ChallengeRequirement[];
  rewards: Reward[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  participants: number;
  completedBy: string[];
  maxParticipants?: number;
  isTeamChallenge?: boolean;
  teamSize?: number;
}

interface ChallengeRequirement {
  type: 'study_minutes' | 'cards_reviewed' | 'accuracy' | 'streak' | 'notes_created' | 'social';
  target: number;
  current: number;
  description: string;
}

interface UserStats {
  userId: string;
  level: number;
  experience: number;
  experienceToNext: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  studyTime: number;
  accuracy: number;
  totalSessions: number;
  favoriteSubject: string;
  globalRank: number;
  badges: Achievement[];
  activeChallenges: Challenge[];
  completedChallenges: string[];
  lastActive: string;
}

interface LeaderboardConfig {
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'all_time';
  category: 'points' | 'streak' | 'study_time' | 'accuracy' | 'level';
  filter: 'all' | 'friends' | 'global' | 'country';
  showInactive: boolean;
  maxEntries: number;
}

interface NotificationSettings {
  achievements: boolean;
  leaderboard: boolean;
  challenges: boolean;
  rewards: boolean;
  streaks: boolean;
  milestones: boolean;
  friendActivity: boolean;
}

interface GamificationSettings {
  isEnabled: boolean;
  showLeaderboards: boolean;
  allowChallenges: boolean;
  enableRewards: boolean;
  showBadges: boolean;
  enableStreaks: boolean;
  experienceMultiplier: number;
  pointMultiplier: number;
  notifications: NotificationSettings;
}

const GamificationSystem: React.FC = () => {
  const userPoints = 1250;
  const userLevel = 5;
  const streak = 7;
  const achievements = [
    {
      id: '1',
      title: 'First Note',
      description: 'Created your first note',
      icon: <StarOutlined />,
      points: 10,
      unlocked: true,
      unlockedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Flashcard Master',
      description: 'Complete 100 flashcard reviews',
      icon: <TrophyOutlined />,
      points: 100,
      unlocked: true
    },
    {
      id: '3',
      title: 'Study Streak',
      description: 'Study for 7 days in a row',
      icon: <FireOutlined />,
      points: 50,
      unlocked: true
    },
    {
      id: '4',
      title: 'Mind Mapper',
      description: 'Create your first mind map',
      icon: <CrownOutlined />,
      points: 75,
      unlocked: false
    },
    {
      id: '5',
      title: 'Pomodoro Pro',
      description: 'Complete 25 pomodoro sessions',
      icon: <TrophyOutlined />,
      points: 150,
      unlocked: true
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    { 
      id: '1', 
      name: 'You', 
      points: userPoints, 
      streak: streak, 
      rank: 3,
      avatar: '/avatars/user.png',
      level: userLevel,
      badges: ['beginner', 'consistent'],
      achievements: [],
      lastActive: new Date().toISOString(),
      studyTime: 120,
      accuracy: 85
    },
    { 
      id: '2', 
      name: 'Alice Chen', 
      points: 2100, 
      streak: 15, 
      rank: 1,
      avatar: '/avatars/alice.png',
      level: 10,
      badges: ['expert', 'dedicated'],
      achievements: [],
      lastActive: new Date().toISOString(),
      studyTime: 450,
      accuracy: 92
    },
    { 
      id: '3', 
      name: 'Bob Smith', 
      points: 1850, 
      streak: 8, 
      rank: 2,
      avatar: '/avatars/bob.png',
      level: 9,
      badges: ['advanced', 'consistent'],
      achievements: [],
      lastActive: new Date().toISOString(),
      studyTime: 380,
      accuracy: 88
    },
    { 
      id: '4', 
      name: 'Carol Davis', 
      points: 1100, 
      streak: 5, 
      rank: 4,
      avatar: '/avatars/carol.png',
      level: 5,
      badges: ['intermediate'],
      achievements: [],
      lastActive: new Date().toISOString(),
      studyTime: 220,
      accuracy: 79
    },
    { 
      id: '5', 
      name: 'David Wilson', 
      points: 950, 
      streak: 3, 
      rank: 5,
      avatar: '/avatars/david.png',
      level: 4,
      badges: ['intermediate'],
      achievements: [],
      lastActive: new Date().toISOString(),
      studyTime: 180,
      accuracy: 75
    }
  ];

  const levelProgress = ((userPoints % 200) / 200) * 100;
  const pointsToNextLevel = 200 - (userPoints % 200);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#ffd700';
      case 2: return '#c0c0c0';
      case 3: return '#cd7f32';
      default: return '#1890ff';
    }
  };

  return (
    <Card title="Gamification & Achievements">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* User Stats */}
        <Card size="small" title="Your Progress">
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                  {userPoints}
                </Title>
                <Text type="secondary">Points</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                  Level {userLevel}
                </Title>
                <Text type="secondary">Level</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#fa8c16' }}>
                  {streak}
                </Title>
                <Text type="secondary">Day Streak</Text>
              </div>
            </Col>
          </Row>
          
          <div style={{ marginTop: 16 }}>
            <Text strong>Progress to Level {userLevel + 1}</Text>
            <Progress 
              percent={levelProgress}
              format={() => `${pointsToNextLevel} points to next level`}
            />
          </div>
        </Card>

        {/* Achievements */}
        <Card size="small" title="Achievements">
          <Row gutter={[16, 16]}>
            {achievements.map(achievement => (
              <Col span={12} key={achievement.id}>
                <div style={{
                  padding: 16,
                  backgroundColor: achievement.unlocked ? '#f6ffed' : '#fafafa',
                  borderRadius: 8,
                  border: `2px solid ${achievement.unlocked ? '#b7eb8f' : '#d9d9d9'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8, opacity: achievement.unlocked ? 1 : 0.3 }}>
                    {achievement.icon}
                  </div>
                  <Title level={5} style={{ margin: '0 0 4px 0' }}>
                    {achievement.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {achievement.description}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color={achievement.unlocked ? 'green' : 'default'}>
                      {achievement.unlocked ? `+${achievement.points} pts` : 'Locked'}
                    </Tag>
                  </div>
                  {achievement.unlockedAt && (
                    <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>
                      Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </Text>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Leaderboard */}
        <Card size="small" title="Leaderboard">
          <Space direction="vertical" style={{ width: '100%' }}>
            {leaderboard.map((entry) => (
              <div key={entry.id} style={{
                padding: 12,
                backgroundColor: entry.name === 'You' ? '#e6f7ff' : '#fafafa',
                borderRadius: 6,
                borderLeft: `4px solid ${getRankColor(entry.rank)}`
              }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space>
                      <Text strong style={{ color: getRankColor(entry.rank) }}>
                        #{entry.rank}
                      </Text>
                      <Text strong={entry.name === 'You'}>
                        {entry.name}
                      </Text>
                      {entry.name === 'You' && (
                        <Tag color="blue">You</Tag>
                      )}
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      <Text>{entry.points} pts</Text>
                      <Text type="secondary">
                        <FireOutlined /> {entry.streak}
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </div>
            ))}
          </Space>
        </Card>

        {/* Daily Challenges */}
        <Card size="small" title="Daily Challenges">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ 
              padding: 12, 
              backgroundColor: '#fff7e6',
              borderRadius: 6,
              border: '1px solid #ffd591'
            }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong>Complete 5 Flashcard Reviews</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Reward: 25 points
                  </Text>
                </Col>
                <Col>
                  <Button type="primary" size="small">
                    Start Challenge
                  </Button>
                </Col>
              </Row>
            </div>
            
            <div style={{ 
              padding: 12, 
              backgroundColor: '#f6ffed',
              borderRadius: 6,
              border: '1px solid #b7eb8f'
            }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong>Study for 30 Minutes</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Reward: 30 points
                  </Text>
                </Col>
                <Col>
                  <Button type="primary" size="small">
                    Start Challenge
                  </Button>
                </Col>
              </Row>
            </div>
          </Space>
        </Card>
      </Space>
    </Card>
  );
};

export default GamificationSystem;
