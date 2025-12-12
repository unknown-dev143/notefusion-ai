import React, { useState, useRef } from 'react';
import { Card, Typography, Button, Space, Row, Col, message, Progress, Slider, Select, Input, Table, Tag } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  SaveOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface VoiceSegment {
  id: string;
  slideNumber: number;
  text: string;
  audioUrl?: string;
  duration: number;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  status: 'pending' | 'recording' | 'processing' | 'completed' | 'error';
}

interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  language: string;
  accent: string;
  emotion: string;
}

const PresentationVoiceOver: React.FC = () => {
  const [slides, setSlides] = useState<VoiceSegment[]>([
    {
      id: '1',
      slideNumber: 1,
      text: 'Welcome to our quarterly business review. Today we will discuss our performance and future plans.',
      duration: 0,
      voice: 'en-US-JennyNeural',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      status: 'pending'
    },
    {
      id: '2',
      slideNumber: 2,
      text: 'Our revenue has increased by 25% compared to last quarter, exceeding our expectations.',
      duration: 0,
      voice: 'en-US-JennyNeural',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      status: 'pending'
    },
    {
      id: '3',
      slideNumber: 3,
      text: 'Key highlights include successful product launches and expanded market presence.',
      duration: 0,
      voice: 'en-US-JennyNeural',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      status: 'pending'
    }
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingSlide, setCurrentPlayingSlide] = useState<string | null>(null);

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: 'en-US-JennyNeural',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    language: 'en-US',
    accent: 'neutral',
    emotion: 'friendly'
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const voices = [
    { id: 'en-US-JennyNeural', name: 'Jenny (US)', language: 'English (US)', type: 'Neural' },
    { id: 'en-US-GuyNeural', name: 'Guy (US)', language: 'English (US)', type: 'Neural' },
    { id: 'en-GB-SoniaNeural', name: 'Sonia (UK)', language: 'English (UK)', type: 'Neural' },
    { id: 'en-AU-NatashaNeural', name: 'Natasha (AU)', language: 'English (AU)', type: 'Neural' },
    { id: 'es-ES-ElviraNeural', name: 'Elvira (ES)', language: 'Spanish (ES)', type: 'Neural' },
    { id: 'fr-FR-DeniseNeural', name: 'Denise (FR)', language: 'French (FR)', type: 'Neural' }
  ];

  const startRecording = async (slideId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        
        setSlides(prev => prev.map(slide => 
          slide.id === slideId 
            ? { ...slide, audioUrl, status: 'completed' as const }
            : slide
        ));

        message.success('Recording saved successfully!');
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      setSlides(prev => prev.map(slide => 
        slide.id === slideId 
          ? { ...slide, status: 'recording' as const }
          : slide
      ));
    } catch (error) {
      message.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      setSlides(prev => prev.map(slide => 
        slide.status === 'recording' 
          ? { ...slide, status: 'processing' as const }
          : slide
      ));
    }
  };

  const generateVoiceOver = async (slideId: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate AI voice generation
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setGenerationProgress(i);
      }

      // Simulate generated audio
      const audioUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      
      setSlides(prev => prev.map(slide => 
        slide.id === slideId 
          ? { ...slide, audioUrl, status: 'completed' as const, ...voiceSettings }
          : slide
      ));

      message.success('Voice over generated successfully!');
    } catch (error) {
      setSlides(prev => prev.map(slide => 
        slide.id === slideId 
          ? { ...slide, status: 'error' as const }
          : slide
      ));
      message.error('Failed to generate voice over');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const playAudio = (audioUrl: string, slideId: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentPlayingSlide(slideId);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentPlayingSlide(null);
      };
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentPlayingSlide(null);
    }
  };

  const updateSlideText = (slideId: string, text: string) => {
    setSlides(prev => prev.map(slide => 
      slide.id === slideId 
        ? { ...slide, text }
        : slide
    ));
  };

  const exportVoiceOver = () => {
    const completedSlides = slides.filter(slide => slide.audioUrl);
    
    if (completedSlides.length === 0) {
      message.error('No completed voice overs to export');
      return;
    }

    // Create a zip file with all audio files
    message.success(`Exporting ${completedSlides.length} voice overs...`);
    
    // In a real implementation, this would create and download a zip file
    setTimeout(() => {
      message.success('Voice overs exported successfully!');
    }, 2000);
  };

  const columns = [
    {
      title: 'Slide',
      dataIndex: 'slideNumber',
      key: 'slideNumber',
      render: (num: number) => <Text strong>Slide {num}</Text>,
    },
    {
      title: 'Text',
      dataIndex: 'text',
      key: 'text',
      render: (text: string, record: VoiceSegment) => (
        <div>
          <TextArea
            value={text}
            onChange={(e) => updateSlideText(record.id, e.target.value)}
            rows={2}
            style={{ resize: 'none' }}
          />
        </div>
      ),
    },
    {
      title: 'Voice',
      dataIndex: 'voice',
      key: 'voice',
      render: (voice: string) => {
        const voiceInfo = voices.find(v => v.id === voice);
        return <Tag color="blue">{voiceInfo?.name || voice}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          pending: 'default',
          recording: 'red',
          processing: 'orange',
          completed: 'green',
          error: 'red'
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: VoiceSegment) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => startRecording(record.id)}
                disabled={isRecording}
              >
                Record
              </Button>
              <Button
                size="small"
                icon={<RobotOutlined />}
                onClick={() => generateVoiceOver(record.id)}
                disabled={isGenerating}
              >
                Generate
              </Button>
            </>
          )}
          
          {record.status === 'recording' && (
            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={stopRecording}
            >
              Stop
            </Button>
          )}
          
          {record.status === 'processing' && (
            <Button size="small" disabled>Processing...</Button>
          )}
          
          {record.status === 'completed' && record.audioUrl && (
            <>
              {currentPlayingSlide === record.id && isPlaying ? (
                <Button
                  size="small"
                  icon={<PauseCircleOutlined />}
                  onClick={pauseAudio}
                >
                  Pause
                </Button>
              ) : (
                <Button
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => playAudio(record.audioUrl!, record.id)}
                >
                  Play
                </Button>
              )}
            </>
          )}
          
          {record.status === 'error' && (
            <Button
              size="small"
              type="primary"
              onClick={() => generateVoiceOver(record.id)}
              disabled={isGenerating}
            >
              Retry
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Voice Over Recording</Title>
            <Text type="secondary">Add professional narration to your presentations</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">{slides.length} slides</Tag>
              <Tag color="green">{slides.filter(s => s.status === 'completed').length} completed</Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Slides & Scripts" size="small">
            <Table
              columns={columns}
              dataSource={slides}
              pagination={false}
              size="small"
              rowKey="id"
            />
            
            <audio ref={audioRef} style={{ display: 'none' }} />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Voice Settings" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Voice:</Text>
                <Select
                  value={voiceSettings.voice}
                  onChange={(value) => setVoiceSettings(prev => ({ ...prev, voice: value }))}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {voices.map(voice => (
                    <Option key={voice.id} value={voice.id}>
                      {voice.name} ({voice.language})
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>Language:</Text>
                <Select
                  value={voiceSettings.language}
                  onChange={(value) => setVoiceSettings(prev => ({ ...prev, language: value }))}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="en-US">English (US)</Option>
                  <Option value="en-GB">English (UK)</Option>
                  <Option value="es-ES">Spanish</Option>
                  <Option value="fr-FR">French</Option>
                </Select>
              </div>

              <div>
                <Text strong>Speed:</Text>
                <Slider
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={voiceSettings.speed}
                  onChange={(value) => setVoiceSettings(prev => ({ ...prev, speed: value }))}
                  marks={{ 0.5: 'Slow', 1.0: 'Normal', 2.0: 'Fast' }}
                />
                <Text type="secondary">{voiceSettings.speed}x</Text>
              </div>

              <div>
                <Text strong>Pitch:</Text>
                <Slider
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={voiceSettings.pitch}
                  onChange={(value) => setVoiceSettings(prev => ({ ...prev, pitch: value }))}
                  marks={{ 0.5: 'Low', 1.0: 'Normal', 2.0: 'High' }}
                />
                <Text type="secondary">{voiceSettings.pitch}x</Text>
              </div>

              <div>
                <Text strong>Volume:</Text>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={voiceSettings.volume}
                  onChange={(value) => setVoiceSettings(prev => ({ ...prev, volume: value }))}
                  marks={{ 0: 'Mute', 0.5: '50%', 1.0: '100%' }}
                />
                <Text type="secondary">{Math.round(voiceSettings.volume * 100)}%</Text>
              </div>

              <div>
                <Text strong>Emotion:</Text>
                <Select
                  value={voiceSettings.emotion}
                  onChange={(value) => setVoiceSettings(prev => ({ ...prev, emotion: value }))}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="neutral">Neutral</Option>
                  <Option value="friendly">Friendly</Option>
                  <Option value="professional">Professional</Option>
                  <Option value="enthusiastic">Enthusiastic</Option>
                  <Option value="calm">Calm</Option>
                </Select>
              </div>
            </Space>
          </Card>

          <Card title="Batch Operations" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<RobotOutlined />}
                onClick={() => {
                  slides.forEach(slide => {
                    if (slide.status === 'pending') {
                      generateVoiceOver(slide.id);
                    }
                  });
                }}
                disabled={isGenerating}
                block
              >
                Generate All Voice Overs
              </Button>

              <Button
                icon={<DownloadOutlined />}
                onClick={exportVoiceOver}
                disabled={slides.filter(s => s.status === 'completed').length === 0}
                block
              >
                Export Completed Voice Overs
              </Button>

              <Button
                icon={<SaveOutlined />}
                onClick={() => message.info('Settings saved')}
                block
              >
                Save Voice Settings
              </Button>
            </Space>
          </Card>

          {isGenerating && (
            <Card title="Generating Voice Over" size="small" style={{ marginTop: 16 }}>
              <Progress
                percent={generationProgress}
                status="active"
                format={() => `${generationProgress}%`}
              />
              <Text type="secondary">AI is generating natural voice...</Text>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PresentationVoiceOver;
