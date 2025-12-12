import React, { useState, useRef, useCallback } from 'react';
import { Card, Typography, Button, Space, Row, Col, Slider, Select, message, Upload, Image, Progress, Tag } from 'antd';
import { 
  PictureOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  UploadOutlined,
  ScissorOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface Thumbnail {
  id: string;
  url: string;
  timestamp: number;
  selected: boolean;
}

const VideoThumbnails: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [thumbnailCount, setThumbnailCount] = useState(6);
  const [thumbnailQuality, setThumbnailQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [videoDuration, setVideoDuration] = useState(0);
  const [customTimestamp, setCustomTimestamp] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateThumbnails = useCallback(async () => {
    if (!videoUrl || !videoRef.current) {
      message.error('Please upload a video first');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    const newThumbnails: Thumbnail[] = [];

    try {
      const video = videoRef.current;
      video.currentTime = 0;
      
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      const duration = video.duration;
      setVideoDuration(duration);
      const interval = duration / thumbnailCount;

      for (let i = 0; i < thumbnailCount; i++) {
        const timestamp = i * interval;
        video.currentTime = timestamp;
        
        await new Promise(resolve => {
          video.onseeked = resolve;
        });

        const canvas = canvasRef.current;
        if (!canvas) continue;

        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        canvas.width = thumbnailQuality === 'high' ? 320 : thumbnailQuality === 'medium' ? 240 : 160;
        canvas.height = canvas.width * (video.videoHeight / video.videoWidth);

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        newThumbnails.push({
          id: `thumb-${i}`,
          url: dataUrl,
          timestamp: Math.round(timestamp),
          selected: i === 0
        });

        setGenerationProgress(((i + 1) / thumbnailCount) * 100);
      }

      setThumbnails(newThumbnails);
      setSelectedThumbnail(newThumbnails[0]?.id || '');
      message.success('Thumbnails generated successfully!');
    } catch (error) {
      message.error('Failed to generate thumbnails');
    } finally {
      setIsGenerating(false);
    }
  }, [videoUrl, thumbnailCount, thumbnailQuality]);

  const generateCustomThumbnail = useCallback(async () => {
    if (!videoUrl || !videoRef.current) {
      message.error('Please upload a video first');
      return;
    }

    try {
      const video = videoRef.current;
      video.currentTime = customTimestamp;
      
      await new Promise(resolve => {
        video.onseeked = resolve;
      });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 320;
      canvas.height = 320 * (video.videoHeight / video.videoWidth);

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      const newThumbnail: Thumbnail = {
        id: `thumb-custom-${Date.now()}`,
        url: dataUrl,
        timestamp: customTimestamp,
        selected: true
      };

      setThumbnails(prev => [...prev, newThumbnail]);
      setSelectedThumbnail(newThumbnail.id);
      message.success('Custom thumbnail generated!');
    } catch (error) {
      message.error('Failed to generate custom thumbnail');
    }
  }, [videoUrl, customTimestamp]);

  const selectThumbnail = (thumbnailId: string) => {
    setSelectedThumbnail(thumbnailId);
    setThumbnails(prev => prev.map(thumb => ({
      ...thumb,
      selected: thumb.id === thumbnailId
    })));
  };

  const downloadThumbnail = () => {
    const thumbnail = thumbnails.find(thumb => thumb.id === selectedThumbnail);
    if (!thumbnail) return;

    const link = document.createElement('a');
    link.href = thumbnail.url;
    link.download = `thumbnail-${thumbnail.timestamp}s.jpg`;
    link.click();
    message.success('Thumbnail downloaded!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Video Thumbnails Generator</Title>
            <Text type="secondary">Generate and customize video thumbnails</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">{thumbnails.length} thumbnails</Tag>
              {selectedThumbnail && <Tag color="green">1 selected</Tag>}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Video Upload" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                accept="video/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  const url = URL.createObjectURL(file);
                  setVideoUrl(url);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Upload Video</Button>
              </Upload>

              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  style={{ width: '100%', maxHeight: 200 }}
                />
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Space>
          </Card>

          <Card title="Thumbnail Settings" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Number of Thumbnails:</Text>
                <Slider
                  min={3}
                  max={12}
                  value={thumbnailCount}
                  onChange={setThumbnailCount}
                  marks={{ 3: '3', 6: '6', 9: '9', 12: '12' }}
                />
              </div>

              <div>
                <Text strong>Quality:</Text>
                <Select value={thumbnailQuality} onChange={setThumbnailQuality} style={{ width: '100%' }}>
                  <Option value="low">Low (160px)</Option>
                  <Option value="medium">Medium (240px)</Option>
                  <Option value="high">High (320px)</Option>
                </Select>
              </div>

              <div>
                <Text strong>Custom Timestamp (seconds):</Text>
                <Slider
                  min={0}
                  max={videoDuration || 100}
                  value={customTimestamp}
                  onChange={setCustomTimestamp}
                  tooltip={{ formatter: (value?: number) => value ? formatTime(value) : '' }}
                />
                <Text type="secondary">{formatTime(customTimestamp)}</Text>
              </div>

              <Space>
                <Button
                  type="primary"
                  icon={<PictureOutlined />}
                  onClick={generateThumbnails}
                  loading={isGenerating}
                  disabled={!videoUrl}
                >
                  Generate Thumbnails
                </Button>
                <Button
                  icon={<ScissorOutlined />}
                  onClick={generateCustomThumbnail}
                  disabled={!videoUrl}
                >
                  Custom Thumbnail
                </Button>
              </Space>
            </Space>

            {isGenerating && (
              <Progress
                percent={generationProgress}
                style={{ marginTop: 16 }}
                status="active"
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Generated Thumbnails" size="small">
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              <Row gutter={[8, 8]}>
                {thumbnails.map((thumbnail) => (
                  <Col xs={12} sm={8} md={6} key={thumbnail.id}>
                    <div
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        border: thumbnail.selected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                      onClick={() => selectThumbnail(thumbnail.id)}
                    >
                      <Image
                        src={thumbnail.url}
                        alt={`Thumbnail at ${formatTime(thumbnail.timestamp)}`}
                        preview={false}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: 2,
                          textAlign: 'center',
                          fontSize: 10
                        }}
                      >
                        {formatTime(thumbnail.timestamp)}
                      </div>
                      {thumbnail.selected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: '#1890ff',
                            color: 'white',
                            borderRadius: '50%',
                            width: 16,
                            height: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            {selectedThumbnail && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Space>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => {
                      const thumbnail = thumbnails.find(thumb => thumb.id === selectedThumbnail);
                      if (thumbnail) {
                        window.open(thumbnail.url, '_blank');
                      }
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    type="primary"
                    onClick={downloadThumbnail}
                  >
                    Download
                  </Button>
                </Space>
              </div>
            )}
          </Card>

          {selectedThumbnail && (
            <Card title="Selected Thumbnail Preview" size="small" style={{ marginTop: 16 }}>
              <Image
                src={thumbnails.find(thumb => thumb.id === selectedThumbnail)?.url}
                alt="Selected thumbnail"
                style={{ width: '100%' }}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default VideoThumbnails;
