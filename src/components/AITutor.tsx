import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Input, 
  Select, 
  Tabs, 
  Progress, 
  List, 
  Tag, 
  Badge, 
  Row, 
  Col, 
  Modal, 
  Alert, 
  Tooltip, 
  Avatar, 
  Rate, 
  Statistic, 
  Timeline, 
  Steps, 
  Divider, 
  Switch, 
  Slider, 
  Radio, 
  Checkbox, 
  Upload, 
  Spin, 
  Empty, 
  Pagination, 
  BackTop, 
  FloatButton, 
  notification, 
  message,
  Drawer
} from 'antd';
import {
  BarChartOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StarOutlined,
  FireOutlined,
  AimOutlined,
  MessageOutlined,
  BookOutlined,
  ClockCircleOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface StudySession {
  id: string;
  topic: string;
  duration: number;
  progress: number;
  score: number;
  timestamp: string;
  questions: number;
  correctAnswers: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concepts: string[];
  feedback: SessionFeedback;
  achievements: Achievement[];
  nextRecommendations: string[];
  studyMaterials: StudyMaterial[];
}

interface SessionFeedback {
  strengths: string[];
  improvements: string[];
  overallRating: number;
  comments: string;
  suggestions: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'progress' | 'mastery' | 'consistency' | 'engagement';
  points: number;
}

interface StudyMaterial {
  id: string;
  type: 'video' | 'article' | 'quiz' | 'exercise' | 'infographic' | 'podcast';
  title: string;
  url: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  completed: boolean;
  rating: number;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  completedLessons: number;
  totalLessons: number;
  prerequisites: string[];
  modules: LearningModule[];
  progress: number;
  estimatedCompletion: string;
  skills: string[];
  outcomes: string[];
  resources: StudyResource[];
  assessments: Assessment[];
  isAdaptive: boolean;
  personalizedContent: boolean;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites: string[];
  objectives: string[];
  activities: Activity[];
  resources: StudyResource[];
  assessments: Assessment[];
  completed: boolean;
  progress: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'interactive' | 'quiz' | 'exercise';
  duration: number;
  completed: boolean;
  progress: number;
  resources: StudyResource[];
  activities: Activity[];
}

interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'writing' | 'listening' | 'speaking' | 'practice' | 'simulation';
  duration: number;
  completed: boolean;
  score?: number;
  feedback?: string;
  resources: StudyResource[];
}

interface StudyResource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'interactive' | 'link' | 'book' | 'article';
  url: string;
  description: string;
  duration?: number;
  size?: number;
  format: string;
  tags: string[];
  rating: number;
  downloads: number;
  addedAt: string;
}

interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'test' | 'assignment' | 'project' | 'presentation';
  questions: QuizQuestion[];
  duration: number;
  passingScore: number;
  attempts: number;
  maxAttempts: number;
  bestScore: number;
  completed: boolean;
  feedback: AssessmentFeedback;
}

interface AssessmentFeedback {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: QuestionFeedback[];
}

interface QuestionFeedback {
  questionId: string;
  correct: boolean;
  userAnswer: number | string;
  correctAnswer: number | string;
  explanation: string;
  timeSpent: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay' | 'matching';
  category: string;
  tags: string[];
  timeLimit?: number;
  points: number;
  hints: string[];
  resources: StudyResource[];
  multimedia?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    caption?: string;
  };
}

export interface AITutorProfile {
  id: string;
  name: string;
  avatar: string;
  specialty: string[];
  teachingStyle: 'formal' | 'casual' | 'enthusiastic' | 'patient' | 'challenging';
  languages: string[];
  experience: number;
  rating: number;
  reviews: TutorReview[];
  availability: AvailabilitySlot[];
  certifications: Certification[];
  bio: string;
  expertise: ExpertiseArea[];
}

interface TutorReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  subject: string;
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  timezone: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialUrl?: string;
  verified: boolean;
}

