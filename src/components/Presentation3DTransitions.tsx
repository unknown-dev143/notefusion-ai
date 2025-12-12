import React, { useState, useRef } from 'react';
import { Card, Typography, Button, Space, Row, Col, Select, Slider, message, Switch, Tag } from 'antd';
import { 
  PlayCircleOutlined, 
  EyeOutlined,
  ReloadOutlined,
  SaveOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface Transition3D {
  name: string;
  description: string;
  duration: number;
  easing: string;
  perspective: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  opacity: number;
}

interface Slide {
  id: string;
  content: string;
  backgroundColor: string;
}

const Presentation3DTransitions: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState<string>('cube');
  const [transitionSettings, setTransitionSettings] = useState({
    duration: 1000,
    easing: 'ease-in-out',
    perspective: 1000,
    autoPlay: false,
    loop: true
  });

  const [slides] = useState<Slide[]>([
    { id: '1', content: 'Welcome to 3D Presentations', backgroundColor: '#1890ff' },
    { id: '2', content: 'Advanced Animation Effects', backgroundColor: '#52c41a' },
    { id: '3', content: 'Interactive Transitions', backgroundColor: '#fa8c16' },
    { id: '4', content: 'Professional Presentations', backgroundColor: '#722ed1' }
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const transitions3D: Record<string, Transition3D> = {
    cube: {
      name: 'Cube Rotation',
      description: '3D cube rotation effect',
      duration: 1000,
      easing: 'ease-in-out',
      perspective: 1000,
      rotationX: 0,
      rotationY: 90,
      rotationZ: 0,
      scale: 1,
      opacity: 1
    },
    flip: {
      name: 'Card Flip',
      description: '3D card flip animation',
      duration: 800,
      easing: 'ease-in-out',
      perspective: 800,
      rotationX: 180,
      rotationY: 0,
      rotationZ: 0,
      scale: 1,
      opacity: 1
    },
    rotate: {
      name: '3D Rotate',
      description: 'Full 3D rotation',
      duration: 1200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      perspective: 1200,
      rotationX: 0,
      rotationY: 360,
      rotationZ: 0,
      scale: 1,
      opacity: 1
    },
    slide3d: {
      name: '3D Slide',
      description: '3D sliding effect',
      duration: 900,
      easing: 'ease-out',
      perspective: 600,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      scale: 0.8,
      opacity: 0
    },
    zoom: {
      name: '3D Zoom',
      description: '3D zoom in/out',
      duration: 700,
      easing: 'ease-in-out',
      perspective: 500,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      scale: 0,
      opacity: 0
    },
    spiral: {
      name: 'Spiral',
      description: '3D spiral animation',
      duration: 1500,
      easing: 'ease-in-out',
      perspective: 1500,
      rotationX: 360,
      rotationY: 360,
      rotationZ: 360,
      scale: 0.5,
      opacity: 0
    }
  };

  const applyTransition = (direction: 'next' | 'prev') => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const currentSlideEl = container.children[currentSlide] as HTMLElement;
    const nextIndex = direction === 'next' 
      ? (currentSlide + 1) % slides.length 
      : (currentSlide - 1 + slides.length) % slides.length;
    
    const nextSlideEl = container.children[nextIndex] as HTMLElement;
    const transition = transitions3D[selectedTransition];

    // Reset transforms
    currentSlideEl.style.transform = 'translateZ(0)';
    currentSlideEl.style.opacity = '1';
    nextSlideEl.style.transform = 'translateZ(0)';
    nextSlideEl.style.opacity = '0';

    // Apply transition styles
    container.style.perspective = `${transition.perspective}px`;
    currentSlideEl.style.transition = `all ${transitionSettings.duration}ms ${transitionSettings.easing}`;
    nextSlideEl.style.transition = `all ${transitionSettings.duration}ms ${transitionSettings.easing}`;

    // Apply 3D transforms
    setTimeout(() => {
      if (direction === 'next') {
        currentSlideEl.style.transform = `
          rotateX(${transition.rotationX}deg) 
          rotateY(${transition.rotationY}deg) 
          rotateZ(${transition.rotationZ}deg) 
          scale(${transition.scale})
          translateZ(-100px)
        `;
        currentSlideEl.style.opacity = `${transition.opacity}`;

        nextSlideEl.style.transform = 'translateZ(0)';
        nextSlideEl.style.opacity = '1';
      } else {
        currentSlideEl.style.transform = `
          rotateX(${-transition.rotationX}deg) 
          rotateY(${-transition.rotationY}deg) 
          rotateZ(${-transition.rotationZ}deg) 
          scale(${transition.scale})
          translateZ(-100px)
        `;
        currentSlideEl.style.opacity = `${transition.opacity}`;

        nextSlideEl.style.transform = 'translateZ(0)';
        nextSlideEl.style.opacity = '1';
      }
    }, 50);

    setTimeout(() => {
      setCurrentSlide(nextIndex);
    }, transitionSettings.duration);
  };

  const nextSlide = () => applyTransition('next');
  const prevSlide = () => applyTransition('prev');

  const startAutoPlay = () => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, transitionSettings.duration + 2000);
  };

  const stopAutoPlay = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const previewTransition = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const currentSlideEl = container.children[currentSlide] as HTMLElement;
    const transition = transitions3D[selectedTransition];

    container.style.perspective = `${transition.perspective}px`;
    currentSlideEl.style.transition = `all ${transitionSettings.duration}ms ${transitionSettings.easing}`;

    // Apply preview animation
    currentSlideEl.style.transform = `
      rotateX(${transition.rotationX}deg) 
      rotateY(${transition.rotationY}deg) 
      rotateZ(${transition.rotationZ}deg) 
      scale(${transition.scale})
      translateZ(-100px)
    `;
    currentSlideEl.style.opacity = `${transition.opacity}`;

    setTimeout(() => {
      currentSlideEl.style.transform = 'translateZ(0)';
      currentSlideEl.style.opacity = '1';
    }, transitionSettings.duration);
  };

  const exportSettings = () => {
    const settings = {
      transition: selectedTransition,
      settings: transitionSettings,
      slides: slides
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `3d-transitions-${Date.now()}.json`;
    link.click();
    
    message.success('3D transition settings exported!');
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>3D Presentation Transitions</Title>
            <Text type="secondary">Advanced 3D animation effects for presentations</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">{Object.keys(transitions3D).length} transitions</Tag>
              <Tag color="green">{slides.length} slides</Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Presentation Preview" size="small">
            <div style={{ position: 'relative', height: 400, overflow: 'hidden', borderRadius: 8 }}>
              <div
                ref={containerRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d'
                }}
              >
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: slide.backgroundColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 24,
                      fontWeight: 'bold',
                      borderRadius: 8,
                      transform: index === currentSlide ? 'translateZ(0)' : 'translateZ(-100px)',
                      opacity: index === currentSlide ? 1 : 0,
                      transition: 'none'
                    }}
                  >
                    {slide.content}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Space>
                <Button
                  icon={<PlayCircleOutlined />}
                  onClick={prevSlide}
                  disabled={isPlaying}
                >
                  Previous
                </Button>
                {isPlaying ? (
                  <Button
                    danger
                    onClick={stopAutoPlay}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={startAutoPlay}
                  >
                    Auto Play
                  </Button>
                )}
                <Button
                  icon={<PlayCircleOutlined />}
                  onClick={nextSlide}
                  disabled={isPlaying}
                >
                  Next
                </Button>
              </Space>
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Space>
                {slides.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: index === currentSlide ? '#1890ff' : '#d9d9d9',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="3D Transitions" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Transition Type:</Text>
                <Select
                  value={selectedTransition}
                  onChange={setSelectedTransition}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {Object.entries(transitions3D).map(([key, transition]) => (
                    <Option key={key} value={key}>
                      {transition.name}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>{transitions3D[selectedTransition].description}</Text>
              </div>

              <Button
                icon={<EyeOutlined />}
                onClick={previewTransition}
                block
              >
                Preview Transition
              </Button>
            </Space>
          </Card>

          <Card title="Transition Settings" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Duration:</Text>
                <Slider
                  min={200}
                  max={3000}
                  value={transitionSettings.duration}
                  onChange={(value) => setTransitionSettings(prev => ({ ...prev, duration: value }))}
                  marks={{ 200: '0.2s', 1000: '1s', 2000: '2s', 3000: '3s' }}
                />
                <Text type="secondary">{transitionSettings.duration}ms</Text>
              </div>

              <div>
                <Text strong>Easing:</Text>
                <Select
                  value={transitionSettings.easing}
                  onChange={(value) => setTransitionSettings(prev => ({ ...prev, easing: value }))}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="linear">Linear</Option>
                  <Option value="ease">Ease</Option>
                  <Option value="ease-in">Ease In</Option>
                  <Option value="ease-out">Ease Out</Option>
                  <Option value="ease-in-out">Ease In Out</Option>
                  <Option value="cubic-bezier(0.4, 0, 0.2, 1)">Material</Option>
                </Select>
              </div>

              <div>
                <Text strong>Perspective:</Text>
                <Slider
                  min={200}
                  max={2000}
                  value={transitionSettings.perspective}
                  onChange={(value) => setTransitionSettings(prev => ({ ...prev, perspective: value }))}
                  marks={{ 200: '200', 1000: '1000', 2000: '2000' }}
                />
                <Text type="secondary">{transitionSettings.perspective}px</Text>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={transitionSettings.autoPlay}
                    onChange={(checked) => setTransitionSettings(prev => ({ ...prev, autoPlay: checked }))}
                  />
                  <Text>Auto Play</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <Switch
                    checked={transitionSettings.loop}
                    onChange={(checked) => setTransitionSettings(prev => ({ ...prev, loop: checked }))}
                  />
                  <Text>Loop</Text>
                </Space>
              </div>

              <Button
                icon={<SaveOutlined />}
                onClick={exportSettings}
                block
              >
                Export Settings
              </Button>
            </Space>
          </Card>

          <Card title="Quick Actions" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<ExperimentOutlined />}
                onClick={() => {
                  const transitions = Object.keys(transitions3D);
                  const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
                  setSelectedTransition(randomTransition);
                  previewTransition();
                }}
                block
              >
                Random Transition
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setTransitionSettings({
                    duration: 1000,
                    easing: 'ease-in-out',
                    perspective: 1000,
                    autoPlay: false,
                    loop: true
                  });
                  setSelectedTransition('cube');
                }}
                block
              >
                Reset Settings
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Presentation3DTransitions;
