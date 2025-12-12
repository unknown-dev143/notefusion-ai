import React, { useState } from 'react';
import { Card, Typography, Button, Space, Input, Select, Slider, message, Row, Col, Progress, Tabs, List, Avatar, Tag, Modal } from 'antd';
import { 
  FilePptOutlined, 
  DownloadOutlined, 
  RobotOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShareAltOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

interface Slide {
  id: string;
  title: string;
  content: string;
  layout: 'title' | 'content' | 'two-column' | 'image-text' | 'bullet-points';
  template: string;
  backgroundColor: string;
  textColor: string;
  images?: string[];
  notes?: string;
}

interface Template {
  id: string;
  name: string;
  preview: string;
  layout: string[];
  colors: string[];
}

interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  template: string;
  theme: string;
  createdAt: string;
  lastModified: string;
  isPublic: boolean;
  collaborators: string[];
}

const PresentationGenerator: React.FC = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([
    {
      id: '1',
      title: 'AI in Education',
      slides: [
        {
          id: '1',
          title: 'Introduction to AI',
          content: 'Artificial Intelligence is transforming education...',
          layout: 'title',
          template: 'modern',
          backgroundColor: '#ffffff',
          textColor: '#000000'
        }
      ],
      template: 'modern',
      theme: 'professional',
      createdAt: '2024-01-15',
      lastModified: '2024-01-16',
      isPublic: false,
      collaborators: ['Alice']
    }
  ]);

  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [presentationTopic, setPresentationTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [presentationStyle, setPresentationStyle] = useState('professional');
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const templates: Template[] = [
    {
      id: 'modern',
      name: 'Modern',
      preview: 'Clean and minimalist design',
      layout: ['title', 'content', 'two-column'],
      colors: ['#1890ff', '#ffffff', '#000000']
    },
    {
      id: 'corporate',
      name: 'Corporate',
      preview: 'Professional business style',
      layout: ['title', 'bullet-points', 'image-text'],
      colors: ['#52c41a', '#ffffff', '#000000']
    },
    {
      id: 'creative',
      name: 'Creative',
      preview: 'Bold and artistic design',
      layout: ['title', 'content', 'two-column', 'image-text'],
      colors: ['#fa8c16', '#ffffff', '#000000']
    },
    {
      id: 'academic',
      name: 'Academic',
      preview: 'Research and education focused',
      layout: ['title', 'bullet-points', 'content'],
      colors: ['#722ed1', '#ffffff', '#000000']
    }
  ];

  const generatePresentation = async () => {
    if (!presentationTopic.trim()) {
      message.error('Please enter a presentation topic');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate AI presentation generation
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      const newPresentation: Presentation = {
        id: Date.now().toString(),
        title: presentationTopic,
        slides: generateSlides(presentationTopic, slideCount),
        template: selectedTemplate,
        theme: presentationStyle,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isPublic: false,
        collaborators: []
      };

      setPresentations(prev => [...prev, newPresentation]);
      setCurrentPresentation(newPresentation);
      setIsGenerating(false);
      message.success('Presentation generated successfully!');
    }, 5000);
  };

  const generateSlides = (topic: string, count: number): Slide[] => {
    const slides: Slide[] = [];
    const layouts: Slide['layout'][] = ['title', 'content', 'two-column', 'bullet-points', 'image-text'];
    
    for (let i = 0; i < count; i++) {
      slides.push({
        id: (i + 1).toString(),
        title: i === 0 ? topic : `${topic} - Part ${i + 1}`,
        content: generateSlideContent(topic, i),
        layout: layouts[i % layouts.length],
        template: selectedTemplate,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        notes: `Speaker notes for slide ${i + 1}`
      });
    }
    
    return slides;
  };

  const generateSlideContent = (topic: string, index: number): string => {
    const contents = [
      `Introduction to ${topic}`,
      `Key concepts and fundamentals of ${topic}`,
      `Advanced topics in ${topic}`,
      `Practical applications of ${topic}`,
      `Future trends and developments in ${topic}`
    ];
    
    return contents[index % contents.length];
  };

  const addSlide = () => {
    if (!currentPresentation) return;
    
    const newSlide: Slide = {
      id: (currentPresentation.slides.length + 1).toString(),
      title: 'New Slide',
      content: 'Add your content here',
      layout: 'content',
      template: currentPresentation.template,
      backgroundColor: '#ffffff',
      textColor: '#000000'
    };

    setCurrentPresentation(prev => prev ? {
      ...prev,
      slides: [...prev.slides, newSlide],
      lastModified: new Date().toISOString()
    } : null);
  };

  const deleteSlide = (slideId: string) => {
    if (!currentPresentation) return;
    
    setCurrentPresentation(prev => prev ? {
      ...prev,
      slides: prev.slides.filter(slide => slide.id !== slideId),
      lastModified: new Date().toISOString()
    } : null);
  };

  
  const exportPresentation = (format: 'pptx' | 'pdf' | 'google-slides') => {
    if (!currentPresentation) {
      message.error('No presentation to export');
      return;
    }
    
    message.success(`Exporting presentation as ${format.toUpperCase()}...`);
    // Simulate export process
    setTimeout(() => {
      message.success(`Presentation exported successfully!`);
    }, 2000);
  };

  const sharePresentation = () => {
    if (!currentPresentation) return;
    
    setShareModalVisible(true);
  };

  const renderSlidePreview = (slide: Slide) => {
    const layoutStyles: Record<string, React.CSSProperties> = {
      title: { textAlign: 'center' as const, padding: '40px' },
      content: { padding: '40px' },
      'two-column': { display: 'flex', padding: '40px' },
      'bullet-points': { padding: '40px' },
      'image-text': { display: 'flex', padding: '40px' }
    };

    return (
      <div style={{
        backgroundColor: slide.backgroundColor,
        color: slide.textColor,
        minHeight: 300,
        borderRadius: 8,
        border: '1px solid #d9d9d9',
        ...layoutStyles[slide.layout]
      }}>
        <h2>{slide.title}</h2>
        <p>{slide.content}</p>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Presentation Generator</Title>
      
      <Tabs defaultActiveKey="create">
        <TabPane tab="Create Presentation" key="create">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="AI Presentation Generator">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <Text strong>Presentation Topic</Text>
                    <TextArea
                      value={presentationTopic}
                      onChange={(e) => setPresentationTopic(e.target.value)}
                      placeholder="Enter your presentation topic..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Text strong>Number of Slides: {slideCount}</Text>
                    <Slider
                      min={3}
                      max={20}
                      value={slideCount}
                      onChange={setSlideCount}
                    />
                  </div>

                  <div>
                    <Text strong>Template</Text>
                    <Select
                      value={selectedTemplate}
                      onChange={setSelectedTemplate}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      {templates.map(template => (
                        <Option key={template.id} value={template.id}>
                          {template.name} - {template.preview}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Text strong>Style</Text>
                    <Select
                      value={presentationStyle}
                      onChange={setPresentationStyle}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      <Option value="professional">Professional</Option>
                      <Option value="casual">Casual</Option>
                      <Option value="academic">Academic</Option>
                      <Option value="creative">Creative</Option>
                    </Select>
                  </div>

                  <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={generatePresentation}
                    loading={isGenerating}
                    block
                  >
                    Generate Presentation
                  </Button>

                  {isGenerating && (
                    <div>
                      <Text>Generating presentation...</Text>
                      <Progress percent={generationProgress} />
                    </div>
                  )}
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Templates">
                <Row gutter={[16, 16]}>
                  {templates.map(template => (
                    <Col xs={12} key={template.id}>
                      <Card
                        size="small"
                        hoverable
                        style={{
                          border: selectedTemplate === template.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                        }}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <AppstoreOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                          <Title level={5}>{template.name}</Title>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {template.preview}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="My Presentations" key="presentations">
          <Row gutter={[16, 16]}>
            {presentations.map(presentation => (
              <Col xs={24} sm={12} lg={8} key={presentation.id}>
                <Card
                  size="small"
                  hoverable
                  actions={[
                    <EyeOutlined key="preview" onClick={() => {
                      setCurrentPresentation(presentation);
                      setPreviewMode(true);
                    }} />,
                    <EditOutlined key="edit" onClick={() => setCurrentPresentation(presentation)} />,
                    <ShareAltOutlined key="share" onClick={sharePresentation} />
                  ]}
                >
                  <Card.Meta
                    avatar={<Avatar icon={<FilePptOutlined />} />}
                    title={presentation.title}
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">{presentation.slides.length} slides</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          Modified {new Date(presentation.lastModified).toLocaleDateString()}
                        </Text>
                        {presentation.isPublic && <Tag color="green">Public</Tag>}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        {currentPresentation && (
          <TabPane tab="Edit Presentation" key="edit">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Card
                  title={`Editing: ${currentPresentation.title}`}
                  extra={
                    <Space>
                      <Button icon={<PlusOutlined />} onClick={addSlide}>
                        Add Slide
                      </Button>
                      <Button icon={<EyeOutlined />} onClick={() => setPreviewMode(true)}>
                        Preview
                      </Button>
                    </Space>
                  }
                >
                  <List
                    dataSource={currentPresentation.slides}
                    renderItem={(slide, index) => (
                      <List.Item
                        actions={[
                          <Button
                            key="delete"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteSlide(slide.id)}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          title={`Slide ${index + 1}: ${slide.title}`}
                          description={
                            <div>
                              <Text type="secondary">Layout: {slide.layout}</Text>
                              <div style={{ marginTop: 8 }}>
                                {renderSlidePreview(slide)}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="Export Options">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button icon={<DownloadOutlined />} onClick={() => exportPresentation('pptx')} block>
                      Export as PowerPoint
                    </Button>
                    <Button icon={<DownloadOutlined />} onClick={() => exportPresentation('pdf')} block>
                      Export as PDF
                    </Button>
                    <Button icon={<ShareAltOutlined />} onClick={sharePresentation} block>
                      Share Presentation
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        )}
      </Tabs>

      <Modal
        title="Share Presentation"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setShareModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="share" type="primary" onClick={() => {
            message.success('Presentation shared successfully!');
            setShareModalVisible(false);
          }}>
            Share
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Share this presentation with others:</Text>
          <Input placeholder="Enter email addresses..." />
          <Text type="secondary">
            Presentation link: https://notefusion.ai/presentations/{currentPresentation?.id}
          </Text>
        </Space>
      </Modal>
    </div>
  );
};

export default PresentationGenerator;
