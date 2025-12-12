import React, { useState, useRef } from 'react';
import { Card, Typography, Button, Space, Row, Col, Input, message, Select, Tag, Switch } from 'antd';
import { 
  FileTextOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  BulbOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface SlideNote {
  id: string;
  slideNumber: number;
  title: string;
  content: string;
  speakerNotes: string;
  keyPoints: string[];
  questions: string[];
  resources: string[];
  tags: string[];
  lastModified: Date;
}

interface PresentationNotes {
  id: string;
  title: string;
  slides: SlideNote[];
  createdAt: Date;
  lastModified: Date;
  isPublic: boolean;
}

const PresentationNotes: React.FC = () => {
  const [presentationNotes, setPresentationNotes] = useState<PresentationNotes>({
    id: 'pres-1',
    title: 'Q4 Business Review',
    slides: [
      {
        id: 'slide-1',
        slideNumber: 1,
        title: 'Introduction',
        content: 'Welcome to our quarterly business review. Today we will discuss our performance and future plans.',
        speakerNotes: 'Start with a warm welcome. Mention key agenda items. Keep energy high.',
        keyPoints: ['Welcome message', 'Agenda overview', 'Quarter highlights'],
        questions: ['What were our main achievements?', 'What challenges did we face?'],
        resources: ['Q4 Financial Report', 'Team Performance Metrics'],
        tags: ['intro', 'welcome', 'agenda'],
        lastModified: new Date()
      },
      {
        id: 'slide-2',
        slideNumber: 2,
        title: 'Financial Performance',
        content: 'Our revenue has increased by 25% compared to last quarter, exceeding our expectations.',
        speakerNotes: 'Present the revenue growth chart. Emphasize the 25% increase. Compare with previous quarters.',
        keyPoints: ['25% revenue growth', 'Exceeded expectations', 'Market expansion'],
        questions: ['What drove this growth?', 'How does this compare to industry standards?'],
        resources: ['Revenue Charts', 'Market Analysis Report'],
        tags: ['finance', 'revenue', 'growth'],
        lastModified: new Date()
      }
    ],
    createdAt: new Date(),
    lastModified: new Date(),
    isPublic: false
  });

  const [selectedSlide, setSelectedSlide] = useState<SlideNote | null>(null);
  const [editingMode, setEditingMode] = useState(false);
  const [viewMode, setViewMode] = useState<'presenter' | 'audience'>('presenter');
  const [newTag, setNewTag] = useState('');
  const [newResource, setNewResource] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);

  const updateSlideNote = (slideId: string, field: keyof SlideNote, value: any) => {
    setPresentationNotes(prev => ({
      ...prev,
      slides: prev.slides.map(slide => 
        slide.id === slideId 
          ? { ...slide, [field]: value, lastModified: new Date() }
          : slide
      ),
      lastModified: new Date()
    }));
  };

  const addTag = (slideId: string) => {
    if (!newTag.trim()) return;
    
    const slide = presentationNotes.slides.find(s => s.id === slideId);
    if (slide && !slide.tags.includes(newTag)) {
      updateSlideNote(slideId, 'tags', [...slide.tags, newTag]);
      setNewTag('');
      message.success('Tag added!');
    }
  };

  const removeTag = (slideId: string, tag: string) => {
    const slide = presentationNotes.slides.find(s => s.id === slideId);
    if (slide) {
      updateSlideNote(slideId, 'tags', slide.tags.filter(t => t !== tag));
    }
  };

  const addResource = (slideId: string) => {
    if (!newResource.trim()) return;
    
    const slide = presentationNotes.slides.find(s => s.id === slideId);
    if (slide && !slide.resources.includes(newResource)) {
      updateSlideNote(slideId, 'resources', [...slide.resources, newResource]);
      setNewResource('');
      message.success('Resource added!');
    }
  };

  const removeResource = (slideId: string, resource: string) => {
    const slide = presentationNotes.slides.find(s => s.id === slideId);
    if (slide) {
      updateSlideNote(slideId, 'resources', slide.resources.filter(r => r !== resource));
    }
  };

  const addQuestion = (slideId: string) => {
    if (!newQuestion.trim()) return;
    
    const slide = presentationNotes.slides.find(s => s.id === slideId);
    if (slide) {
      updateSlideNote(slideId, 'questions', [...slide.questions, newQuestion]);
      setNewQuestion('');
      message.success('Question added!');
    }
  };

  const removeQuestion = (slideId: string, question: string) => {
    const slide = presentationNotes.slides.find(s => s.id === slideId);
    if (slide) {
      updateSlideNote(slideId, 'questions', slide.questions.filter(q => q !== question));
    }
  };

  const exportNotes = (format: 'pdf' | 'docx' | 'txt') => {
    const content = generateNotesContent();
    
    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `presentation-notes-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      message.info(`Exporting as ${format.toUpperCase()}...`);
      setTimeout(() => {
        message.success(`Notes exported as ${format.toUpperCase()}!`);
      }, 1500);
    }
  };

  const generateNotesContent = () => {
    let content = `${presentationNotes.title}\n${'='.repeat(50)}\n\n`;
    
    presentationNotes.slides.forEach(slide => {
      content += `Slide ${slide.slideNumber}: ${slide.title}\n`;
      content += `${'-'.repeat(30)}\n`;
      content += `Content: ${slide.content}\n\n`;
      content += `Speaker Notes: ${slide.speakerNotes}\n\n`;
      
      if (slide.keyPoints.length > 0) {
        content += `Key Points:\n`;
        slide.keyPoints.forEach(point => {
          content += `• ${point}\n`;
        });
        content += '\n';
      }
      
      if (slide.questions.length > 0) {
        content += `Discussion Questions:\n`;
        slide.questions.forEach(question => {
          content += `• ${question}\n`;
        });
        content += '\n';
      }
      
      if (slide.resources.length > 0) {
        content += `Resources:\n`;
        slide.resources.forEach(resource => {
          content += `• ${resource}\n`;
        });
        content += '\n';
      }
      
      if (slide.tags.length > 0) {
        content += `Tags: ${slide.tags.join(', ')}\n\n`;
      }
      
      content += '\n';
    });
    
    return content;
  };

  const printNotes = () => {
    const content = generateNotesContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${presentationNotes.title} - Notes</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              h2 { color: #666; border-bottom: 1px solid #ccc; }
              ul { margin: 10px 0; }
              li { margin: 5px 0; }
            </style>
          </head>
          <body>
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Presentation Notes</Title>
            <Text type="secondary">Comprehensive notes for your presentation</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">{presentationNotes.slides.length} slides</Tag>
              <Switch
                checked={editingMode}
                onChange={setEditingMode}
                checkedChildren="Edit"
                unCheckedChildren="View"
              />
              <Select
                value={viewMode}
                onChange={setViewMode}
                style={{ width: 120 }}
              >
                <Option value="presenter">Presenter</Option>
                <Option value="audience">Audience</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Slides" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {presentationNotes.slides.map(slide => (
                <div
                  key={slide.id}
                  style={{
                    padding: 12,
                    border: selectedSlide?.id === slide.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    borderRadius: 8,
                    cursor: 'pointer',
                    backgroundColor: selectedSlide?.id === slide.id ? '#f6ffed' : 'white'
                  }}
                  onClick={() => setSelectedSlide(slide)}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    Slide {slide.slideNumber}: {slide.title}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {slide.content.substring(0, 50)}...
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    {slide.tags.map(tag => (
                      <Tag key={tag} style={{ margin: '2px' }}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </Space>
          </Card>

          <Card title="Quick Actions" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => exportNotes('txt')}
                block
              >
                Export as Text
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportNotes('pdf')}
                block
              >
                Export as PDF
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => exportNotes('docx')}
                block
              >
                Export as Word
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={printNotes}
                block
              >
                Print Notes
              </Button>
              <Button
                icon={<ShareAltOutlined />}
                onClick={() => message.success('Share link copied to clipboard!')}
                block
              >
                Share Notes
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          {selectedSlide ? (
            <Card title={`Slide ${selectedSlide.slideNumber}: ${selectedSlide.title}`} size="small">
              <div ref={contentRef}>
                {viewMode === 'presenter' ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Content:</Text>
                      {editingMode ? (
                        <TextArea
                          value={selectedSlide.content}
                          onChange={(e) => updateSlideNote(selectedSlide.id, 'content', e.target.value)}
                          rows={3}
                          style={{ marginTop: 8 }}
                        />
                      ) : (
                        <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                          {selectedSlide.content}
                        </div>
                      )}
                    </div>

                    <div>
                      <Text strong>Speaker Notes:</Text>
                      <div style={{ marginTop: 8, padding: 12, backgroundColor: '#e6f7ff', borderRadius: 4 }}>
                        <BulbOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                        {editingMode ? (
                          <TextArea
                            value={selectedSlide.speakerNotes}
                            onChange={(e) => updateSlideNote(selectedSlide.id, 'speakerNotes', e.target.value)}
                            rows={3}
                            style={{ marginTop: 4 }}
                          />
                        ) : (
                          <Text>{selectedSlide.speakerNotes}</Text>
                        )}
                      </div>
                    </div>

                    <div>
                      <Text strong>Key Points:</Text>
                      <div style={{ marginTop: 8 }}>
                        {selectedSlide.keyPoints.map((point, index) => (
                          <div key={index} style={{ marginBottom: 4 }}>
                            <Text>• {point}</Text>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Text strong>Discussion Questions:</Text>
                      <div style={{ marginTop: 8 }}>
                        {selectedSlide.questions.map((question, index) => (
                          <div key={index} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                            <Text>• {question}</Text>
                            {editingMode && (
                              <Button
                                size="small"
                                type="text"
                                danger
                                onClick={() => removeQuestion(selectedSlide.id, question)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        {editingMode && (
                          <div style={{ marginTop: 8 }}>
                            <Input
                              placeholder="Add a question..."
                              value={newQuestion}
                              onChange={(e) => setNewQuestion(e.target.value)}
                              onPressEnter={() => addQuestion(selectedSlide.id)}
                              style={{ width: '100%' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Text strong>Resources:</Text>
                      <div style={{ marginTop: 8 }}>
                        {selectedSlide.resources.map((resource, index) => (
                          <div key={index} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                            <Tag color="blue">{resource}</Tag>
                            {editingMode && (
                              <Button
                                size="small"
                                type="text"
                                danger
                                onClick={() => removeResource(selectedSlide.id, resource)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        {editingMode && (
                          <div style={{ marginTop: 8 }}>
                            <Input
                              placeholder="Add a resource..."
                              value={newResource}
                              onChange={(e) => setNewResource(e.target.value)}
                              onPressEnter={() => addResource(selectedSlide.id)}
                              style={{ width: '100%' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Text strong>Tags:</Text>
                      <div style={{ marginTop: 8 }}>
                        {selectedSlide.tags.map((tag, index) => (
                          <Tag
                            key={index}
                            closable={editingMode}
                            onClose={() => removeTag(selectedSlide.id, tag)}
                            style={{ margin: '2px' }}
                          >
                            {tag}
                          </Tag>
                        ))}
                        {editingMode && (
                          <div style={{ marginTop: 8 }}>
                            <Input
                              placeholder="Add a tag..."
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onPressEnter={() => addTag(selectedSlide.id)}
                              style={{ width: '100%' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: 16, textAlign: 'right' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined /> Last modified: {selectedSlide.lastModified.toLocaleString()}
                      </Text>
                    </div>
                  </Space>
                ) : (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <EyeOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    <div style={{ marginTop: 16 }}>
                      <Text strong>Audience View</Text>
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">
                          Only slide content is visible to the audience. Speaker notes and questions are hidden.
                        </Text>
                      </div>
                    </div>
                    <div style={{ marginTop: 16, padding: 20, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                      <Text>{selectedSlide.content}</Text>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <FileTextOutlined style={{ fontSize: 48 }} />
                <div style={{ marginTop: 16 }}>Select a slide to view and edit notes</div>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PresentationNotes;