interface ExpertiseArea {
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
  qualifications: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  grade: string;
  learningGoals: LearningGoal[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferences: StudentPreferences;
  progress: StudentProgress;
  achievements: Achievement[];
  studyHistory: StudySession[];
  strengths: string[];
  weaknesses: string[];
  interests: string[];
  timezone: string;
  language: string;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  milestones: Milestone[];
  completed: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
}

interface StudentPreferences {
  sessionDuration: number;
  preferredTimes: string[];
  breakFrequency: number;
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
  feedbackFrequency: 'immediate' | 'end-of-session' | 'weekly';
  notificationSettings: NotificationSettings;
  studyEnvironment: StudyEnvironment;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  studyReminders: boolean;
  achievementAlerts: boolean;
  progressUpdates: boolean;
}

interface StudyEnvironment {
  quietHours: string[];
  preferredLocation: string;
  distractions: string[];
  focusMusic: boolean;
  lightingPreference: string;
}

interface StudentProgress {
  overallProgress: number;
  subjectProgress: { [subject: string]: number };
  skillProgress: { [skill: string]: number };
  timeSpent: number;
  sessionsCompleted: number;
  averageScore: number;
  improvementRate: number;
  streakDays: number;
  lastActiveDate: string;
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
}

interface WeeklyStats {
  week: string;
  studyTime: number;
  sessions: number;
  averageScore: number;
  topicsStudied: string[];
  achievements: Achievement[];
}

interface MonthlyStats {
  month: string;
  studyTime: number;
  sessions: number;
  averageScore: number;
  topicsCompleted: string[];
  skillsImproved: string[];
  achievements: Achievement[];
}

export interface TutoringSession {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  topic: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'individual' | 'group';
  participants: string[];
  notes: SessionNote[];
  recordingUrl?: string;
  whiteboardUrl?: string;
  materials: StudyResource[];
  feedback: SessionFeedback;
  rating?: number;
  cost: number;
}

interface SessionNote {
  id: string;
  content: string;
  timestamp: string;
  author: 'student' | 'tutor' | 'system';
  type: 'text' | 'audio' | 'video' | 'drawing';
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  members: GroupMember[];
  sessions: GroupSession[];
  resources: StudyResource[];
  discussions: Discussion[];
  assignments: GroupAssignment[];
  isActive: boolean;
  maxMembers: number;
  createdBy: string;
  createdAt: string;
  tags: string[];
  privacy: 'public' | 'private' | 'invite-only';
}

interface GroupMember {
  userId: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  isActive: boolean;
  contributions: number;
}

interface GroupSession {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  host: string;
  participants: string[];
  recordingUrl?: string;
  notes: SessionNote[];
  materials: StudyResource[];
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  replies: DiscussionReply[];
  tags: string[];
  pinned: boolean;
  locked: boolean;
}

interface DiscussionReply {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  replies: DiscussionReply[];
}

interface GroupAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string[];
  submissions: AssignmentSubmission[];
  resources: StudyResource[];
  maxScore: number;
}

interface AssignmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  attachments: Attachment[];
  score?: number;
  feedback?: string;
  graded: boolean;
}

export interface AnalyticsData {
  studyTime: TimeAnalytics;
  performance: PerformanceAnalytics;
  engagement: EngagementAnalytics;
  progress: ProgressAnalytics;
  predictions: PredictionAnalytics;
}

interface TimeAnalytics {
  totalStudyTime: number;
  averageSessionDuration: number;
  studyTimeByDay: { [day: string]: number };
  studyTimeBySubject: { [subject: string]: number };
  peakStudyHours: number[];
  studyStreak: number;
  consistency: number;
}

interface PerformanceAnalytics {
  averageScore: number;
  scoreTrend: number[];
  subjectPerformance: { [subject: string]: number };
  difficultyPerformance: { [difficulty: string]: number };
  learningCurve: number[];
  masteryLevel: number;
  improvementRate: number;
}

interface EngagementAnalytics {
  sessionsPerWeek: number;
  loginFrequency: number;
  featureUsage: { [feature: string]: number };
  interactionRate: number;
  participationLevel: number;
  socialEngagement: number;
  contentCreation: number;
}

interface ProgressAnalytics {
  overallProgress: number;
  subjectProgress: { [subject: string]: number };
  skillProgress: { [skill: string]: number };
  goalCompletionRate: number;
  milestoneProgress: number;
  learningVelocity: number;
  retentionRate: number;
}

interface PredictionAnalytics {
  predictedSuccess: number;
  recommendedTopics: string[];
  optimalStudyTime: number;
  difficultyRecommendations: { [subject: string]: string };
  learningPathSuggestions: string[];
  riskFactors: string[];
  improvementOpportunities: string[];
}

