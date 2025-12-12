import React, { useState } from 'react';
import { Card, Button, Space, Typography, Upload, Row, Col, message } from 'antd';
import { SoundOutlined, PictureOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  image?: string;
  audioQuestion?: string;
  audioAnswer?: string;
}

const FlashcardEnhancements: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: '1',
      question: 'What is machine learning?',
      answer: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience.',
      image: 'https://via.placeholder.com/300x200/1890ff/ffffff?text=Machine+Learning'
    },
    {
      id: '2',
      question: 'What is neural network?',
      answer: 'A neural network is a series of algorithms that endeavors to identify underlying relationships in a set of data.',
      audioQuestion: 'audio-question.mp3',
      audioAnswer: 'audio-answer.mp3'
    }
  ]);

  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const handleImageUpload = (flashcardId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFlashcards(prev => prev.map(card => 
        card.id === flashcardId 
          ? { ...card, image: e.target?.result as string }
          : card
      ));
      message.success('Image added to flashcard');
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (flashcardId: string, type: 'question' | 'answer', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFlashcards(prev => prev.map(card => 
        card.id === flashcardId 
          ? { ...card, [type === 'question' ? 'audioQuestion' : 'audioAnswer']: e.target?.result as string }
          : card
      ));
      message.success(`Audio added to ${type}`);
    };
    reader.readAsDataURL(file);
  };

  
  const speakText = (text: string, audioId: string) => {
    if ('speechSynthesis' in window) {
      if (isPlaying === audioId) {
        window.speechSynthesis.cancel();
        setIsPlaying(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsPlaying(audioId);
      utterance.onend = () => setIsPlaying(null);
      window.speechSynthesis.speak(utterance);
    } else {
      message.error('Text-to-speech not supported');
    }
  };

  const analytics = {
    totalReviews: 245,
    correctAnswers: 198,
    accuracy: 81,
    averageTime: 3.2,
    difficultyDistribution: {
      easy: 45,
      medium: 120,
      hard: 80
    }
  };

  return (
    <Card title="Flashcard Enhancements">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Flashcards with Media */}
        <Card size="small" title="Enhanced Flashcards">
          <Space direction="vertical" style={{ width: '100%' }}>
            {flashcards.map(flashcard => (
              <div key={flashcard.id} style={{
                padding: 16,
                backgroundColor: '#fafafa',
                borderRadius: 8,
                border: '1px solid #d9d9d9'
              }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 12 }}>
                      <Text strong>Question:</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text>{flashcard.question}</Text>
                        <Button
                          size="small"
                          icon={<SoundOutlined />}
                          onClick={() => speakText(flashcard.question, `q-${flashcard.id}`)}
                          style={{ marginLeft: 8 }}
                        >
                          {isPlaying === `q-${flashcard.id}` ? 'Stop' : 'Speak'}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Text strong>Answer:</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text>{flashcard.answer}</Text>
                        <Button
                          size="small"
                          icon={<SoundOutlined />}
                          onClick={() => speakText(flashcard.answer, `a-${flashcard.id}`)}
                          style={{ marginLeft: 8 }}
                        >
                          {isPlaying === `a-${flashcard.id}` ? 'Stop' : 'Speak'}
                        </Button>
                      </div>
                    </div>
                  </Col>
                  
                  <Col span={12}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {flashcard.image && (
                        <div>
                          <Text strong>Image:</Text>
                          <div style={{ marginTop: 8, textAlign: 'center' }}>
                            <img 
                              src={flashcard.image} 
                              alt="Flashcard" 
                              style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 4 }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Text strong>Add Media:</Text>
                        <div style={{ marginTop: 8 }}>
                          <Upload
                            accept="image/*"
                            showUploadList={false}
                            beforeUpload={(file) => {
                              handleImageUpload(flashcard.id, file);
                              return false;
                            }}
                          >
                            <Button size="small" icon={<PictureOutlined />}>
                              Add Image
                            </Button>
                          </Upload>
                          
                          <Upload
                            accept="audio/*"
                            showUploadList={false}
                            beforeUpload={(file) => {
                              handleAudioUpload(flashcard.id, 'question', file);
                              return false;
                            }}
                          >
                            <Button size="small" icon={<SoundOutlined />} style={{ marginLeft: 4 }}>
                              Add Q Audio
                            </Button>
                          </Upload>
                          
                          <Upload
                            accept="audio/*"
                            showUploadList={false}
                            beforeUpload={(file) => {
                              handleAudioUpload(flashcard.id, 'answer', file);
                              return false;
                            }}
                          >
                            <Button size="small" icon={<SoundOutlined />} style={{ marginLeft: 4 }}>
                              Add A Audio
                            </Button>
                          </Upload>
                        </div>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </div>
            ))}
          </Space>
        </Card>

        {/* Progress Analytics */}
        <Card size="small" title="Progress Analytics">
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                  {analytics.totalReviews}
                </Title>
                <Text type="secondary">Total Reviews</Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                  {analytics.correctAnswers}
                </Title>
                <Text type="secondary">Correct</Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#fa8c16' }}>
                  {analytics.accuracy}%
                </Title>
                <Text type="secondary">Accuracy</Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
                  {analytics.averageTime}s
                </Title>
                <Text type="secondary">Avg Time</Text>
              </div>
            </Col>
          </Row>
          
          <div style={{ marginTop: 16 }}>
            <Text strong>Difficulty Distribution</Text>
            <Row style={{ marginTop: 8 }}>
              <Col span={8}>
                <Text>Easy: {analytics.difficultyDistribution.easy}</Text>
              </Col>
              <Col span={8}>
                <Text>Medium: {analytics.difficultyDistribution.medium}</Text>
              </Col>
              <Col span={8}>
                <Text>Hard: {analytics.difficultyDistribution.hard}</Text>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Text-to-Speech Settings */}
        <Card size="small" title="Text-to-Speech Settings">
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Voice:</Text>
              <select title="Voice selection" style={{ width: '100%', marginTop: 4, padding: 4 }}>
                <option>Default</option>
                <option>Male Voice</option>
                <option>Female Voice</option>
              </select>
            </Col>
            <Col span={12}>
              <Text strong>Speed:</Text>
              <select title="Speech speed" style={{ width: '100%', marginTop: 4, padding: 4 }}>
                <option>Slow</option>
                <option>Normal</option>
                <option>Fast</option>
              </select>
            </Col>
          </Row>
        </Card>
      </Space>
    </Card>
  );
};

export default FlashcardEnhancements;
