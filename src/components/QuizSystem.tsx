import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Progress, Radio, message, List, Tag, Statistic, Row, Col } from 'antd';
import { 
  TrophyOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  PlayCircleOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
  correctAnswers: number;
}

const QuizSystem: React.FC = () => {
  const quizzes: Question[][] = [
    [
      {
        id: '1',
        question: 'What is the primary function of mitochondria in cells?',
        options: [
          'Protein synthesis',
          'Energy production (ATP)',
          'DNA replication',
          'Cell division'
        ],
        correctAnswer: 1,
        explanation: 'Mitochondria are known as the powerhouses of the cell, responsible for producing ATP through cellular respiration.',
        difficulty: 'medium',
        category: 'Biology'
      },
      {
        id: '2',
        question: 'Which programming language is known as the "language of the web"?',
        options: ['Python', 'Java', 'JavaScript', 'C++'],
        correctAnswer: 2,
        explanation: 'JavaScript is the primary programming language for web development, running in browsers worldwide.',
        difficulty: 'easy',
        category: 'Programming'
      }
    ],
    [
      {
        id: '3',
        question: 'What is the derivative of x²?',
        options: ['x', '2x', 'x²', '2'],
        correctAnswer: 1,
        explanation: 'Using the power rule, the derivative of x² is 2x.',
        difficulty: 'easy',
        category: 'Mathematics'
      }
    ]
  ];

  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isQuizActive && !showResult) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isQuizActive, showResult]);

  const startQuiz = (quizIndex: number) => {
    setCurrentQuiz(quizzes[quizIndex]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsQuizActive(true);
    setTimeSpent(0);
    setCorrectAnswers(0);
    setShowExplanation(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) {
      message.warning('Please select an answer');
      return;
    }

    const isCorrect = selectedAnswer === currentQuiz[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      message.success('Correct!');
    } else {
      message.error('Incorrect');
    }

    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      endQuiz();
    }
  };

  const endQuiz = () => {
    const result: QuizResult = {
      quizId: currentQuiz[0].category,
      score: Math.round((correctAnswers / currentQuiz.length) * 100),
      totalQuestions: currentQuiz.length,
      timeSpent,
      completedAt: new Date().toISOString(),
      correctAnswers
    };

    setQuizResults(prev => [result, ...prev]);
    setShowResult(true);
    setIsQuizActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'blue';
    }
  };

  if (!isQuizActive && !showResult) {
    return (
      <div style={{ padding: '24px' }}>
        <Title level={2}>Quiz System</Title>
        
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Quizzes Taken"
                value={quizResults.length}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Average Score"
                value={quizResults.length > 0 ? Math.round(quizResults.reduce((acc, r) => acc + r.score, 0) / quizResults.length) : 0}
                suffix="%"
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Best Score"
                value={quizResults.length > 0 ? Math.max(...quizResults.map(r => r.score)) : 0}
                suffix="%"
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Available Quizzes" style={{ marginBottom: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {quizzes.map((quiz, index) => (
              <Card key={index} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4}>Quiz {index + 1}: {quiz[0]?.category || 'General'}</Title>
                    <Tag color={getDifficultyColor(quiz[0]?.difficulty || 'medium')}>
                      {quiz[0]?.difficulty || 'medium'}
                    </Tag>
                  </div>
                  <Text>{quiz.length} questions</Text>
                  <Button 
                    type="primary" 
                    icon={<PlayCircleOutlined />}
                    onClick={() => startQuiz(index)}
                    block
                  >
                    Start Quiz
                  </Button>
                </Space>
              </Card>
            ))}
          </Space>
        </Card>

        {quizResults.length > 0 && (
          <Card title="Recent Results">
            <List
              dataSource={quizResults.slice(0, 5)}
              renderItem={(result) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: result.score >= 80 ? '#52c41a' : result.score >= 60 ? '#faad14' : '#ff4d4f' }}>
                          {result.score}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {result.correctAnswers}/{result.totalQuestions}
                        </div>
                      </div>
                    }
                    title={result.quizId}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">Time: {formatTime(result.timeSpent)}</Text>
                        <Text type="secondary">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}
      </div>
    );
  }

  if (showResult) {
    const latestResult = quizResults[0];
    return (
      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <Card style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <TrophyOutlined style={{ fontSize: '64px', color: '#faad14' }} />
            <Title level={2}>Quiz Completed!</Title>
            
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Your Score"
                  value={latestResult.score}
                  suffix="%"
                  valueStyle={{ 
                    color: latestResult.score >= 80 ? '#52c41a' : latestResult.score >= 60 ? '#faad14' : '#ff4d4f' 
                  }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Correct Answers"
                  value={`${latestResult.correctAnswers}/${latestResult.totalQuestions}`}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Time Spent"
                  value={formatTime(latestResult.timeSpent)}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Performance"
                  value={latestResult.score >= 80 ? 'Excellent' : latestResult.score >= 60 ? 'Good' : 'Needs Practice'}
                  valueStyle={{ 
                    color: latestResult.score >= 80 ? '#52c41a' : latestResult.score >= 60 ? '#faad14' : '#ff4d4f' 
                  }}
                />
              </Col>
            </Row>

            <Space>
              <Button type="primary" onClick={() => setShowResult(false)}>
                Back to Quizzes
              </Button>
              <Button onClick={() => startQuiz(0)}>
                Retake Quiz
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  }

  const currentQuestion = currentQuiz[currentQuestionIndex];

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Quiz: {currentQuestion.category}</Title>
            <Space>
              <Tag color={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Tag>
              <Text strong>Question {currentQuestionIndex + 1} of {currentQuiz.length}</Text>
            </Space>
          </div>

          <Progress 
            percent={((currentQuestionIndex + 1) / currentQuiz.length) * 100} 
            showInfo={false}
            strokeColor="#1890ff"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4}>{currentQuestion.question}</Title>
            <Space>
              <ClockCircleOutlined />
              <Text>{formatTime(timeSpent)}</Text>
            </Space>
          </div>

          <Radio.Group 
            value={selectedAnswer} 
            onChange={(e) => handleAnswerSelect(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {currentQuestion.options.map((option, index) => (
                <Radio key={index} value={index} style={{ width: '100%' }}>
                  {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          {showExplanation && (
            <Card 
              size="small" 
              style={{ 
                backgroundColor: selectedAnswer === currentQuestion.correctAnswer ? '#f6ffed' : '#fff2f0',
                borderColor: selectedAnswer === currentQuestion.correctAnswer ? '#b7eb8f' : '#ffccc7'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  {selectedAnswer === currentQuestion.correctAnswer ? 
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  }
                  <Text strong>
                    {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </Text>
                </Space>
                <Text>{currentQuestion.explanation}</Text>
              </Space>
            </Card>
          )}

          <Space>
            {!showExplanation ? (
              <Button type="primary" onClick={submitAnswer} disabled={selectedAnswer === null}>
                Submit Answer
              </Button>
            ) : (
              <Button type="primary" onClick={nextQuestion}>
                {currentQuestionIndex < currentQuiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            )}
            <Button onClick={() => setIsQuizActive(false)}>
              Exit Quiz
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default QuizSystem;
