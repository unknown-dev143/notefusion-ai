import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
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
  List,
  Radio,
  Checkbox,
  Modal,
  Alert,
  Badge,
  Statistic,
  Steps,
  Timeline,
  Switch
} from 'antd';
import { 
  QuestionCircleOutlined, 
  BulbOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  BookOutlined,
  StarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  points: number;
  timeLimit?: number; // in seconds
  hints?: string[];
  tags: string[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questions: QuizQuestion[];
  timeLimit: number; // total time in minutes
  passingScore: number; // percentage
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  showExplanations: boolean;
  allowReview: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  answers: Record<string, any>;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // in seconds
  startedAt: number;
  completedAt: number;
  feedback: Record<string, {
    correct: boolean;
    userAnswer: any;
    correctAnswer: any;
    explanation: string;
  }>;
}

interface QuizGenerationParams {
  content: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  questionTypes: string[];
  timePerQuestion: number;
  includeExplanations: boolean;
  includeHints: boolean;
  focusAreas: string[];
}

const AIQuizGenerator: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [form] = Form.useForm();
  const [quizForm] = Form.useForm();

  // Load quizzes from localStorage
  useEffect(() => {
    loadQuizzes();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            completeQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const loadQuizzes = async () => {
    try {
      const savedQuizzes = localStorage.getItem('aiQuizzes');
      if (savedQuizzes) {
        setQuizzes(JSON.parse(savedQuizzes));
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    }
  };

  const saveQuizzes = async (updatedQuizzes: Quiz[]) => {
    try {
      localStorage.setItem('aiQuizzes', JSON.stringify(updatedQuizzes));
      setQuizzes(updatedQuizzes);
    } catch (error) {
      console.error('Failed to save quizzes:', error);
    }
  };

  const generateQuiz = async (values: QuizGenerationParams) => {
    setIsGenerating(true);
    
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const questions: QuizQuestion[] = [];
      
      // Generate different types of questions based on parameters
      for (let i = 0; i < values.questionCount; i++) {
        const questionType = values.questionTypes[i % values.questionTypes.length] as QuizQuestion['type'];
        const difficulty = values.difficulty === 'mixed' 
          ? ['easy', 'medium', 'hard'][i % 3] as QuizQuestion['difficulty']
          : values.difficulty;
        
        let question: QuizQuestion;
        
        switch (questionType) {
          case 'multiple-choice':
            question = {
              id: `q${i + 1}`,
              type: 'multiple-choice',
              question: `What is the main concept discussed in the ${i + 1}th section of the content?`,
              options: [
                'Option A: The primary topic',
                'Option B: A secondary concept',
                'Option C: An unrelated idea',
                'Option D: A supporting detail'
              ],
              correctAnswer: 0,
              explanation: 'The correct answer is Option A because it directly addresses the main concept.',
              difficulty,
              topic: values.topic,
              points: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15,
              timeLimit: values.timePerQuestion,
              hints: ['Consider the main theme', 'Look for key indicators'],
              tags: ['concept', 'understanding']
            };
            break;
            
          case 'true-false':
            question = {
              id: `q${i + 1}`,
              type: 'true-false',
              question: `The content states that ${values.topic} is the most important factor.`,
              correctAnswer: 'true',
              explanation: 'This statement is supported by evidence in the provided content.',
              difficulty,
              topic: values.topic,
              points: difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 9,
              timeLimit: values.timePerQuestion / 2,
              tags: ['factual', 'comprehension']
            };
            break;
            
          case 'fill-blank':
            question = {
              id: `q${i + 1}`,
              type: 'fill-blank',
              question: `The _____ of ${values.topic} can be explained through _____ principles.`,
              correctAnswer: 'importance fundamental',
              explanation: 'The importance of the topic can be explained through fundamental principles.',
              difficulty,
              topic: values.topic,
              points: difficulty === 'easy' ? 4 : difficulty === 'medium' ? 8 : 12,
              timeLimit: values.timePerQuestion,
              hints: ['Think about key terms', 'Consider the context'],
              tags: ['terminology', 'application']
            };
            break;
            
          case 'short-answer':
            question = {
              id: `q${i + 1}`,
              type: 'short-answer',
              question: `Explain the significance of ${values.topic} in your own words.`,
              correctAnswer: 'A comprehensive explanation demonstrating understanding',
              explanation: 'A good answer should include key concepts and their relationships.',
              difficulty,
              topic: values.topic,
              points: difficulty === 'easy' ? 8 : difficulty === 'medium' ? 15 : 20,
              timeLimit: values.timePerQuestion * 2,
              hints: ['Include key points', 'Provide examples'],
              tags: ['analysis', 'synthesis']
            };
            break;
            
          default:
            question = {
              id: `q${i + 1}`,
              type: 'multiple-choice',
              question: `Default question about ${values.topic}`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              explanation: 'Default explanation',
              difficulty: 'medium',
              topic: values.topic,
              points: 10,
              tags: ['general']
            };
        }
        
        questions.push(question);
      }
      
      const newQuiz: Quiz = {
        id: `quiz_${Date.now()}`,
        title: `${values.subject} - ${values.topic} Quiz`,
        description: `AI-generated quiz on ${values.topic} with ${values.questionCount} questions`,
        subject: values.subject,
        topic: values.topic,
        difficulty: values.difficulty,
        questions,
        timeLimit: values.questionCount * values.timePerQuestion / 60, // convert to minutes
        passingScore: 70,
        maxAttempts: 3,
        shuffleQuestions: true,
        showResults: true,
        showExplanations: values.includeExplanations,
        allowReview: true,
        tags: ['AI-generated', values.subject, values.topic],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const updatedQuizzes = [...quizzes, newQuiz];
      await saveQuizzes(updatedQuizzes);
      
      setCurrentQuiz(newQuiz);
      setShowGenerateModal(false);
      form.resetFields();
      
      Modal.success({
        title: 'Quiz Generated Successfully',
        content: `Generated ${values.questionCount} questions on ${values.topic}`
      });
      
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      Modal.error({
        title: 'Generation Failed',
        content: 'Failed to generate quiz. Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentAttempt({
      id: `attempt_${Date.now()}`,
      quizId: quiz.id,
      answers: {},
      score: 0,
      maxScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      percentage: 0,
      passed: false,
      timeSpent: 0,
      startedAt: Date.now(),
      completedAt: 0,
      feedback: {}
    });
    setCurrentQuestionIndex(0);
    setTimeRemaining(quiz.timeLimit * 60); // convert to seconds
    setTimerActive(true);
    setIsTakingQuiz(true);
    setShowQuizModal(true);
  };

  const answerQuestion = (questionId: string, answer: any) => {
    if (!currentAttempt) return;
    
    const updatedAnswers = { ...currentAttempt.answers, [questionId]: answer };
    setCurrentAttempt({ ...currentAttempt, answers: updatedAnswers });
  };

  const nextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const completeQuiz = () => {
    if (!currentQuiz || !currentAttempt) return;
    
    setTimerActive(false);
    
    // Calculate score
    let totalScore = 0;
    const feedback: Record<string, any> = {};
    
    currentQuiz.questions.forEach(question => {
      const userAnswer = currentAttempt.answers[question.id];
      const isCorrect = checkAnswer(question, userAnswer);
      
      if (isCorrect) {
        totalScore += question.points;
      }
      
      feedback[question.id] = {
        correct: isCorrect,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      };
    });
    
    const percentage = (totalScore / currentAttempt.maxScore) * 100;
    const passed = percentage >= currentQuiz.passingScore;
    
    const completedAttempt: QuizAttempt = {
      ...currentAttempt,
      score: totalScore,
      percentage,
      passed,
      timeSpent: currentQuiz.timeLimit * 60 - timeRemaining,
      completedAt: Date.now(),
      feedback
    };
    
    setCurrentAttempt(completedAttempt);
    setIsTakingQuiz(false);
    setShowResultsModal(true);
    
    // Save attempt
    const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    attempts.push(completedAttempt);
    localStorage.setItem('quizAttempts', JSON.stringify(attempts));
  };

  const checkAnswer = (question: QuizQuestion, userAnswer: any): boolean => {
    switch (question.type) {
      case 'multiple-choice':
        return userAnswer === question.correctAnswer;
      case 'true-false':
        return userAnswer === question.correctAnswer;
      case 'fill-blank':
        return userAnswer.toLowerCase().trim() === (question.correctAnswer as string).toLowerCase();
      case 'short-answer':
        // Simple keyword matching for demo
        const keywords = (question.correctAnswer as string).toLowerCase().split(' ');
        const userWords = (userAnswer as string).toLowerCase().split(' ');
        return keywords.some(keyword => userWords.includes(keyword));
      default:
        return false;
    }
  };

  const deleteQuiz = async (quizId: string) => {
    Modal.confirm({
      title: 'Delete Quiz',
      content: 'Are you sure you want to delete this quiz? This action cannot be undone.',
      onOk: async () => {
        const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
        await saveQuizzes(updatedQuizzes);
      }
    });
  };

  const exportQuiz = (quiz: Quiz) => {
    const data = JSON.stringify(quiz, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'blue';
    }
  };

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Quiz Statistics */}
        <Col span={24}>
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Quizzes"
                  value={quizzes.length}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Questions"
                  value={quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0)}
                  prefix={<QuestionCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Avg Difficulty"
                  value={quizzes.length > 0 ? 
                    Math.round(quizzes.reduce((sum, quiz) => 
                      sum + (quiz.difficulty === 'easy' ? 1 : quiz.difficulty === 'medium' ? 2 : 3), 0
                    ) / quizzes.length * 10) / 10 : 0}
                  prefix={<StarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Subjects"
                  value={new Set(quizzes.map(q => q.subject)).size}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Quiz Generator */}
        <Col span={24}>
          <Card 
            title="AI Quiz Generator"
            extra={
              <Button 
                type="primary" 
                icon={<BulbOutlined />}
                onClick={() => setShowGenerateModal(true)}
              >
                Generate New Quiz
              </Button>
            }
          >
            <Alert
              message="AI-Powered Quiz Generation"
              description="Our AI can generate comprehensive quizzes from any content, including multiple choice, true/false, fill-in-the-blank, and short answer questions with detailed explanations."
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <List
              dataSource={quizzes}
              renderItem={(quiz) => (
                <List.Item
                  actions={[
                    <Button
                      key="take"
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => startQuiz(quiz)}
                    >
                      Take Quiz
                    </Button>,
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={() => {/* Edit quiz */}}
                    />,
                    <Button
                      key="export"
                      icon={<DownloadOutlined />}
                      onClick={() => exportQuiz(quiz)}
                    />,
                    <Button
                      key="delete"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteQuiz(quiz.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        count={quiz.questions.length}
                        style={{ backgroundColor: '#52c41a' }}
                      />
                    }
                    title={
                      <Space>
                        <span>{quiz.title}</span>
                        <Tag color={getDifficultyColor(quiz.difficulty)}>
                          {quiz.difficulty}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">{quiz.description}</Text>
                        <Space>
                          <Tag color="blue">{quiz.subject}</Tag>
                          <Tag color="purple">{quiz.topic}</Tag>
                          <Text type="secondary">
                            <ClockCircleOutlined /> {quiz.timeLimit}min
                          </Text>
                          <Text type="secondary">
                            Pass: {quiz.passingScore}%
                          </Text>
                        </Space>
                        <div>
                          {quiz.tags.map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Generate Quiz Modal */}
      <Modal
        title="Generate AI Quiz"
        open={showGenerateModal}
        onCancel={() => setShowGenerateModal(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          onFinish={generateQuiz}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
                <Select placeholder="Select subject">
                  <Option value="mathematics">Mathematics</Option>
                  <Option value="science">Science</Option>
                  <Option value="history">History</Option>
                  <Option value="literature">Literature</Option>
                  <Option value="computer-science">Computer Science</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="topic" label="Topic" rules={[{ required: true }]}>
                <Input placeholder="e.g., Calculus, World War II, Machine Learning" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="content" label="Content Source" rules={[{ required: true }]}>
            <TextArea
              rows={4}
              placeholder="Paste your study notes, textbook content, or any material for quiz generation..."
            />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="difficulty" label="Difficulty" initialValue="mixed">
                <Select>
                  <Option value="easy">Easy</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="hard">Hard</Option>
                  <Option value="mixed">Mixed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="questionCount" label="Number of Questions" initialValue={10}>
                <Slider min={5} max={50} marks={{ 5: '5', 10: '10', 25: '25', 50: '50' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="timePerQuestion" label="Time per Question (seconds)" initialValue={60}>
                <Slider min={30} max={180} step={30} marks={{ 30: '30s', 60: '1m', 120: '2m', 180: '3m' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="questionTypes" label="Question Types" initialValue={['multiple-choice', 'true-false']}>
            <Checkbox.Group>
              <Row>
                <Col span={8}>
                  <Checkbox value="multiple-choice">Multiple Choice</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="true-false">True/False</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="fill-blank">Fill in the Blank</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="short-answer">Short Answer</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="essay">Essay</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="includeExplanations" label="Include Explanations" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="includeHints" label="Include Hints" valuePropName="checked" initialValue={false}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isGenerating}>
                Generate Quiz
              </Button>
              <Button onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Quiz Taking Modal */}
      <Modal
        title={currentQuiz?.title}
        open={showQuizModal}
        onCancel={() => {
          if (isTakingQuiz) {
            Modal.confirm({
              title: 'Exit Quiz',
              content: 'Are you sure you want to exit? Your progress will be lost.',
              onOk: () => {
                setIsTakingQuiz(false);
                setTimerActive(false);
                setShowQuizModal(false);
              }
            });
          } else {
            setShowQuizModal(false);
          }
        }}
        footer={isTakingQuiz ? [
          <Button key="previous" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>,
          <Button key="next" type="primary" onClick={nextQuestion}>
            {currentQuestionIndex === (currentQuiz?.questions.length || 0) - 1 ? 'Finish' : 'Next'}
          </Button>
        ] : []}
        width={800}
        closable={!isTakingQuiz}
      >
        {currentQuiz && currentAttempt && (
          <div>
            {/* Quiz Header */}
            <div style={{ marginBottom: '24px' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Steps current={currentQuestionIndex} size="small">
                    {currentQuiz.questions.map((_, index) => (
                      <Step key={index} title={`Q${index + 1}`} />
                    ))}
                  </Steps>
                </Col>
                <Col>
                  <Space>
                    <Text>
                      <ClockCircleOutlined /> {formatTime(timeRemaining)}
                    </Text>
                    <Text>
                      Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                    </Text>
                  </Space>
                </Col>
              </Row>
              <Progress 
                percent={(currentQuestionIndex / currentQuiz.questions.length) * 100} 
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
            </div>

            {/* Question */}
            {currentQuestion && (
              <Card>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Title level={4}>{currentQuestion.question}</Title>
                    <Space>
                      <Tag color={getDifficultyColor(currentQuestion.difficulty)}>
                        {currentQuestion.difficulty}
                      </Tag>
                      <Tag>{currentQuestion.points} points</Tag>
                      {currentQuestion.timeLimit && (
                        <Tag color="blue">{currentQuestion.timeLimit}s</Tag>
                      )}
                    </Space>
                  </div>

                  {/* Question Input */}
                  <div>
                    {currentQuestion.type === 'multiple-choice' && (
                      <Radio.Group
                        value={currentAttempt.answers[currentQuestion.id]}
                        onChange={(e) => answerQuestion(currentQuestion.id, e.target.value)}
                      >
                        <Space direction="vertical">
                          {currentQuestion.options?.map((option, index) => (
                            <Radio key={index} value={index}>
                              {option}
                            </Radio>
                          ))}
                        </Space>
                      </Radio.Group>
                    )}

                    {currentQuestion.type === 'true-false' && (
                      <Radio.Group
                        value={currentAttempt.answers[currentQuestion.id]}
                        onChange={(e) => answerQuestion(currentQuestion.id, e.target.value)}
                      >
                        <Space direction="vertical">
                          <Radio value="true">True</Radio>
                          <Radio value="false">False</Radio>
                        </Space>
                      </Radio.Group>
                    )}

                    {currentQuestion.type === 'fill-blank' && (
                      <Input
                        value={currentAttempt.answers[currentQuestion.id] || ''}
                        onChange={(e) => answerQuestion(currentQuestion.id, e.target.value)}
                        placeholder="Enter your answer..."
                      />
                    )}

                    {currentQuestion.type === 'short-answer' && (
                      <TextArea
                        value={currentAttempt.answers[currentQuestion.id] || ''}
                        onChange={(e) => answerQuestion(currentQuestion.id, e.target.value)}
                        rows={4}
                        placeholder="Enter your answer..."
                      />
                    )}
                  </div>

                  {/* Hints */}
                  {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                    <Alert
                      message="Tips"
                      description={
                        <List
                          size="small"
                          dataSource={currentQuestion.hints}
                          renderItem={(hint) => <List.Item>{hint}</List.Item>}
                        />
                      }
                      type="info"
                      showIcon
                    />
                  )}
                </Space>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Quiz Results Modal */}
      <Modal
        title="Quiz Results"
        open={showResultsModal}
        onCancel={() => setShowResultsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowResultsModal(false)}>
            Close
          </Button>,
          <Button key="retake" type="primary" onClick={() => currentQuiz && startQuiz(currentQuiz)}>
            Retake Quiz
          </Button>
        ]}
        width={800}
      >
        {currentAttempt && currentQuiz && (
          <div>
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Score"
                    value={currentAttempt.score}
                    suffix={`/ ${currentAttempt.maxScore}`}
                    valueStyle={{ color: currentAttempt.passed ? '#3f8600' : '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Percentage"
                    value={currentAttempt.percentage}
                    suffix="%"
                    valueStyle={{ color: currentAttempt.passed ? '#3f8600' : '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Time Spent"
                    value={formatTime(currentAttempt.timeSpent)}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Result"
                    value={currentAttempt.passed ? 'PASSED' : 'FAILED'}
                    valueStyle={{ color: currentAttempt.passed ? '#3f8600' : '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Title level={4}>Question Review</Title>
            <List
              dataSource={currentQuiz.questions}
              renderItem={(question, index) => {
                const feedback = currentAttempt.feedback[question.id];
                return (
                  <List.Item>
                    <Card size="small" style={{ width: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Title level={5}>
                            Question {index + 1}
                            {feedback.correct ? (
                              <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} />
                            ) : (
                              <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} />
                            )}
                          </Title>
                          <Text>{question.question}</Text>
                        </div>
                        
                        <div>
                          <Text strong>Your Answer: </Text>
                          <Text>{feedback.userAnswer || 'Not answered'}</Text>
                        </div>
                        
                        <div>
                          <Text strong>Correct Answer: </Text>
                          <Text>{feedback.correctAnswer}</Text>
                        </div>
                        
                        {currentQuiz.showExplanations && (
                          <div>
                            <Text strong>Explanation: </Text>
                            <Text type="secondary">{feedback.explanation}</Text>
                          </div>
                        )}
                        
                        <div>
                          <Tag color={feedback.correct ? 'green' : 'red'}>
                            {feedback.correct ? 'Correct' : 'Incorrect'}
                          </Tag>
                          <Tag>{question.points} points</Tag>
                        </div>
                      </Space>
                    </Card>
                  </List.Item>
                );
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIQuizGenerator;
