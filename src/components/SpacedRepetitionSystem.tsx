import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Typography, Space, Tag, Badge, Row, Col, List, Avatar } from 'antd';
import { ExperimentOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: number; // 1-5 scale
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  correctCount: number;
  interval: number; // days until next review
  easinessFactor: number;
}

interface SpacedRepetitionSystemProps {
  onStudyComplete?: (stats: StudyStats) => void;
}

interface StudyStats {
  cardsStudied: number;
  correctAnswers: number;
  totalTime: number;
  averageDifficulty: number;
}

const SpacedRepetitionSystem: React.FC<SpacedRepetitionSystemProps> = ({ onStudyComplete }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: '1',
      question: 'What is React?',
      answer: 'A JavaScript library for building user interfaces',
      difficulty: 2,
      lastReviewed: new Date(Date.now() - 86400000),
      nextReview: new Date(Date.now() + 86400000),
      reviewCount: 3,
      correctCount: 2,
      interval: 1,
      easinessFactor: 2.5
    },
    {
      id: '2',
      question: 'What is a component?',
      answer: 'A reusable piece of UI that can have its own state and logic',
      difficulty: 1,
      lastReviewed: new Date(Date.now() - 172800000),
      nextReview: new Date(),
      reviewCount: 5,
      correctCount: 4,
      interval: 3,
      easinessFactor: 2.8
    }
  ]);

  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studySession, setStudySession] = useState({
    startTime: Date.now(),
    cardsStudied: 0,
    correctAnswers: 0
  });

  useEffect(() => {
    const dueCards = flashcards.filter(card => new Date(card.nextReview) <= new Date());
    if (dueCards.length > 0 && !currentCard) {
      setCurrentCard(dueCards[0]);
      setShowAnswer(false);
    }
  }, [flashcards, currentCard]);

  const calculateNextReview = (card: Flashcard, quality: number): Partial<Flashcard> => {
    let { easinessFactor, interval, reviewCount } = card;
    
    // SM-2 Algorithm implementation
    easinessFactor = Math.max(1.3, easinessFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    if (quality < 3) {
      interval = 1;
    } else if (reviewCount === 1) {
      interval = 1;
    } else if (reviewCount === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    return {
      easinessFactor,
      interval,
      nextReview,
      lastReviewed: new Date(),
      reviewCount: reviewCount + 1,
      correctCount: quality >= 3 ? card.correctCount + 1 : card.correctCount
    };
  };

  const handleAnswer = (quality: number) => {
    if (!currentCard) return;

    const updatedCard = { ...currentCard, ...calculateNextReview(currentCard, quality) };
    
    setFlashcards(prev => prev.map(card => 
      card.id === currentCard.id ? updatedCard : card
    ));

    setStudySession(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correctAnswers: quality >= 3 ? prev.correctAnswers + 1 : prev.correctAnswers
    }));

    // Move to next card
    const remainingCards = flashcards.filter(card => 
      card.id !== currentCard.id && new Date(card.nextReview) <= new Date()
    );
    
    if (remainingCards.length > 0) {
      setCurrentCard(remainingCards[0]);
      setShowAnswer(false);
    } else {
      // Session complete
      const stats: StudyStats = {
        cardsStudied: studySession.cardsStudied + 1,
        correctAnswers: studySession.correctAnswers + (quality >= 3 ? 1 : 0),
        totalTime: Date.now() - studySession.startTime,
        averageDifficulty: flashcards.reduce((sum, card) => sum + card.difficulty, 0) / flashcards.length
      };
      
      onStudyComplete?.(stats);
      setCurrentCard(null);
    }
  };

  const getDueCardCount = () => {
    return flashcards.filter(card => new Date(card.nextReview) <= new Date()).length;
  };

  const getRetentionRate = () => {
    const totalReviews = flashcards.reduce((sum, card) => sum + card.reviewCount, 0);
    const totalCorrect = flashcards.reduce((sum, card) => sum + card.correctCount, 0);
    return totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
  };

  const resetProgress = () => {
    setFlashcards(prev => prev.map(card => ({
      ...card,
      interval: 1,
      nextReview: new Date(),
      reviewCount: 0,
      correctCount: 0,
      easinessFactor: 2.5
    })));
    setStudySession({
      startTime: Date.now(),
      cardsStudied: 0,
      correctAnswers: 0
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <ExperimentOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          </Col>
          <Col flex="auto">
            <Title level={3} style={{ margin: 0 }}>Spaced Repetition System</Title>
            <Text type="secondary">Optimized learning with intelligent review scheduling</Text>
          </Col>
          <Col>
            <Space>
              <Badge count={getDueCardCount()} showZero>
                <Tag color="blue">Due Cards</Tag>
              </Badge>
              <Tag color="green">Retention: {getRetentionRate()}%</Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          {currentCard ? (
            <Card style={{ height: '100%' }}>
              <div style={{ textAlign: 'center', minHeight: 300 }}>
                <Title level={4}>Question</Title>
                <Text style={{ fontSize: 18, display: 'block', margin: '20px 0' }}>
                  {currentCard.question}
                </Text>
                
                {showAnswer && (
                  <div style={{ 
                    background: '#f0f0f0', 
                    padding: 20, 
                    borderRadius: 8, 
                    margin: '20px 0' 
                  }}>
                    <Title level={5}>Answer:</Title>
                    <Text>{currentCard.answer}</Text>
                  </div>
                )}
                
                <Space style={{ marginTop: 30 }}>
                  {!showAnswer ? (
                    <Button type="primary" onClick={() => setShowAnswer(true)}>
                      Show Answer
                    </Button>
                  ) : (
                    <>
                      <Text>How well did you know this?</Text>
                      <Space>
                        <Button onClick={() => handleAnswer(1)}>Again</Button>
                        <Button onClick={() => handleAnswer(2)}>Hard</Button>
                        <Button onClick={() => handleAnswer(3)}>Good</Button>
                        <Button type="primary" onClick={() => handleAnswer(4)}>Easy</Button>
                      </Space>
                    </>
                  )}
                </Space>
              </div>
            </Card>
          ) : (
            <Card style={{ height: '100%', textAlign: 'center' }}>
              <TrophyOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>All caught up!</Title>
              <Text>No cards due for review right now.</Text>
              <Button type="primary" style={{ marginTop: 16 }} onClick={resetProgress}>
                Reset Progress
              </Button>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Study Progress" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Cards Studied: {studySession.cardsStudied}</Text>
                <Progress 
                  percent={studySession.cardsStudied > 0 ? (studySession.correctAnswers / studySession.cardsStudied) * 100 : 0}
                  size="small"
                  style={{ marginTop: 4 }}
                />
              </div>
              <div>
                <Text>Accuracy: {studySession.cardsStudied > 0 ? Math.round((studySession.correctAnswers / studySession.cardsStudied) * 100) : 0}%</Text>
              </div>
              <div>
                <Text>Session Time: {Math.round((Date.now() - studySession.startTime) / 60000)} min</Text>
              </div>
            </Space>
          </Card>

          <Card title="Upcoming Reviews" size="small" style={{ marginTop: 16 }}>
            <List
              size="small"
              dataSource={flashcards
                .filter(card => new Date(card.nextReview) > new Date())
                .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())
                .slice(0, 5)}
              renderItem={(card) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ClockCircleOutlined />} />}
                    title={card.question.substring(0, 30) + '...'}
                    description={`In ${Math.ceil((new Date(card.nextReview).getTime() - Date.now()) / 86400000)} days`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SpacedRepetitionSystem;
