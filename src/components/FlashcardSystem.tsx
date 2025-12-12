import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Input, 
  Modal, 
  message, 
  Tabs, 
  List, 
  Tag, 
  Progress, 
  Rate, 
  Select, 
  Row, 
  Col, 
  Badge, 
  Tooltip, 
  Dropdown, 
  Menu, 
  Switch, 
  Slider, 
  Alert, 
  Divider,
  Statistic,
  Avatar,
  Upload,
  Checkbox,
  Radio
} from 'antd';
import { 
  QuestionCircleOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  StarOutlined,
  FireOutlined,
  TrophyOutlined,
  BulbOutlined,
  EyeOutlined,
  SoundOutlined,
  ImageOutlined,
  UploadOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  SettingOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ReloadOutlined,
  PauseOutlined,
  SkipForwardOutlined,
  UndoOutlined,
  RedoOutlined,
  HeartOutlined,
  HeartFilled,
  ExclamationCircleOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// Enhanced Interfaces
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
  lastReviewed?: string;
  reviewCount: number;
  masteryLevel: number; // 0-5
  nextReview?: string;
  easeFactor?: number;
  interval?: number;
  repetitions?: number;
  image?: string;
  audioQuestion?: string;
  audioAnswer?: string;
  aiGenerated?: boolean;
  aiHints?: string[];
  aiExplanation?: string;
  relatedCards?: string[];
  isFavorite?: boolean;
  studyStreak?: number;
  averageResponseTime?: number;
}

interface FlashcardSet {
  id: string;
  name: string;
  description: string;
  category: string;
  flashcards: Flashcard[];
  createdAt: string;
  tags: string[];
  isPublic: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedStudyTime: number;
  shareCount: number;
  rating: number;
  aiOptimized?: boolean;
}

interface StudySession {
  id: string;
  setId: string;
  startTime: string;
  endTime?: string;
  cardsStudied: string[];
  correctAnswers: number;
  totalAnswers: number;
  averageResponseTime: number;
  studyMode: 'review' | 'test' | 'spaced' | 'adaptive';
  settings: StudySettings;
}

interface StudySettings {
  showHints: boolean;
  showExplanations: boolean;
  adaptiveDifficulty: boolean;
  timeLimit?: number;
  cardOrder: 'sequential' | 'random' | 'spaced';
  includeImages: boolean;
  includeAudio: boolean;
  spacedRepetitionEnabled: boolean;
}

interface AIGenerationRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  includeImages: boolean;
  includeAudio: boolean;
  language: string;
  style: 'qa' | 'multiple_choice' | 'fill_blank' | 'true_false';
}

interface StudyAnalytics {
  totalCards: number;
  masteredCards: number;
  averageMastery: number;
  studyStreak: number;
  totalTime: number;
  averageResponseTime: number;
  retentionRate: number;
  difficultyProgress: {
    easy: number;
    medium: number;
    hard: number;
  };
  categoryProgress: { [key: string]: number };
  dailyStudyTime: { date: string; minutes: number }[];
}

interface SpacedRepetitionConfig {
  easeFactor: number;
  minimumInterval: number;
  maximumInterval: number;
  intervalModifier: number;
  graduationInterval: number;
  startingEase: number;
  easyBonus: number;
  intervalFactor: number;
}

