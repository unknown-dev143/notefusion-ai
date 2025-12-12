import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Progress, Radio, Tag, Row, Col, List, Avatar, Badge } from 'antd';
import { 
  QuestionCircleOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  BookOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'drag-drop' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string | number | string[];
  explanation: string;
  difficulty: number;
  category: string;
  timeLimit?: number;
  points: number;
}

interface QuizSession {
  id: string;
  title: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  startTime: Date;
  timeRemaining: number;
  timeLimit: number;
  score: number;
  completed: boolean;
}

interface UserStats {
  totalQuizzes: number;
  averageScore: number;
  bestCategory: string;
  improvementStreak: number;
  totalTimeSpent: number;
}

const InteractiveQuizSystem: React.FC = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizSession[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalQuizzes: 12,
    averageScore: 85,
    bestCategory: 'React',
    improvementStreak: 3,
    totalTimeSpent: 240
  });

  const [quizTemplates] = useState<QuizSession[]>([
    {
      id: 'react-basics',
      title: 'React Fundamentals Quiz',
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'What is the primary purpose of React components?',
          options: [
            'To handle database operations',
            'To create reusable UI elements',
            'To manage server-side logic',
            'To style web pages'
          ],
          correctAnswer: 1,
          explanation: 'React components are building blocks that create reusable UI elements.',
          difficulty: 1,
          category: 'React',
          points: 10
        },
        {
          id: 'q2',
          type: 'true-false',
          question: 'React hooks can only be used in functional components.',
          correctAnswer: 'true' as const,
          explanation: 'Hooks are designed to work only in functional components, not class components.',
          difficulty: 2,
          category: 'React',
          points: 15
        },
        {
          id: 'q3',
          type: 'fill-blank',
          question: 'The useState hook returns an array with two elements: the current state and a ___ to update it.',
          correctAnswer: 'function',
          explanation: 'useState returns [state, setState] where setState is a function to update the state.',
          difficulty: 2,
          category: 'React',
          points: 15
        }
      ],
      currentQuestionIndex: 0,
      answers: {},
      startTime: new Date(),
      timeRemaining: 300,
      timeLimit: 300,
      score: 0,
      completed: false
    },
    {
      id: 'javascript-advanced',
      title: 'Advanced JavaScript Concepts',
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'What is the output of: Promise.resolve(Promise.resolve(2)).then(console.log)?',
          options: ['Promise', '2', 'undefined', 'Error'],
          correctAnswer: 1,
          explanation: 'Promise.resolve automatically flattens nested promises.',
          difficulty: 3,
          category: 'JavaScript',
          points: 20
        }
      ],
      currentQuestionIndex: 0,
      answers: {},
      startTime: new Date(),
      timeRemaining: 240,
      timeLimit: 240,
      score: 0,
      completed: false
    }
  ]);

  useEffect(() => {
    if (currentQuiz && currentQuiz.timeRemaining > 0 && !currentQuiz.completed) {
      const timer = setTimeout(() => {
        setCurrentQuiz(prev => prev ? {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        } : null);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentQuiz && currentQuiz.timeRemaining === 0) {
      completeQuiz();
    }
  }, [currentQuiz?.timeRemaining, currentQuiz?.completed]);

  const startQuiz = (quizTemplate: QuizSession) => {
    const newQuiz: QuizSession = {
      ...quizTemplate,
      startTime: new Date(),
      timeRemaining: quizTemplate.timeRemaining,
      answers: {},
      score: 0,
      completed: false,
      currentQuestionIndex: 0
    };
    setCurrentQuiz(newQuiz);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const submitAnswer = () => {
    if (!currentQuiz || selectedAnswer === null) return;

    const currentQuestion = currentQuiz.questions[currentQuiz.currentQuestionIndex];
    const isCorrect = checkAnswer(currentQuestion, selectedAnswer);
    
    const updatedQuiz = {
      ...currentQuiz,
      answers: {
        ...currentQuiz.answers,
        [currentQuestion.id]: selectedAnswer
      },
      score: isCorrect ? currentQuiz.score + currentQuestion.points : currentQuiz.score
    };

    setCurrentQuiz(updatedQuiz);
    setShowResult(true);
  };

  const checkAnswer = (question: Question, answer: any): boolean => {
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      return answer === question.correctAnswer;
    } else if (question.type === 'fill-blank') {
      return answer.toLowerCase().trim() === (question.correctAnswer as string).toLowerCase().trim();
    }
    return false;
  };

  const nextQuestion = () => {
    if (!currentQuiz) return;

    const nextIndex = currentQuiz.currentQuestionIndex + 1;
    if (nextIndex >= currentQuiz.questions.length) {
      completeQuiz();
    } else {
      setCurrentQuiz({
        ...currentQuiz,
        currentQuestionIndex: nextIndex
      });
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const completeQuiz = () => {
    if (!currentQuiz) return;

    const completedQuiz = {
      ...currentQuiz,
      completed: true,
      timeRemaining: 0
    };

    setCurrentQuiz(completedQuiz);
    setQuizHistory(prev => [...prev, completedQuiz]);
    
    // Update user stats
    const newAverageScore = (userStats.averageScore * userStats.totalQuizzes + completedQuiz.score) / (userStats.totalQuizzes + 1);
    setUserStats(prev => ({
      ...prev,
      totalQuizzes: prev.totalQuizzes + 1,
      averageScore: newAverageScore,
      totalTimeSpent: prev.totalTimeSpent + (completedQuiz.timeLimit || 0 - completedQuiz.timeRemaining)
    }));
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <Radio.Group 
            value={selectedAnswer} 
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={showResult}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {question.options?.map((option, index) => (
                <Radio key={index} value={index}>
                  {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        );
      
      case 'true-false':
        return (
          <Radio.Group 
            value={selectedAnswer} 
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={showResult}
          >
            <Space direction="vertical">
              <Radio value={true}>True</Radio>
              <Radio value={false}>False</Radio>
            </Space>
          </Radio.Group>
        );
      
      case 'fill-blank':
        return (
          <input
            type="text"
            value={selectedAnswer || ''}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={showResult}
            placeholder="Type your answer here..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        );
      
      default:
        return <Text>Question type not supported yet</Text>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQuiz) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <QuestionCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            </Col>
            <Col flex="auto">
              <Title level={3} style={{ margin: 0 }}>Interactive Quiz System</Title>
              <Text type="secondary">Test your knowledge with adaptive quizzes and immediate feedback</Text>
            </Col>
            <Col>
              <Badge count={userStats.totalQuizzes} showZero>
                <Tag color="blue">Quizzes Taken</Tag>
              </Badge>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={16}>
            <Card title="Available Quizzes" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {quizTemplates.map(quiz => (
                  <Card
                    key={quiz.id}
                    size="small"
                    hoverable
                    style={{ cursor: 'pointer' }}
                    onClick={() => startQuiz(quiz)}
                  >
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Title level={5} style={{ margin: 0 }}>{quiz.title}</Title>
                        <Space>
                          <Tag color="blue">{quiz.questions.length} questions</Tag>
                          <Tag color="green">{formatTime(quiz.timeRemaining)}</Tag>
                          <Tag color="orange">Level {quiz.questions.reduce((sum, q) => sum + q.difficulty, 0) / quiz.questions.length}</Tag>
                        </Space>
                      </Col>
                      <Col>
                        <Button type="primary">Start Quiz</Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Your Statistics" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Average Score: </Text>
                  <Text>{Math.round(userStats.averageScore)}%</Text>
                  <Progress 
                    percent={userStats.averageScore} 
                    size="small" 
                    style={{ marginTop: 4 }}
                  />
                </div>
                <div>
                  <Text strong>Total Quizzes: </Text>
                  <Text>{userStats.totalQuizzes}</Text>
                </div>
                <div>
                  <Text strong>Best Category: </Text>
                  <Tag color="gold">{userStats.bestCategory}</Tag>
                </div>
                <div>
                  <Text strong>Improvement Streak: </Text>
                  <Text>{userStats.improvementStreak} quizzes</Text>
                </div>
                <div>
                  <Text strong>Total Time: </Text>
                  <Text>{Math.round(userStats.totalTimeSpent / 60)} minutes</Text>
                </div>
              </Space>
            </Card>

            <Card title="Recent Activity" size="small" style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={quizHistory.slice(-3).reverse()}
                renderItem={(quiz) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BookOutlined />} />}
                      title={quiz.title}
                      description={`Score: ${quiz.score} • ${formatTime(quiz.timeLimit || 0 - quiz.timeRemaining)}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuiz.currentQuestionIndex];
  const progress = ((currentQuiz.currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  const isCorrect = showResult && checkAnswer(currentQuestion, selectedAnswer);

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>{currentQuiz.title}</Title>
            <Text type="secondary">Question {currentQuiz.currentQuestionIndex + 1} of {currentQuiz.questions.length}</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">Score: {currentQuiz.score}</Tag>
              <Tag color={currentQuiz.timeRemaining < 60 ? 'red' : 'green'}>
                <ClockCircleOutlined /> {formatTime(currentQuiz.timeRemaining)}
              </Tag>
            </Space>
          </Col>
        </Row>
        <Progress percent={progress} style={{ marginTop: 16 }} />
      </Card>

      <Card style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Tag color={currentQuestion.difficulty <= 2 ? 'green' : currentQuestion.difficulty <= 3 ? 'orange' : 'red'}>
              Level {currentQuestion.difficulty}
            </Tag>
            <Tag color="blue">{currentQuestion.category}</Tag>
            <Tag color="purple">{currentQuestion.points} points</Tag>
          </Space>
        </div>

        <Title level={4}>{currentQuestion.question}</Title>
        
        <div style={{ margin: '24px 0' }}>
          {renderQuestion(currentQuestion)}
        </div>

        {showResult && (
          <Card 
            style={{ 
              marginTop: 16, 
              border: isCorrect ? '1px solid #52c41a' : '1px solid #ff4d4f',
              backgroundColor: isCorrect ? '#f6ffed' : '#fff2f0'
            }}
          >
            <Space>
              {isCorrect ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
              ) : (
                <QuestionCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
              )}
              <div>
                <Text strong style={{ color: isCorrect ? '#52c41a' : '#ff4d4f' }}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </Text>
                <br />
                <Text type="secondary">{currentQuestion.explanation}</Text>
              </div>
            </Space>
          </Card>
        )}

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            {!showResult ? (
              <Button 
                type="primary" 
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button type="primary" onClick={nextQuestion}>
                {currentQuiz.currentQuestionIndex < currentQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default InteractiveQuizSystem;
