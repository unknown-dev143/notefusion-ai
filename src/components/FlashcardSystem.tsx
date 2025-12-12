import React, { useState } from 'react';
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
  Select
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
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

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
      createdAt: new Date().toISOString(),
      tags: [],
      isPublic: false,
      difficulty: 'beginner',
      estimatedStudyTime: 0,
      shareCount: 0,
      rating: 0
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
      createdAt: new Date().toISOString(),
      tags: [],
      isPublic: false,
      difficulty: 'beginner',
      estimatedStudyTime: 0,
      shareCount: 0,
      rating: 0
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
