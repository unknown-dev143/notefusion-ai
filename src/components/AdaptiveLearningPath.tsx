import React, { useState } from 'react';
import { Card, Progress, Button, Space, Typography, Row, Col, Tag, Badge, Steps, List } from 'antd';
import { 
  BulbOutlined, 
  CheckCircleOutlined, 
  RocketOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  estimatedTime: number;
  prerequisites: string[];
  completed: boolean;
  currentProgress: number;
  masteryLevel: number;
  adaptiveContent: boolean;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  totalModules: number;
  completedModules: number;
  estimatedCompletion: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: LearningModule[];
}

interface UserLearningProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  preferredDifficulty: number;
  averageCompletionTime: number;
  strengthAreas: string[];
  weaknessAreas: string[];
  currentLevel: number;
}

const AdaptiveLearningPath: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('react-mastery');
  const [userProfile] = useState<UserLearningProfile>({
    learningStyle: 'visual',
    preferredDifficulty: 2.5,
    averageCompletionTime: 45,
    strengthAreas: ['React Basics', 'Components'],
    weaknessAreas: ['Hooks', 'State Management'],
    currentLevel: 3
  });

  const [learningPaths] = useState<LearningPath[]>([
    {
      id: 'react-mastery',
      name: 'React Mastery Path',
      description: 'Complete journey from React basics to advanced patterns',
      totalModules: 8,
      completedModules: 3,
      estimatedCompletion: '2 weeks',
      difficulty: 'intermediate',
      modules: [
        {
          id: 'react-basics',
          title: 'React Fundamentals',
          description: 'Learn the core concepts of React including components, props, and state',
          difficulty: 1,
          estimatedTime: 30,
          prerequisites: [],
          completed: true,
          currentProgress: 100,
          masteryLevel: 85,
          adaptiveContent: true,
          learningStyle: 'visual'
        },
        {
          id: 'components',
          title: 'Advanced Components',
          description: 'Master component patterns, lifecycle methods, and best practices',
          difficulty: 2,
          estimatedTime: 45,
          prerequisites: ['react-basics'],
          completed: true,
          currentProgress: 100,
          masteryLevel: 78,
          adaptiveContent: true,
          learningStyle: 'visual'
        },
        {
          id: 'hooks',
          title: 'React Hooks Deep Dive',
          description: 'Comprehensive understanding of useState, useEffect, and custom hooks',
          difficulty: 3,
          estimatedTime: 60,
          prerequisites: ['components'],
          completed: false,
          currentProgress: 65,
          masteryLevel: 0,
          adaptiveContent: true,
          learningStyle: 'kinesthetic'
        },
        {
          id: 'state-management',
          title: 'State Management',
          description: 'Learn Context API, Redux, and modern state management solutions',
          difficulty: 4,
          estimatedTime: 90,
          prerequisites: ['hooks'],
          completed: false,
          currentProgress: 0,
          masteryLevel: 0,
          adaptiveContent: true,
          learningStyle: 'auditory'
        }
      ]
    },
    {
      id: 'javascript-advanced',
      name: 'Advanced JavaScript',
      description: 'Master modern JavaScript features and advanced concepts',
      totalModules: 6,
      completedModules: 2,
      estimatedCompletion: '3 weeks',
      difficulty: 'advanced',
      modules: [
        {
          id: 'async-js',
          title: 'Asynchronous JavaScript',
          description: 'Promises, async/await, and handling asynchronous operations',
          difficulty: 3,
          estimatedTime: 60,
          prerequisites: [],
          completed: false,
          currentProgress: 30,
          masteryLevel: 0,
          adaptiveContent: true,
          learningStyle: 'visual'
        }
      ]
    }
  ]);

  const currentPath = learningPaths.find(path => path.id === selectedPath);

  const getAdaptiveRecommendations = () => {
    const recommendations = [];
    
    if (userProfile.learningStyle === 'visual') {
      recommendations.push('Visual diagrams and flowcharts recommended');
      recommendations.push('Video tutorials with demonstrations');
    } else if (userProfile.learningStyle === 'auditory') {
      recommendations.push('Audio explanations and podcasts');
      recommendations.push('Discussion-based learning');
    } else {
      recommendations.push('Hands-on coding exercises');
      recommendations.push('Interactive projects');
    }

    if (userProfile.currentLevel < 3) {
      recommendations.push('Focus on foundational concepts');
    } else {
      recommendations.push('Challenge with advanced problems');
    }

    return recommendations;
  };

  const getNextRecommendedModule = () => {
    if (!currentPath) return null;

    const incompleteModules = currentPath.modules.filter(module => !module.completed);
    
    // Sort by prerequisites and user's weakness areas
    return incompleteModules.sort((a, b) => {
      const aIsWeakness = userProfile.weaknessAreas.includes(a.title);
      const bIsWeakness = userProfile.weaknessAreas.includes(b.title);
      
      if (aIsWeakness && !bIsWeakness) return -1;
      if (!aIsWeakness && bIsWeakness) return 1;
      
      return a.difficulty - b.difficulty;
    })[0];
  };

  const nextModule = getNextRecommendedModule();

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <RocketOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ margin: 0 }}>Adaptive Learning Path</Title>
            <Text type="secondary">Personalized learning journey that adapts to your progress and style</Text>
          </Col>
          <Col>
            <Badge count={userProfile.currentLevel} showZero>
              <Tag color="blue">Level {userProfile.currentLevel}</Tag>
            </Badge>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          {/* Learning Path Selection */}
          <Card title="Select Learning Path" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {learningPaths.map(path => (
                <Card
                  key={path.id}
                  size="small"
                  hoverable
                  style={{
                    border: selectedPath === path.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedPath(path.id)}
                >
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Title level={5} style={{ margin: 0 }}>{path.name}</Title>
                      <Text type="secondary">{path.description}</Text>
                    </Col>
                    <Col>
                      <Space direction="vertical" align="end">
                        <Tag color={path.difficulty === 'beginner' ? 'green' : path.difficulty === 'intermediate' ? 'orange' : 'red'}>
                          {path.difficulty}
                        </Tag>
                        <Progress 
                          percent={Math.round((path.completedModules / path.totalModules) * 100)} 
                          size="small"
                          style={{ width: 100 }}
                        />
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </Card>

          {/* Current Path Progress */}
          {currentPath && (
            <Card title="Learning Progress" size="small" style={{ marginTop: 16 }}>
              <Steps
                current={currentPath.modules.findIndex(m => !m.completed)}
                direction="vertical"
                size="small"
              >
                {currentPath.modules.map((module, index) => (
                  <Step
                    key={module.id}
                    title={module.title}
                    description={
                      <div>
                        <Text type="secondary">{module.estimatedTime} minutes</Text>
                        {module.completed && (
                          <div style={{ marginTop: 4 }}>
                            <Progress percent={module.masteryLevel} size="small" style={{ width: 150 }} />
                          </div>
                        )}
                      </div>
                    }
                    status={module.completed ? 'finish' : index === currentPath.modules.findIndex(m => !m.completed) ? 'process' : 'wait'}
                    icon={module.completed ? <CheckCircleOutlined /> : undefined}
                  />
                ))}
              </Steps>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* User Profile */}
          <Card title="Your Learning Profile" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Learning Style:</Text>
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {userProfile.learningStyle}
                </Tag>
              </div>
              <div>
                <Text strong>Current Level:</Text>
                <Progress 
                  percent={(userProfile.currentLevel / 5) * 100} 
                  size="small" 
                  style={{ marginTop: 4 }}
                />
              </div>
              <div>
                <Text strong>Strength Areas:</Text>
                <div style={{ marginTop: 4 }}>
                  {userProfile.strengthAreas.map(area => (
                    <Tag key={area} color="green" style={{ margin: '2px' }}>{area}</Tag>
                  ))}
                </div>
              </div>
              <div>
                <Text strong>Areas to Improve:</Text>
                <div style={{ marginTop: 4 }}>
                  {userProfile.weaknessAreas.map(area => (
                    <Tag key={area} color="orange" style={{ margin: '2px' }}>{area}</Tag>
                  ))}
                </div>
              </div>
            </Space>
          </Card>

          {/* Adaptive Recommendations */}
          <Card title="Adaptive Recommendations" size="small" style={{ marginTop: 16 }}>
            <List
              size="small"
              dataSource={getAdaptiveRecommendations()}
              renderItem={(recommendation: string) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<BulbOutlined style={{ color: '#faad14' }} />}
                    description={recommendation}
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Next Recommended Module */}
          {nextModule && (
            <Card title="Next Recommended" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Title level={5}>{nextModule.title}</Title>
                  <Text type="secondary">{nextModule.description}</Text>
                </div>
                <Button type="primary" block>
                  Start Learning
                </Button>
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AdaptiveLearningPath;
