import React, { useState } from 'react';
import { Card, Typography, Button, Space, Progress, Badge, Modal, message, List, Avatar, Row, Col } from 'antd';
import { TrophyOutlined, StarOutlined, GiftOutlined, CrownOutlined, FireOutlined, RocketOutlined, HeartOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface UserLevel {
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  unlockedFeatures: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  xpReward: number;
  unlocked: boolean;
  unlockedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  target: number;
  deadline: string;
  completed: boolean;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  studyStreak: number;
  rank: number;
}

const Gamification: React.FC = () => {
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 5,
    title: 'Dedicated Learner',
    xp: 1250,
    xpToNext: 1500,
    unlockedFeatures: ['Custom Themes', 'Advanced Analytics', 'Study Groups']
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first study session',
      icon: <RocketOutlined />,
      xpReward: 10,
      unlocked: true,
      unlockedDate: '2024-01-10',
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      icon: <FireOutlined />,
      xpReward: 50,
      unlocked: true,
      unlockedDate: '2024-01-16',
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Knowledge Seeker',
      description: 'Complete 50 study sessions',
      icon: <StarOutlined />,
      xpReward: 100,
      unlocked: false,
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Master Mind',
      description: 'Achieve a 30-day study streak',
      icon: <CrownOutlined />,
      xpReward: 500,
      unlocked: false,
      rarity: 'legendary'
    }
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Daily Study Marathon',
      description: 'Study for at least 3 hours today',
      reward: '25 XP + Achievement',
      progress: 2.5,
      target: 3,
      deadline: 'Today, 11:59 PM',
      completed: false
    },
    {
      id: '2',
      title: 'Subject Explorer',
      description: 'Study 3 different subjects this week',
      reward: '50 XP',
      progress: 2,
      target: 3,
      deadline: 'This Sunday',
      completed: false
    },
    {
      id: '3',
      title: 'Problem Solver',
      description: 'Complete 25 practice problems',
      reward: '75 XP',
      progress: 18,
      target: 25,
      deadline: 'Next Week',
      completed: false
    }
  ]);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    {
      id: '1',
      name: 'Alice Chen',
      level: 12,
      xp: 2450,
      studyStreak: 15,
      rank: 1
    },
    {
      id: '2',
      name: 'You',
      avatar: 'Y',
      level: 5,
      xp: 1250,
      studyStreak: 7,
      rank: 3
    },
    {
      id: '3',
      name: 'Bob Wilson',
      level: 8,
      xp: 1800,
      studyStreak: 10,
      rank: 2
    },
    {
      id: '4',
      name: 'Charlie Davis',
      level: 6,
      xp: 1400,
      studyStreak: 5,
      rank: 4
    }
  ]);

  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [userPoints, setUserPoints] = useState(320);

  const getRarityColor = (rarity: string) => {
    const colors = {
      'common': '#52c41a',
      'rare': '#1890ff',
      'epic': '#722ed1',
      'legendary': '#faad14'
    };
    return colors[rarity as keyof typeof colors];
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <CrownOutlined style={{ color: '#faad14' }} />;
    if (rank === 2) return <TrophyOutlined style={{ color: '#c0c0c0' }} />;
    if (rank === 3) return <TrophyOutlined style={{ color: '#cd7f32' }} />;
    return <Text>{rank}</Text>;
  };

  const completeChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, completed: true, progress: challenge.target }
        : challenge
    ));
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      message.success(`Challenge completed! ${challenge.reward}`);
      setUserLevel(prev => ({ ...prev, xp: prev.xp + 25 }));
    }
  };

  const redeemReward = (reward: string, cost: number) => {
    if (userPoints >= cost) {
      setUserPoints(prev => prev - cost);
      message.success(`Redeemed: ${reward}`);
      setRewardModalVisible(false);
    } else {
      message.error('Not enough points!');
    }
  };

  const levelProgress = (userLevel.xp / userLevel.xpToNext) * 100;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Gamification</Title>
      
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* User Level & Stats */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Card title="Your Progress">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar size={64} icon={<CrownOutlined />} style={{ backgroundColor: '#faad14' }} />
                  <div style={{ flex: 1 }}>
                    <Title level={4} style={{ margin: 0 }}>
                      Level {userLevel.level} - {userLevel.title}
                    </Title>
                    <Progress
                      percent={levelProgress}
                      format={() => `${userLevel.xp} / ${userLevel.xpToNext} XP`}
                      strokeColor="#faad14"
                    />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, color: '#1890ff' }}>
                      <ThunderboltOutlined />
                    </div>
                    <Text strong>{userPoints}</Text>
                    <br />
                    <Text type="secondary">Points</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card title="Quick Stats">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Study Streak</Text>
                  <Badge count={7} style={{ backgroundColor: '#52c41a' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Completed Challenges</Text>
                  <Badge count={12} style={{ backgroundColor: '#1890ff' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Achievements</Text>
                  <Badge count={achievements.filter(a => a.unlocked).length} style={{ backgroundColor: '#722ed1' }} />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Daily Challenges */}
        <Card title="Daily Challenges">
          <List
            dataSource={challenges}
            renderItem={(challenge) => (
              <List.Item
                actions={[
                  <Button
                    key="complete"
                    type={challenge.completed ? 'default' : 'primary'}
                    disabled={challenge.completed}
                    onClick={() => completeChallenge(challenge.id)}
                  >
                    {challenge.completed ? 'Completed' : 'Complete'}
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      {challenge.title}
                      {challenge.completed && <GiftOutlined style={{ color: '#52c41a' }} />}
                    </Space>
                  }
                  description={
                    <div>
                      <Text>{challenge.description}</Text>
                      <br />
                      <Progress
                        percent={(challenge.progress / challenge.target) * 100}
                        format={() => `${challenge.progress}/${challenge.target}`}
                        size="small"
                        style={{ marginTop: 4 }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Reward: {challenge.reward}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Deadline: {challenge.deadline}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
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
                    border: `2px solid ${achievement.unlocked ? getRarityColor(achievement.rarity) : '#d9d9d9'}`
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8, color: getRarityColor(achievement.rarity) }}>
                      {achievement.icon}
                    </div>
                    <Title level={5}>{achievement.title}</Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {achievement.description}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Badge count={`${achievement.xpReward} XP`} style={{ backgroundColor: getRarityColor(achievement.rarity) }} />
                    </div>
                    {achievement.unlocked && achievement.unlockedDate && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          Unlocked {achievement.unlockedDate}
                        </Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Leaderboard */}
        <Card
          title="Leaderboard"
          extra={<Button icon={<GiftOutlined />} onClick={() => setRewardModalVisible(true)}>
            Redeem Rewards
          </Button>}
        >
          <List
            dataSource={leaderboard.sort((a, b) => b.xp - a.xp)}
            renderItem={(entry, index) => (
              <List.Item style={{ backgroundColor: entry.name === 'You' ? '#f0f8ff' : 'transparent' }}>
                <List.Item.Meta
                  avatar={
                    <Space>
                      {getRankIcon(index + 1)}
                      <Avatar style={{ backgroundColor: entry.name === 'You' ? '#1890ff' : '#87d068' }}>
                        {entry.avatar || entry.name.charAt(0)}
                      </Avatar>
                    </Space>
                  }
                  title={
                    <Space>
                      {entry.name}
                      {entry.name === 'You' && <Badge count="YOU" style={{ backgroundColor: '#1890ff' }} />}
                    </Space>
                  }
                  description={
                    <Space>
                      <Text>Level {entry.level}</Text>
                      <Text>•</Text>
                      <Text>{entry.xp} XP</Text>
                      <Text>•</Text>
                      <Space>
                        <FireOutlined />
                        <Text>{entry.studyStreak} day streak</Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Space>

      <Modal
        title="Reward Store"
        open={rewardModalVisible}
        onCancel={() => setRewardModalVisible(false)}
        footer={null}
      >
        <List
          dataSource={[
            { name: 'Custom Theme', cost: 100, icon: <StarOutlined /> },
            { name: 'Extra XP Boost', cost: 50, icon: <RocketOutlined /> },
            { name: 'Profile Badge', cost: 75, icon: <TrophyOutlined /> },
            { name: 'Study Extension', cost: 25, icon: <HeartOutlined /> }
          ]}
          renderItem={(reward) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  disabled={userPoints < reward.cost}
                  onClick={() => redeemReward(reward.name, reward.cost)}
                >
                  {reward.cost} pts
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={reward.icon}
                title={reward.name}
                description={`Redeem this reward for ${reward.cost} points`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default Gamification;