const FlashcardSystem: React.FC = () => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([
    {
      id: '1',
      name: 'Machine Learning Basics',
      description: 'Fundamental concepts in machine learning',
      category: 'Computer Science',
      flashcards: [
        {
          id: '1',
          question: 'What is machine learning?',
          answer: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
          category: 'Machine Learning',
          difficulty: 'easy',
          tags: ['basics', 'definition'],
          createdAt: new Date().toISOString(),
          lastReviewed: new Date(Date.now() - 86400000).toISOString(),
          reviewCount: 3,
          masteryLevel: 4
        },
        {
          id: '2',
          question: 'What is the difference between supervised and unsupervised learning?',
          answer: 'Supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data without explicit guidance.',
          category: 'Machine Learning',
          difficulty: 'medium',
          tags: ['supervised', 'unsupervised', 'comparison'],
          createdAt: new Date().toISOString(),
          reviewCount: 1,
          masteryLevel: 2
        }
      ],
      createdAt: new Date().toISOString()
    }
  ]);

  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createSetModalVisible, setCreateSetModalVisible] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  
  const [flashcardForm, setFlashcardForm] = useState({
    question: '',
    answer: '',
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    tags: [] as string[]
  });
  
  const [setForm, setSetForm] = useState({
    name: '',
    description: '',
    category: ''
  });
  
  const [newTag, setNewTag] = useState('');
  const [studyStats, setStudyStats] = useState({
    totalReviewed: 0,
    correctAnswers: 0,
    incorrectAnswers: 0
  });

  // Enhanced AI-Powered State
  const [aiGenerationModal, setAiGenerationModal] = useState(false);
  const [aiRequest, setAiRequest] = useState<AIGenerationRequest>({
    topic: '',
    difficulty: 'medium',
    count: 10,
    includeImages: false,
    includeAudio: false,
    language: 'en',
    style: 'qa'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [studySettings, setStudySettings] = useState<StudySettings>({
    showHints: true,
    showExplanations: true,
    adaptiveDifficulty: true,
    cardOrder: 'spaced',
    includeImages: true,
    includeAudio: true,
    spacedRepetitionEnabled: true
  });
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null);
  const [analyticsVisible, setAnalyticsVisible] = useState(false);
  const [spacedConfig, setSpacedConfig] = useState<SpacedRepetitionConfig>({
    easeFactor: 2.5,
    minimumInterval: 1,
    maximumInterval: 36500,
    intervalModifier: 1.0,
    graduationInterval: 1,
    startingEase: 2.5,
    easyBonus: 1.3,
    intervalFactor: 2.5
  });
  const [currentResponseTime, setCurrentResponseTime] = useState(0);
  const [responseStartTime, setResponseStartTime] = useState(Date.now());
  const [aiHints, setAiHints] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [studyStreak, setStudyStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [favoriteCards, setFavoriteCards] = useState<string[]>([]);
  const [cardHistory, setCardHistory] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const difficultyColors = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  };

  const getMasteryColor = (level: number) => {
    if (level >= 4) return 'green';
    if (level >= 2) return 'orange';
    return 'red';
  };

  // AI-Powered Functions
  const generateAIFlashcards = useCallback(async () => {
    if (!aiRequest.topic.trim()) {
      message.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const generatedCards: Flashcard[] = Array.from({ length: aiRequest.count }, (_, index) => ({
        id: `ai-${Date.now()}-${index}`,
        question: `AI Generated Question ${index + 1} about ${aiRequest.topic}`,
        answer: `AI Generated Answer ${index + 1} explaining the concept in detail`,
        category: aiRequest.topic,
        difficulty: aiRequest.difficulty,
        tags: ['ai-generated', aiRequest.topic],
        createdAt: new Date().toISOString(),
        reviewCount: 0,
        masteryLevel: 0,
        aiGenerated: true,
        aiHints: [`Hint ${index + 1}: Think about the key concepts`],
        aiExplanation: `This card was AI-generated based on ${aiRequest.topic}`,
        isFavorite: false,
        studyStreak: 0,
        averageResponseTime: 0
      }));

      const newSet: FlashcardSet = {
        id: Date.now().toString(),
        name: `AI Generated: ${aiRequest.topic}`,
        description: `AI-generated flashcards about ${aiRequest.topic}`,
        category: aiRequest.topic,
        flashcards: generatedCards,
        createdAt: new Date().toISOString(),
        tags: ['ai-generated'],
        isPublic: false,
        difficulty: aiRequest.difficulty === 'easy' ? 'beginner' : aiRequest.difficulty === 'medium' ? 'intermediate' : 'advanced',
        estimatedStudyTime: generatedCards.length * 2,
        shareCount: 0,
        rating: 0,
        aiOptimized: true
      };

      setFlashcardSets(prev => [newSet, ...prev]);
      setAiGenerationModal(false);
      message.success(`Generated ${aiRequest.count} flashcards about ${aiRequest.topic}`);
    } catch (error) {
      message.error('Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  }, [aiRequest]);

  const calculateSpacedRepetition = useCallback((card: Flashcard, quality: number) => {
    let easeFactor = card.easeFactor || spacedConfig.startingEase;
    let interval = card.interval || spacedConfig.minimumInterval;
    let repetitions = card.repetitions || 0;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor * spacedConfig.intervalFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    return {
      easeFactor,
      interval,
      repetitions,
      nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000).toISOString()
    };
  }, [spacedConfig]);

  const startStudySession = useCallback((setId: string, mode: StudySession['studyMode']) => {
    const session: StudySession = {
      id: Date.now().toString(),
      setId,
      startTime: new Date().toISOString(),
      cardsStudied: [],
      correctAnswers: 0,
      totalAnswers: 0,
      averageResponseTime: 0,
      studyMode: mode,
      settings: studySettings
    };
    setStudySession(session);
    setSelectedSet(flashcardSets.find(set => set.id === setId) || null);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyMode(true);
    setResponseStartTime(Date.now());
  }, [flashcardSets, studySettings]);

  const recordAnswer = useCallback((cardId: string, correct: boolean) => {
    const responseTime = Date.now() - responseStartTime;
    setCurrentResponseTime(responseTime);

    if (!studySession) return;

    const updatedSession = {
      ...studySession,
      cardsStudied: [...studySession.cardsStudied, cardId],
      correctAnswers: studySession.correctAnswers + (correct ? 1 : 0),
      totalAnswers: studySession.totalAnswers + 1,
      averageResponseTime: (studySession.averageResponseTime * studySession.totalAnswers + responseTime) / (studySession.totalAnswers + 1)
    };

    setStudySession(updatedSession);

    // Update flashcard with spaced repetition
    const quality = correct ? 4 : 2;
    if (selectedSet) {
      const updatedCards = selectedSet.flashcards.map(card => {
        if (card.id === cardId) {
          const spacedData = calculateSpacedRepetition(card, quality);
          return {
            ...card,
            lastReviewed: new Date().toISOString(),
            reviewCount: card.reviewCount + 1,
            masteryLevel: Math.min(5, card.masteryLevel + (correct ? 1 : -1)),
            ...spacedData,
            averageResponseTime: (card.averageResponseTime * card.reviewCount + responseTime) / (card.reviewCount + 1)
          };
        }
        return card;
      });

      setSelectedSet({ ...selectedSet, flashcards: updatedCards });
      setFlashcardSets(prev => prev.map(set => 
        set.id === selectedSet.id ? { ...selectedSet, flashcards: updatedCards } : set
      ));
    }
  }, [studySession, selectedSet, responseStartTime, calculateSpacedRepetition]);

  const generateAIHints = useCallback((card: Flashcard) => {
    const hints = [
      `Hint 1: Focus on the main concept of ${card.question.split(' ').slice(-3).join(' ')}`,
      `Hint 2: Consider the context of ${card.category}`,
      `Hint 3: Think about related terms: ${card.tags.join(', ')}`
    ];
    setAiHints(hints);
    setShowHints(true);
  }, []);

  const generateAIExplanation = useCallback((card: Flashcard) => {
    const explanation = `This question tests your understanding of ${card.category}. The key concept here is ${card.question.split(' ').slice(0, 3).join(' ')} which relates to ${card.tags.join(' and ')}. The answer demonstrates ${card.difficulty === 'easy' ? 'basic' : card.difficulty === 'medium' ? 'intermediate' : 'advanced'} knowledge in this area.`;
    setAiExplanation(explanation);
    setShowExplanation(true);
  }, []);

  const updateStudyStreak = useCallback(() => {
    const today = new Date().toDateString();
    if (lastStudyDate === today) return;
    
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    if (lastStudyDate === yesterday) {
      setStudyStreak(prev => prev + 1);
    } else {
      setStudyStreak(1);
    }
    setLastStudyDate(today);
  }, [lastStudyDate]);

  const generateAnalytics = useCallback(() => {
    const allCards = flashcardSets.flatMap(set => set.flashcards);
    const totalCards = allCards.length;
    const masteredCards = allCards.filter(card => card.masteryLevel >= 4).length;
    const averageMastery = allCards.reduce((sum, card) => sum + card.masteryLevel, 0) / totalCards || 0;
    
    const categoryProgress: { [key: string]: number } = {};
    allCards.forEach(card => {
      if (!categoryProgress[card.category]) {
        categoryProgress[card.category] = 0;
      }
      categoryProgress[card.category] += card.masteryLevel;
    });
    
    Object.keys(categoryProgress).forEach(category => {
      const categoryCards = allCards.filter(card => card.category === category);
      categoryProgress[category] = categoryProgress[category] / categoryCards.length;
    });

    const analyticsData: StudyAnalytics = {
      totalCards,
      masteredCards,
      averageMastery,
      studyStreak,
      totalTime: studySession ? (Date.now() - new Date(studySession.startTime).getTime()) / 1000 / 60 : 0,
      averageResponseTime: allCards.reduce((sum, card) => sum + (card.averageResponseTime || 0), 0) / totalCards || 0,
      retentionRate: masteredCards / totalCards * 100,
      difficultyProgress: {
        easy: allCards.filter(card => card.difficulty === 'easy').reduce((sum, card) => sum + card.masteryLevel, 0) / allCards.filter(card => card.difficulty === 'easy').length || 0,
        medium: allCards.filter(card => card.difficulty === 'medium').reduce((sum, card) => sum + card.masteryLevel, 0) / allCards.filter(card => card.difficulty === 'medium').length || 0,
        hard: allCards.filter(card => card.difficulty === 'hard').reduce((sum, card) => sum + card.masteryLevel, 0) / allCards.filter(card => card.difficulty === 'hard').length || 0
      },
      categoryProgress,
      dailyStudyTime: [
        { date: new Date().toISOString().split('T')[0], minutes: 30 }
      ]
    };

    setAnalytics(analyticsData);
    setAnalyticsVisible(true);
  }, [flashcardSets, studySession, studyStreak]);

  useEffect(() => {
    updateStudyStreak();
  }, [updateStudyStreak]);

  const createFlashcard = () => {
    if (!selectedSet) return;
    
    const newFlashcard: Flashcard = {
      id: Date.now().toString(),
      question: flashcardForm.question,
      answer: flashcardForm.answer,
      category: flashcardForm.category,
      difficulty: flashcardForm.difficulty,
      tags: flashcardForm.tags,
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      masteryLevel: 0
    };

    const updatedSet = {
      ...selectedSet,
      flashcards: [...selectedSet.flashcards, newFlashcard]
    };

    setSelectedSet(updatedSet);
    setFlashcardSets(prev => prev.map(set => 
      set.id === selectedSet.id ? updatedSet : set
    ));

    setCreateModalVisible(false);
    resetFlashcardForm();
    message.success('Flashcard created successfully');
  };

  const updateFlashcard = () => {
    if (!selectedSet || !editingFlashcard) return;

    const updatedFlashcard = {
      ...editingFlashcard,
      question: flashcardForm.question,
      answer: flashcardForm.answer,
      category: flashcardForm.category,
      difficulty: flashcardForm.difficulty,
      tags: flashcardForm.tags
    };

    const updatedSet = {
      ...selectedSet,
      flashcards: selectedSet.flashcards.map(card => 
        card.id === editingFlashcard.id ? updatedFlashcard : card
      )
    };

    setSelectedSet(updatedSet);
    setFlashcardSets(prev => prev.map(set => 
      set.id === selectedSet.id ? updatedSet : set
    ));

    setEditModalVisible(false);
    setEditingFlashcard(null);
    resetFlashcardForm();
    message.success('Flashcard updated successfully');
  };

  const deleteFlashcard = (flashcardId: string) => {
    if (!selectedSet) return;

    const updatedSet = {
      ...selectedSet,
      flashcards: selectedSet.flashcards.filter(card => card.id !== flashcardId)
    };

    setSelectedSet(updatedSet);
    setFlashcardSets(prev => prev.map(set => 
      set.id === selectedSet.id ? updatedSet : set
    ));

    message.success('Flashcard deleted');
  };

  const createFlashcardSet = () => {
    const newSet: FlashcardSet = {
      id: Date.now().toString(),
      name: setForm.name,
      description: setForm.description,
      category: setForm.category,
      flashcards: [],
      createdAt: new Date().toISOString()
    };

    setFlashcardSets(prev => [newSet, ...prev]);
    setCreateSetModalVisible(false);
    resetSetForm();
    message.success('Flashcard set created successfully');
  };

  const startStudyMode = (flashcardSet: FlashcardSet) => {
    setSelectedSet(flashcardSet);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyMode(true);
    setStudyStats({
      totalReviewed: 0,
      correctAnswers: 0,
      incorrectAnswers: 0
    });
  };

  const nextCard = (correct: boolean) => {
    if (!selectedSet) return;

    // Update study stats
    setStudyStats(prev => ({
      totalReviewed: prev.totalReviewed + 1,
      correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      incorrectAnswers: prev.incorrectAnswers + (correct ? 0 : 1)
    }));

    // Update flashcard mastery
    const currentCard = selectedSet.flashcards[currentCardIndex];
    const updatedMastery = correct ? Math.min(5, currentCard.masteryLevel + 1) : Math.max(0, currentCard.masteryLevel - 1);
    
    const updatedCard = {
      ...currentCard,
      masteryLevel: updatedMastery,
      lastReviewed: new Date().toISOString(),
      reviewCount: currentCard.reviewCount + 1
    };

    const updatedSet = {
      ...selectedSet,
      flashcards: selectedSet.flashcards.map(card => 
        card.id === currentCard.id ? updatedCard : card
      )
    };

    setSelectedSet(updatedSet);
    setFlashcardSets(prev => prev.map(set => 
      set.id === selectedSet.id ? updatedSet : set
    ));

    // Move to next card
    if (currentCardIndex < selectedSet.flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // End of study session
      setStudyMode(false);
      Modal.success({
        title: 'Study Session Complete!',
        content: (
          <Space direction="vertical">
            <Text>Total cards reviewed: {studyStats.totalReviewed + 1}</Text>
            <Text>Correct answers: {studyStats.correctAnswers + (correct ? 1 : 0)}</Text>
            <Text>Accuracy: {Math.round(((studyStats.correctAnswers + (correct ? 1 : 0)) / (studyStats.totalReviewed + 1)) * 100)}%</Text>
          </Space>
        )
      });
    }
  };

  const startEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setFlashcardForm({
      question: flashcard.question,
      answer: flashcard.answer,
      category: flashcard.category,
      difficulty: flashcard.difficulty,
      tags: flashcard.tags
    });
    setEditModalVisible(true);
  };

  const resetFlashcardForm = () => {
    setFlashcardForm({
      question: '',
      answer: '',
      category: '',
      difficulty: 'medium',
      tags: []
    });
    setNewTag('');
  };

  const resetSetForm = () => {
    setSetForm({
      name: '',
      description: '',
      category: ''
    });
  };

  const addTag = () => {
    if (newTag.trim() && !flashcardForm.tags.includes(newTag.trim())) {
      setFlashcardForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFlashcardForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const currentCard = selectedSet?.flashcards[currentCardIndex];

  return (
    <Card title="Flashcard System" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Header with Create Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Flashcard Sets</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateSetModalVisible(true)}
          >
            Create Set
          </Button>
        </div>

        {/* Flashcard Sets List */}
        <List
          dataSource={flashcardSets}
          renderItem={(flashcardSet) => (
            <List.Item
              actions={[
                <Button 
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => startStudyMode(flashcardSet)}
                >
                  Study
                </Button>,
                <Button 
                  type="text"
                  icon={<BookOutlined />}
                  onClick={() => setSelectedSet(flashcardSet)}
                >
                  View
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    {flashcardSet.name}
                    <Tag color="blue">{flashcardSet.category}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">{flashcardSet.description}</Text>
                    <Space>
                      <Text strong>{flashcardSet.flashcards.length} cards</Text>
                      <Text type="secondary">
                        Created {new Date(flashcardSet.createdAt).toLocaleDateString()}
                      </Text>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />

        {/* Selected Set Details */}
        {selectedSet && !studyMode && (
          <Card title={selectedSet.name}>
            <Tabs defaultActiveKey="cards">
              <TabPane tab="Flashcards" key="cards">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={5}>All Flashcards</Title>
                    <Button 
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setCreateModalVisible(true)}
                    >
                      Add Flashcard
                    </Button>
                  </div>
                  
                  <List
                    dataSource={selectedSet.flashcards}
                    renderItem={(flashcard) => (
                      <List.Item
                        actions={[
                          <Button 
                            type="text" 
                            icon={<EditOutlined />}
                            onClick={() => startEditFlashcard(flashcard)}
                          />,
                          <Button 
                            type="text" 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteFlashcard(flashcard.id)}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<QuestionCircleOutlined />}
                          title={
                            <Space>
                              {flashcard.question}
                              <Tag color={difficultyColors[flashcard.difficulty]}>
                                {flashcard.difficulty}
                              </Tag>
                              <Tag color={getMasteryColor(flashcard.masteryLevel)}>
                                Mastery: {flashcard.masteryLevel}/5
                              </Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size="small">
                              <Text type="secondary">{flashcard.answer}</Text>
                              <Space wrap>
                                {flashcard.tags.map((tag, index) => (
                                  <Tag key={index}>{tag}</Tag>
                                ))}
                              </Space>
                              <Space>
                                <ClockCircleOutlined />
                                <Text type="secondary">
                                  Reviewed {flashcard.reviewCount} times
                                </Text>
                                {flashcard.lastReviewed && (
                                  <Text type="secondary">
                                    • Last: {new Date(flashcard.lastReviewed).toLocaleDateString()}
                                  </Text>
                                )}
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Space>
              </TabPane>
              
              <TabPane tab="Statistics" key="stats">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Title level={5}>Set Statistics</Title>
                  <Space>
                    <Text strong>Total Cards:</Text>
                    <Text>{selectedSet.flashcards.length}</Text>
                  </Space>
                  
                  <div>
                    <Text strong>Difficulty Distribution:</Text>
                    <Space wrap style={{ marginTop: 8 }}>
                      {Object.entries(difficultyColors).map(([difficulty, color]) => {
                        const count = selectedSet.flashcards.filter(card => card.difficulty === difficulty).length;
                        return (
                          <Tag key={difficulty} color={color}>
                            {difficulty}: {count}
                          </Tag>
                        );
                      })}
                    </Space>
                  </div>
                  
                  <div>
                    <Text strong>Mastery Levels:</Text>
                    <div style={{ marginTop: 8 }}>
                      {[0, 1, 2, 3, 4, 5].map(level => {
                        const count = selectedSet.flashcards.filter(card => card.masteryLevel === level).length;
                        return (
                          <div key={level} style={{ marginBottom: 4 }}>
                            <Space>
                              <Rate disabled count={1} value={level > 0 ? 1 : 0} />
                              <Text>Level {level}:</Text>
                              <Progress 
                                percent={selectedSet.flashcards.length > 0 ? (count / selectedSet.flashcards.length) * 100 : 0}
                                size="small"
                                style={{ width: 100 }}
                              />
                              <Text>{count} cards</Text>
                            </Space>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Space>
              </TabPane>
            </Tabs>
          </Card>
        )}

        {/* Study Mode */}
        {studyMode && currentCard && (
          <Card title="Study Mode" style={{ textAlign: 'center' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary">
                  Card {currentCardIndex + 1} of {selectedSet?.flashcards.length}
                </Text>
                <Progress 
                  percent={((currentCardIndex + 1) / (selectedSet?.flashcards.length || 1)) * 100}
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </div>

              <Card>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <QuestionCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <Title level={4} style={{ marginTop: 8 }}>
                      {currentCard.question}
                    </Title>
                    <Space>
                      <Tag color={difficultyColors[currentCard.difficulty]}>
                        {currentCard.difficulty}
                      </Tag>
                      <Rate disabled value={currentCard.masteryLevel} />
                    </Space>
                  </div>

                  {showAnswer && (
                    <div>
                      <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                      <Title level={5} style={{ marginTop: 8 }}>Answer:</Title>
                      <Paragraph>{currentCard.answer}</Paragraph>
                      <Space wrap>
                        {currentCard.tags.map((tag, index) => (
                          <Tag key={index}>{tag}</Tag>
                        ))}
                      </Space>
                    </div>
                  )}
                </Space>
              </Card>

              <Space size="large">
                {!showAnswer ? (
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => setShowAnswer(true)}
                  >
                    Show Answer
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="large"
                      icon={<CloseCircleOutlined />}
                      onClick={() => nextCard(false)}
                      danger
                    >
                      Incorrect
                    </Button>
                    <Button 
                      type="primary"
                      size="large"
                      icon={<CheckCircleOutlined />}
                      onClick={() => nextCard(true)}
                    >
                      Correct
                    </Button>
                  </>
                )}
              </Space>
            </Space>
          </Card>
        )}

        {/* Create Flashcard Modal */}
        <Modal
          title="Create Flashcard"
          open={createModalVisible}
          onOk={createFlashcard}
          onCancel={() => {
            setCreateModalVisible(false);
            resetFlashcardForm();
          }}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <TextArea
              placeholder="Question"
              value={flashcardForm.question}
              onChange={(e) => setFlashcardForm(prev => ({ ...prev, question: e.target.value }))}
              rows={3}
            />
            <TextArea
              placeholder="Answer"
              value={flashcardForm.answer}
              onChange={(e) => setFlashcardForm(prev => ({ ...prev, answer: e.target.value }))}
              rows={4}
            />
            <Input
              placeholder="Category"
              value={flashcardForm.category}
              onChange={(e) => setFlashcardForm(prev => ({ ...prev, category: e.target.value }))}
            />
            <Select
              value={flashcardForm.difficulty}
              onChange={(value) => setFlashcardForm(prev => ({ ...prev, difficulty: value }))}
              style={{ width: '100%' }}
            >
              <Select.Option value="easy">Easy</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="hard">Hard</Select.Option>
            </Select>
            
            <div>
              <Text strong>Tags:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onPressEnter={addTag}
                />
                <Button onClick={addTag}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {flashcardForm.tags.map((tag, index) => (
                  <Tag key={index} closable onClose={() => removeTag(tag)}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>

        {/* Edit Flashcard Modal */}
        <Modal
          title="Edit Flashcard"
          open={editModalVisible}
          onOk={updateFlashcard}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingFlashcard(null);
            resetFlashcardForm();
          }}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <TextArea
              placeholder="Question"
              value={flashcardForm.question}
              onChange={(e) => setFlashcardForm(prev => ({ ...prev, question: e.target.value }))}
              rows={3}
            />
            <TextArea
              placeholder="Answer"
              value={flashcardForm.answer}
              onChange={(e) => setFlashcardForm(prev => ({ ...prev, answer: e.target.value }))}
              rows={4}
            />
            <Input
              placeholder="Category"
              value={flashcardForm.category}
              onChange={(e) => setFlashcardForm(prev => ({ ...prev, category: e.target.value }))}
            />
            <Select
              value={flashcardForm.difficulty}
              onChange={(value) => setFlashcardForm(prev => ({ ...prev, difficulty: value }))}
              style={{ width: '100%' }}
            >
              <Select.Option value="easy">Easy</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="hard">Hard</Select.Option>
            </Select>
            
            <div>
              <Text strong>Tags:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onPressEnter={addTag}
                />
                <Button onClick={addTag}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {flashcardForm.tags.map((tag, index) => (
                  <Tag key={index} closable onClose={() => removeTag(tag)}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>

        {/* Create Set Modal */}
        <Modal
          title="Create Flashcard Set"
          open={createSetModalVisible}
          onOk={createFlashcardSet}
          onCancel={() => {
            setCreateSetModalVisible(false);
            resetSetForm();
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Set Name"
              value={setForm.name}
              onChange={(e) => setSetForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextArea
              placeholder="Description"
              value={setForm.description}
              onChange={(e) => setSetForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Input
              placeholder="Category"
              value={setForm.category}
              onChange={(e) => setSetForm(prev => ({ ...prev, category: e.target.value }))}
            />
          </Space>
        </Modal>
      </Space>
    </Card>
  );
};

export default FlashcardSystem;
