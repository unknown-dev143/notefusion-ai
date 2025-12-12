import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Button, Space, Slider, Upload, message, Row, Col, Progress } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  DownloadOutlined, 
  UploadOutlined, 
  ScissorOutlined,
  SaveOutlined,
  ReloadOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  name: string;
}

interface VideoEffects {
  brightness: number;
  contrast: number;
  saturation: number;
  speed: number;
  volume: number;
}

const VideoEditor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  const [savedVideos, setSavedVideos] = useState<any[]>([]);
  const [effects, setEffects] = useState<VideoEffects>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    speed: 1,
    volume: 100
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl]);

  const handleVideoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    message.success('Video uploaded successfully!');
    return false;
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const addClip = () => {
    const video = videoRef.current;
    if (!video) return;

    const newClip: VideoClip = {
      id: Date.now().toString(),
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, duration),
      name: `Clip ${clips.length + 1}`
    };

    setClips(prev => [...prev, newClip]);
    message.success('Clip added successfully!');
  };

  const removeClip = (clipId: string) => {
    setClips(prev => prev.filter(clip => clip.id !== clipId));
    if (selectedClip?.id === clipId) {
      setSelectedClip(null);
    }
    message.success('Clip removed successfully!');
  };

  const selectClip = (clip: VideoClip) => {
    setSelectedClip(clip);
    seekTo(clip.startTime);
  };

  const updateEffect = (effectName: keyof VideoEffects, value: number) => {
    setEffects(prev => ({ ...prev, [effectName]: value }));
    
    const video = videoRef.current;
    if (!video) return;

    switch (effectName) {
      case 'volume':
        video.volume = value / 100;
        break;
      case 'speed':
        video.playbackRate = value;
        break;
      default:
        // Apply visual effects (CSS filters would be applied to video element)
        break;
    }
  };

  const exportVideo = async () => {
    if (!videoFile) {
      message.error('Please upload a video first');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate video processing
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setIsProcessing(false);
      message.success('Video exported successfully!');
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'edited-video.mp4';
      link.href = videoUrl;
      link.click();
    }, 5000);
  };

  const saveToGallery = () => {
    if (!videoUrl || !videoFile) {
      message.error('Please upload a video first');
      return;
    }

    const savedVideo = {
      id: Date.now().toString(),
      name: `Video ${savedVideos.length + 1}`,
      url: videoUrl,
      fileName: videoFile.name,
      duration: duration,
      effects: effects,
      clips: clips,
      createdAt: new Date().toISOString()
    };

    setSavedVideos(prev => [...prev, savedVideo]);
    
    // Save to localStorage for persistence
    const existingVideos = JSON.parse(localStorage.getItem('videoGallery') || '[]');
    localStorage.setItem('videoGallery', JSON.stringify([...existingVideos, savedVideo]));
    
    message.success('Video saved to gallery successfully!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Video Editor</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Video Preview">
            <div style={{ background: '#000', borderRadius: 8, overflow: 'hidden' }}>
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  style={{ 
                    width: '100%',
                    maxHeight: 400,
                    filter: `brightness(${effects.brightness}%) contrast(${effects.contrast}%) saturate(${effects.saturation}%)`
                  }}
                />
              ) : (
                <div style={{ 
                  height: 400, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  color: '#fff'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <VideoCameraOutlined style={{ fontSize: 64, color: '#666' }} />
                    <Title level={4} style={{ color: '#666', marginTop: 16 }}>
                      No video loaded
                    </Title>
                    <Text style={{ color: '#666' }}>
                      Upload a video to start editing
                    </Text>
                  </div>
                </div>
              )}
            </div>

            {videoUrl && (
              <div style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Button 
                      icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Text>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </Text>
                  </Space>

                  <Slider
                    min={0}
                    max={duration}
                    value={currentTime}
                    onChange={seekTo}
                    tooltip={{ formatter: (value?: number) => value !== undefined ? formatTime(value) : '' }}
                  />

                  <Space>
                    <Button icon={<ScissorOutlined />} onClick={addClip}>
                      Add Clip at Current Time
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={() => seekTo(0)}>
                      Reset
                    </Button>
                  </Space>
                </Space>
              </div>
            )}
          </Card>

          {clips.length > 0 && (
            <Card title="Video Clips" style={{ marginTop: 16 }}>
              <Space wrap>
                {clips.map((clip) => (
                  <Card
                    key={clip.id}
                    size="small"
                    style={{
                      cursor: 'pointer',
                      border: selectedClip?.id === clip.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                    }}
                    onClick={() => selectClip(clip)}
                  >
                    <Space direction="vertical" style={{ width: 150 }}>
                      <Text strong>{clip.name}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                      </Text>
                      <Button
                        size="small"
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          removeClip(clip.id);
                        }}
                      >
                        Remove
                      </Button>
                    </Space>
                  </Card>
                ))}
              </Space>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="Upload Video">
              <Upload
                accept="video/*"
                beforeUpload={handleVideoUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} block>
                  Upload Video
                </Button>
              </Upload>
            </Card>

            <Card title="Video Effects">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Brightness: {effects.brightness}%</Text>
                  <Slider
                    min={0}
                    max={200}
                    value={effects.brightness}
                    onChange={(value) => updateEffect('brightness', value)}
                  />
                </div>

                <div>
                  <Text>Contrast: {effects.contrast}%</Text>
                  <Slider
                    min={0}
                    max={200}
                    value={effects.contrast}
                    onChange={(value) => updateEffect('contrast', value)}
                  />
                </div>

                <div>
                  <Text>Saturation: {effects.saturation}%</Text>
                  <Slider
                    min={0}
                    max={200}
                    value={effects.saturation}
                    onChange={(value) => updateEffect('saturation', value)}
                  />
                </div>

                <div>
                  <Text>Speed: {effects.speed}x</Text>
                  <Slider
                    min={0.25}
                    max={2}
                    step={0.25}
                    value={effects.speed}
                    onChange={(value) => updateEffect('speed', value)}
                  />
                </div>

                <div>
                  <Text>Volume: {effects.volume}%</Text>
                  <Slider
                    min={0}
                    max={100}
                    value={effects.volume}
                    onChange={(value) => updateEffect('volume', value)}
                  />
                </div>
              </Space>
            </Card>

            <Card title="Export">
              <Space direction="vertical" style={{ width: '100%' }}>
                {isProcessing ? (
                  <div>
                    <Text>Processing video...</Text>
                    <Progress percent={processingProgress} />
                  </div>
                ) : (
                  <>
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />} 
                      onClick={exportVideo}
                      block
                      disabled={!videoUrl}
                    >
                      Export Video
                    </Button>
                    <Button 
                      icon={<SaveOutlined />} 
                      onClick={saveToGallery}
                      block
                      disabled={!videoUrl}
                    >
                      Save to Gallery
                    </Button>
                  </>
                )}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Video Gallery */}
      {savedVideos.length > 0 && (
        <Card title="Video Gallery" style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            {savedVideos.map((video) => (
              <Col xs={24} sm={12} md={8} lg={6} key={video.id}>
                <Card
                  size="small"
                  hoverable
                  cover={
                    <div style={{
                      height: 120,
                      background: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <VideoCameraOutlined style={{ fontSize: 32, color: '#666' }} />
                    </div>
                  }
                  actions={[
                    <Button size="small" icon={<PlayCircleOutlined />}>
                      Play
                    </Button>,
                    <Button size="small" icon={<DownloadOutlined />}>
                      Download
                    </Button>,
                    <Button size="small" icon={<SaveOutlined />}>
                      Edit
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={video.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {formatTime(video.duration)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(video.createdAt).toLocaleDateString()}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {video.clips.length} clips
                        </Text>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default VideoEditor;