const AITutor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tutor');
  const [currentTopic, setCurrentTopic] = useState('');
  const [userQuestion, setUserQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null);

  const mockLearningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Mathematics Fundamentals',
      description: 'Master basic mathematical concepts and problem-solving',
      difficulty: 'beginner',
      estimatedTime: 120,
      completedLessons: 0,
      totalLessons: 12,
      prerequisites: [],
      modules: [],
      progress: 0,
      estimatedCompletion: '2024-12-31',
      skills: ['algebra', 'geometry', 'trigonometry'],
      outcomes: ['problem solving', 'logical thinking'],
      resources: [],
      assessments: [],
      isAdaptive: true,
      personalizedContent: true
    },
    {
      id: '2',
      title: 'Advanced Physics',
      description: 'Explore complex physics concepts and applications',
      difficulty: 'advanced',
      estimatedTime: 200,
      completedLessons: 3,
      totalLessons: 20,
      prerequisites: ['basic physics', 'calculus'],
      modules: [],
      progress: 15,
      estimatedCompletion: '2025-03-15',
      skills: ['quantum mechanics', 'thermodynamics'],
      outcomes: ['scientific analysis', 'research skills'],
      resources: [],
      assessments: [],
      isAdaptive: true,
      personalizedContent: false
    }
  ];

  const mockQuiz: QuizQuestion[] = [
    {
      id: '1',
      question: 'What is the derivative of x²?',
      options: ['x', '2x', 'x²', '2'],
      correctAnswer: 1,
      explanation: 'The derivative of x² is 2x using the power rule.',
      difficulty: 'easy',
      type: 'multiple-choice',
      category: 'calculus',
      tags: ['derivatives', 'power rule'],
      points: 10,
      hints: ['Use the power rule: d/dx(x^n) = nx^(n-1)'],
      resources: [],
      multimedia: {
        type: 'image',
        url: '/images/derivative-formula.png',
        caption: 'Power rule formula'
      }
    },
    {
      id: '2',
      question: 'What is the integral of 2x?',
      options: ['x²', 'x² + C', '2x²', 'x + C'],
      correctAnswer: 1,
      explanation: 'The integral of 2x is x² + C, where C is the constant of integration.',
      difficulty: 'easy',
      type: 'multiple-choice',
      category: 'calculus',
      tags: ['integrals', 'integration'],
      points: 10,
      hints: ['Use the reverse of the power rule'],
      resources: []
    }
  ];

  const handleAskQuestion = () => {
    setIsGenerating(true);
    // Mock AI response
    setTimeout(() => {
      const response = `That's a great question about ${currentTopic}! Here's a detailed explanation: ${userQuestion}. Let me break this down for you step by step...`;
      setAiResponse(response);
      setIsGenerating(false);
    }, 2000);
  };

  const generateStudyPlan = () => {
    const plan = `
# Personalized Study Plan for ${currentTopic}

## Learning Objectives
- Master fundamental concepts
- Practice problem-solving techniques
- Apply knowledge to real-world scenarios

## Study Schedule
### Week 1: Foundation
- Day 1-2: Basic concepts and terminology
- Day 3-4: Core principles and theories
- Day 5-7: Practice problems and exercises

### Week 2: Application
- Day 1-3: Advanced topics and applications
- Day 4-5: Case studies and examples
- Day 6-7: Review and assessment

## Resources
- Video tutorials and lectures
- Interactive exercises
- Practice quizzes
- Study materials and notes

## Progress Tracking
- Daily checkpoints
- Weekly assessments
- Performance analytics
- Adaptive learning paths
    `;
    setAiResponse(plan);
  };

  const startStudySession = () => {
    setIsStudying(true);
    setStudyStartTime(new Date());
    // Mock study session
    const session: StudySession = {
      id: Date.now().toString(),
      topic: currentTopic,
      duration: 0,
      progress: 0,
      score: 0,
      timestamp: new Date().toISOString(),
      questions: 0,
      correctAnswers: 0,
      learningStyle: 'visual',
      difficulty: 'beginner',
      concepts: [],
      feedback: {
        strengths: [],
        improvements: [],
        overallRating: 0,
        comments: '',
        suggestions: []
      },
      achievements: [],
      nextRecommendations: [],
      studyMaterials: []
    };
    setStudySessions([session, ...studySessions]);
  };

  const stopStudySession = () => {
    if (studyStartTime) {
      Math.round((Date.now() - studyStartTime.getTime()) / 1000 / 60);
      setIsStudying(false);
      setStudyStartTime(null);
    }
  };

  const startQuiz = () => {
    setCurrentQuiz(mockQuiz);
    setQuizIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[quizIndex] = answerIndex;
    setSelectedAnswers(newAnswers);

    if (quizIndex < currentQuiz.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateQuizScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === currentQuiz[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / currentQuiz.length) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      case 'beginner': return 'green';
      case 'intermediate': return 'orange';
      case 'advanced': return 'red';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <Space>
          <RobotOutlined />
          AI Personal Tutor
        </Space>
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="AI Tutor" key="tutor">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Ask Your Tutor" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Topic:</Text>
                    <Input
                      placeholder="What are you studying?"
                      value={currentTopic}
                      onChange={(e) => setCurrentTopic(e.target.value)}
                      style={{ marginTop: '8px' }}
                    />
                  </div>

                  <div>
                    <Text strong>Your Question:</Text>
                    <TextArea
                      placeholder="Ask anything about your topic..."
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      rows={4}
                      style={{ marginTop: '8px' }}
                    />
                  </div>

                  <Space>
                    <Button
                      type="primary"
                      icon={<MessageOutlined />}
                      onClick={handleAskQuestion}
                      loading={isGenerating}
                      disabled={!userQuestion || !currentTopic}
                    >
                      Ask Question
                    </Button>
                    <Button
                      icon={<BookOutlined />}
                      onClick={generateStudyPlan}
                      disabled={!currentTopic}
                    >
                      Generate Study Plan
                    </Button>
                  </Space>

                  {isStudying ? (
                    <Button
                      type="primary"
                      danger
                      icon={<PauseCircleOutlined />}
                      onClick={stopStudySession}
                      block
                    >
                      Stop Study Session
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={startStudySession}
                      disabled={!currentTopic}
                      block
                    >
                      Start Study Session
                    </Button>
                  )}
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="AI Response" size="small">
                {aiResponse ? (
                  <Paragraph style={{ whiteSpace: 'pre-line' }}>
                    {aiResponse}
                  </Paragraph>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <RobotOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                    <div style={{ marginTop: '16px' }}>
                      <Text type="secondary">AI tutor responses will appear here</Text>
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Learning Paths" key="paths">
          <Card>
            <List
              dataSource={mockLearningPaths}
              renderItem={(path) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>{path.title}</Text>
                        <Tag color={getDifficultyColor(path.difficulty)} style={{ marginLeft: '8px' }}>
                          {path.difficulty}
                        </Tag>
                      </div>
                      <Text type="secondary">{path.description}</Text>
                      <div>
                        <Progress
                          percent={Math.round((path.completedLessons / path.totalLessons) * 100)}
                          size="small"
                        />
                        <Text style={{ marginLeft: '8px' }}>
                          {path.completedLessons}/{path.totalLessons} lessons
                        </Text>
                      </div>
                      <div>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        <Text>{path.estimatedTime} minutes estimated</Text>
                      </div>
                      <Button type="primary" size="small">
                        Continue Learning
                      </Button>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Practice Quiz" key="quiz">
          <Card>
            {currentQuiz.length > 0 ? (
              !showResults ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Badge count={`${quizIndex + 1}/${currentQuiz.length}`} style={{ backgroundColor: '#52c41a' }}>
                      <Title level={4}>Question {quizIndex + 1}</Title>
                    </Badge>
                  </div>
                  
                  <Paragraph>{currentQuiz[quizIndex].question}</Paragraph>
                  
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {currentQuiz[quizIndex].options.map((option, index) => (
                      <Button
                        key={index}
                        block
                        type={selectedAnswers[quizIndex] === index ? 'primary' : 'default'}
                        onClick={() => handleQuizAnswer(index)}
                      >
                        {option}
                      </Button>
                    ))}
                  </Space>

                  <div>
                    <Tag color={getDifficultyColor(currentQuiz[quizIndex].difficulty)}>
                      {currentQuiz[quizIndex].difficulty}
                    </Tag>
                  </div>
                </Space>
              ) : (
                <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
                  <TrophyOutlined style={{ fontSize: '64px', color: '#faad14' }} />
                  <Title level={3}>Quiz Complete!</Title>
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {calculateQuizScore()}%
                    </Text>
                    <div style={{ marginTop: '8px' }}>
                      <Text>
                        {selectedAnswers.filter((answer, index) => answer === currentQuiz[index].correctAnswer).length} of {currentQuiz.length} correct
                      </Text>
                    </div>
                  </div>
                  <Button type="primary" onClick={startQuiz}>
                    Try Another Quiz
                  </Button>
                </Space>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Title level={4}>Ready to test your knowledge?</Title>
                <Paragraph>Take a personalized quiz to reinforce your learning</Paragraph>
                <Button type="primary" icon={<AimOutlined />} onClick={startQuiz}>
                  Start Quiz
                </Button>
              </div>
            )}
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Progress Analytics" key="analytics">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card size="small" title="Study Streak">
                <div style={{ textAlign: 'center' }}>
                  <FireOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>7 days</Text>
                  </div>
                  <Text type="secondary">Keep up the great work!</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card size="small" title="Total Study Time">
                <div style={{ textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>12.5 hours</Text>
                  </div>
                  <Text type="secondary">This month</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card size="small" title="Quiz Average">
                <div style={{ textAlign: 'center' }}>
                  <BarChartOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>85%</Text>
                  </div>
                  <Text type="secondary">Great job!</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card size="small" title="Topics Mastered">
                <div style={{ textAlign: 'center' }}>
                  <StarOutlined style={{ fontSize: '32px', color: '#faad14' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>12</Text>
                  </div>
                  <Text type="secondary">Topics completed</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AITutor;
