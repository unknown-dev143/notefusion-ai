import React, { useState, useRef } from 'react';
import { Card, Typography, Button, Space, Row, Col, Input, message, Drawer } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  FullscreenOutlined,
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Slide {
  id: string;
  title: string;
  content: string;
  notes?: string;
  order: number;
}

interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

const PresentationMode: React.FC = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([
    {
      id: '1',
      title: 'Introduction to React',
      slides: [
        {
          id: '1',
          title: 'What is React?',
          content: 'React is a JavaScript library for building user interfaces',
          notes: 'Mention component-based architecture',
          order: 0
        },
        {
          id: '2',
          title: 'Key Features',
          content: '• Virtual DOM\n• Component-based\n• One-way data binding\n• JSX syntax',
          notes: 'Explain each feature with examples',
          order: 1
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [slideDrawerVisible, setSlideDrawerVisible] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startPresentation = (presentation: Presentation) => {
    setCurrentPresentation(presentation);
    setCurrentSlideIndex(0);
    setIsPresenting(true);
    setIsEditMode(false);
  };

  const nextSlide = () => {
    if (currentPresentation && currentSlideIndex < currentPresentation.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const exitPresentation = () => {
    setIsPresenting(false);
    setCurrentSlideIndex(0);
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const createNewSlide = () => {
    if (!currentPresentation) return;

    const newSlide: Slide = {
      id: Date.now().toString(),
      title: 'New Slide',
      content: 'Add your content here',
      order: currentPresentation.slides.length
    };

    const updatedPresentation = {
      ...currentPresentation,
      slides: [...currentPresentation.slides, newSlide]
    };

    setCurrentPresentation(updatedPresentation);
    setPresentations(prev => 
      prev.map(p => p.id === currentPresentation.id ? updatedPresentation : p)
    );
    message.success('New slide created');
  };

  const updateSlide = (slideId: string, updates: Partial<Slide>) => {
    if (!currentPresentation) return;

    const updatedSlides = currentPresentation.slides.map(slide =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    );

    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
      updatedAt: new Date().toISOString()
    };

    setCurrentPresentation(updatedPresentation);
    setPresentations(prev =>
      prev.map(p => p.id === currentPresentation.id ? updatedPresentation : p)
    );
  };

  const deleteSlide = (slideId: string) => {
    if (!currentPresentation) return;

    const updatedSlides = currentPresentation.slides.filter(slide => slide.id !== slideId);
    
    const updatedPresentation = {
      ...currentPresentation,
      slides: updatedSlides,
      updatedAt: new Date().toISOString()
    };

    setCurrentPresentation(updatedPresentation);
    setPresentations(prev =>
      prev.map(p => p.id === currentPresentation.id ? updatedPresentation : p)
    );
    message.success('Slide deleted');
  };

  const exportPresentation = (presentation: Presentation) => {
    const dataStr = JSON.stringify(presentation, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${presentation.title.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    message.success('Presentation exported');
  };

  if (isPresenting && currentPresentation) {
    const currentSlide = currentPresentation.slides[currentSlideIndex];
    
    return (
      <div 
        ref={containerRef}
        style={{ 
          height: '100vh', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <Space>
            <Text>{currentSlideIndex + 1} / {currentPresentation.slides.length}</Text>
            <Button icon={<FullscreenOutlined />} onClick={toggleFullscreen} />
            <Button icon={<PauseCircleOutlined />} onClick={exitPresentation}>Exit</Button>
          </Space>
        </div>

        <div style={{ textAlign: 'center', maxWidth: '1200px' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '40px' }}>
            {currentSlide.title}
          </Title>
          <div style={{ 
            fontSize: '24px', 
            lineHeight: '1.6',
            whiteSpace: 'pre-line',
            marginBottom: '40px'
          }}>
            {currentSlide.content}
          </div>
          {currentSlide.notes && (
            <div style={{ 
              fontSize: '16px', 
              opacity: 0.8,
              fontStyle: 'italic'
            }}>
              Notes: {currentSlide.notes}
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0' }}>
          <Space style={{ justifyContent: 'center', width: '100%' }}>
            <Button 
              icon={<LeftOutlined />} 
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
            >
              Previous
            </Button>
            <Button 
              icon={<RightOutlined />} 
              onClick={nextSlide}
              disabled={currentSlideIndex === currentPresentation.slides.length - 1}
            >
              Next
            </Button>
          </Space>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Presentation Mode</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Presentations">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {presentations.map(presentation => (
                <Card key={presentation.id} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Title level={5}>{presentation.title}</Title>
                      <Text type="secondary">{presentation.slides.length} slides</Text>
                    </div>
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<PlayCircleOutlined />}
                        onClick={() => startPresentation(presentation)}
                      >
                        Present
                      </Button>
                      <Button 
                        icon={<EditOutlined />}
                        onClick={() => {
                          setCurrentPresentation(presentation);
                          setIsEditMode(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        icon={<DownloadOutlined />}
                        onClick={() => exportPresentation(presentation)}
                      />
                    </Space>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        {currentPresentation && isEditMode && (
          <Col xs={24} lg={12}>
            <Card 
              title={`Editing: ${currentPresentation.title}`}
              extra={
                <Button onClick={() => setIsEditMode(false)}>
                  Close
                </Button>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={createNewSlide}
                  block
                >
                  Add New Slide
                </Button>

                {currentPresentation.slides.map((slide, index) => (
                  <Card key={slide.id} size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Title level={5}>Slide {index + 1}: {slide.title}</Title>
                        <Text type="secondary">{slide.content.substring(0, 50)}...</Text>
                      </div>
                      <Space>
                        <Button 
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingSlide(slide);
                            setSlideDrawerVisible(true);
                          }}
                        />
                        <Button 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => deleteSlide(slide.id)}
                        />
                      </Space>
                    </div>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>
        )}
      </Row>

      <Drawer
        title="Edit Slide"
        placement="right"
        onClose={() => setSlideDrawerVisible(false)}
        open={slideDrawerVisible}
        width={400}
      >
        {editingSlide && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Slide Title</Text>
              <Input
                value={editingSlide.title}
                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
              />
            </div>
            <div>
              <Text strong>Content</Text>
              <TextArea
                value={editingSlide.content}
                onChange={(e) => setEditingSlide({ ...editingSlide, content: e.target.value })}
                rows={6}
              />
            </div>
            <div>
              <Text strong>Speaker Notes</Text>
              <TextArea
                value={editingSlide.notes || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, notes: e.target.value })}
                rows={4}
              />
            </div>
            <Button 
              type="primary" 
              onClick={() => {
                updateSlide(editingSlide.id, editingSlide);
                setSlideDrawerVisible(false);
                setEditingSlide(null);
              }}
              block
            >
              Save Changes
            </Button>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default PresentationMode;
