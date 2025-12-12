import React, { useState, useRef, useCallback } from 'react';
import { Card, Typography, Button, Space, Row, Col, Select, Input, Slider, message, Upload, Image, ColorPicker, Tag } from 'antd';
import { 
  FontSizeOutlined, 
  PictureOutlined, 
  DownloadOutlined,
  EyeOutlined,
  SettingOutlined,
  UploadOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface WatermarkSettings {
  type: 'text' | 'image' | 'logo';
  text?: string;
  imageUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size: number;
  color: string;
  fontSize: number;
  fontFamily: string;
  rotation: number;
  animation: boolean;
}

interface WatermarkResult {
  id: string;
  originalUrl: string;
  watermarkedUrl: string;
  settings: WatermarkSettings;
  timestamp: Date;
}

const VideoWatermark: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [watermarkResults, setWatermarkResults] = useState<WatermarkResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<WatermarkResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [settings, setSettings] = useState<WatermarkSettings>({
    type: 'text',
    text: '© Your Brand',
    position: 'bottom-right',
    opacity: 70,
    size: 50,
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Arial',
    rotation: 0,
    animation: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = (file: File) => {
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      message.success('Video uploaded successfully!');
    } else {
      message.error('Please upload a valid video file');
    }
  };

  const handleImageUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSettings(prev => ({ ...prev, imageUrl: url, type: 'image' }));
      message.success('Watermark image uploaded!');
    } else {
      message.error('Please upload a valid image file');
    }
  };

  const applyWatermark = useCallback(async () => {
    if (!videoUrl || !videoRef.current || !canvasRef.current) {
      message.error('Please upload a video first');
      return;
    }

    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');

      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Process first frame as preview
      video.currentTime = 0;
      await new Promise(resolve => {
        video.onseeked = resolve;
      });

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply watermark
      await drawWatermark(ctx, canvas.width, canvas.height);

      // Simulate processing progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
              }

      const watermarkedUrl = canvas.toDataURL('image/png');
      
      const result: WatermarkResult = {
        id: `watermark-${Date.now()}`,
        originalUrl: videoUrl,
        watermarkedUrl,
        settings: { ...settings },
        timestamp: new Date()
      };

      setWatermarkResults(prev => [result, ...prev]);
      setSelectedResult(result);
      message.success('Watermark applied successfully!');
    } catch (error) {
      message.error('Failed to apply watermark');
    } finally {
      setIsProcessing(false);
          }
  }, [videoUrl, settings]);

  const drawWatermark = async (ctx: CanvasRenderingContext2D, videoWidth: number, videoHeight: number) => {
    const { type, text, imageUrl, position, opacity, size, color, fontSize, fontFamily, rotation } = settings;

    ctx.save();
    ctx.globalAlpha = opacity / 100;

    // Calculate position
    let x = 0, y = 0;
    const padding = 20;

    switch (position) {
      case 'top-left':
        x = padding;
        y = padding;
        break;
      case 'top-right':
        x = videoWidth - size - padding;
        y = padding;
        break;
      case 'bottom-left':
        x = padding;
        y = videoHeight - size - padding;
        break;
      case 'bottom-right':
        x = videoWidth - size - padding;
        y = videoHeight - size - padding;
        break;
      case 'center':
        x = (videoWidth - size) / 2;
        y = (videoHeight - size) / 2;
        break;
    }

    // Apply rotation
    if (rotation !== 0) {
      ctx.translate(x + size / 2, y + size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-(x + size / 2), -(y + size / 2));
    }

    if (type === 'text' && text) {
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + size / 2, y + size / 2);
    } else if ((type === 'image' || type === 'logo') && imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      await new Promise(resolve => {
        img.onload = resolve;
      });
      ctx.drawImage(img, x, y, size, size);
    }

    ctx.restore();
  };

  const downloadWatermarked = () => {
    if (!selectedResult) return;

    const link = document.createElement('a');
    link.href = selectedResult.watermarkedUrl;
    link.download = `watermarked-${Date.now()}.png`;
    link.click();
    message.success('Watermarked video downloaded!');
  };

  const resetSettings = () => {
    setSettings({
      type: 'text',
      text: '© Your Brand',
      position: 'bottom-right',
      opacity: 70,
      size: 50,
      color: '#ffffff',
      fontSize: 24,
      fontFamily: 'Arial',
      rotation: 0,
      animation: false
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Video Watermark Tool</Title>
            <Text type="secondary">Add custom watermarks to protect your content</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">{watermarkResults.length} watermarks</Tag>
              {selectedResult && <Tag color="green">1 selected</Tag>}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Upload Video" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                accept="video/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  handleVideoUpload(file);
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

          <Card title="Watermark Settings" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Watermark Type:</Text>
                <Select
                  value={settings.type}
                  onChange={(value) => setSettings(prev => ({ ...prev, type: value }))}
                  style={{ width: '100%' }}
                >
                  <Option value="text">Text</Option>
                  <Option value="image">Image</Option>
                  <Option value="logo">Logo</Option>
                </Select>
              </div>

              {settings.type === 'text' && (
                <>
                  <div>
                    <Text strong>Text:</Text>
                    <Input
                      value={settings.text}
                      onChange={(e) => setSettings(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter watermark text"
                    />
                  </div>

                  <div>
                    <Text strong>Font Family:</Text>
                    <Select
                      value={settings.fontFamily}
                      onChange={(value) => setSettings(prev => ({ ...prev, fontFamily: value }))}
                      style={{ width: '100%' }}
                    >
                      <Option value="Arial">Arial</Option>
                      <Option value="Times New Roman">Times New Roman</Option>
                      <Option value="Courier New">Courier New</Option>
                      <Option value="Georgia">Georgia</Option>
                      <Option value="Verdana">Verdana</Option>
                    </Select>
                  </div>

                  <div>
                    <Text strong>Font Size:</Text>
                    <Slider
                      min={12}
                      max={72}
                      value={settings.fontSize}
                      onChange={(value) => setSettings(prev => ({ ...prev, fontSize: value }))}
                    />
                    <Text type="secondary">{settings.fontSize}px</Text>
                  </div>
                </>
              )}

              {(settings.type === 'image' || settings.type === 'logo') && (
                <div>
                  <Text strong>Watermark Image:</Text>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleImageUpload(file);
                      return false;
                    }}
                  >
                    <Button icon={<PictureOutlined />}>Upload Image</Button>
                  </Upload>
                  {settings.imageUrl && (
                    <Image
                      src={settings.imageUrl}
                      alt="Watermark"
                      style={{ width: 50, height: 50, marginTop: 8 }}
                    />
                  )}
                </div>
              )}

              <div>
                <Text strong>Position:</Text>
                <Select
                  value={settings.position}
                  onChange={(value) => setSettings(prev => ({ ...prev, position: value }))}
                  style={{ width: '100%' }}
                >
                  <Option value="top-left">Top Left</Option>
                  <Option value="top-right">Top Right</Option>
                  <Option value="bottom-left">Bottom Left</Option>
                  <Option value="bottom-right">Bottom Right</Option>
                  <Option value="center">Center</Option>
                </Select>
              </div>

              <div>
                <Text strong>Opacity:</Text>
                <Slider
                  min={10}
                  max={100}
                  value={settings.opacity}
                  onChange={(value) => setSettings(prev => ({ ...prev, opacity: value }))}
                />
                <Text type="secondary">{settings.opacity}%</Text>
              </div>

              <div>
                <Text strong>Size:</Text>
                <Slider
                  min={20}
                  max={200}
                  value={settings.size}
                  onChange={(value) => setSettings(prev => ({ ...prev, size: value }))}
                />
                <Text type="secondary">{settings.size}px</Text>
              </div>

              <div>
                <Text strong>Rotation:</Text>
                <Slider
                  min={-180}
                  max={180}
                  value={settings.rotation}
                  onChange={(value) => setSettings(prev => ({ ...prev, rotation: value }))}
                />
                <Text type="secondary">{settings.rotation}°</Text>
              </div>

              <div>
                <Text strong>Color:</Text>
                <ColorPicker
                  value={settings.color}
                  onChange={(color) => setSettings(prev => ({ ...prev, color: color.toHexString() }))}
                />
              </div>

              <div>
                <Space>
                  <Button
                    type="primary"
                    icon={<FontSizeOutlined />}
                    onClick={applyWatermark}
                    loading={isProcessing}
                    disabled={!videoUrl}
                  >
                    Apply Watermark
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={resetSettings}>
                    Reset
                  </Button>
                </Space>
              </div>
            </Space>

            {isProcessing && (
              <div style={{ marginTop: 16 }}>
                <Text>Processing watermark...</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Watermark Preview" size="small">
            {selectedResult ? (
              <div>
                <Image
                  src={selectedResult.watermarkedUrl}
                  alt="Watermarked video preview"
                  style={{ width: '100%' }}
                />
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Space>
                    <Button icon={<EyeOutlined />}>Full Preview</Button>
                    <Button type="primary" icon={<DownloadOutlined />} onClick={downloadWatermarked}>
                      Download
                    </Button>
                  </Space>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <SettingOutlined style={{ fontSize: 48 }} />
                <div style={{ marginTop: 16 }}>Upload a video and apply watermark to see preview</div>
              </div>
            )}
          </Card>

          {selectedResult && (
            <Card title="Watermark Details" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Type: </Text>
                  <Text>{selectedResult.settings.type}</Text>
                </div>
                <div>
                  <Text strong>Position: </Text>
                  <Text>{selectedResult.settings.position}</Text>
                </div>
                <div>
                  <Text strong>Opacity: </Text>
                  <Text>{selectedResult.settings.opacity}%</Text>
                </div>
                <div>
                  <Text strong>Size: </Text>
                  <Text>{selectedResult.settings.size}px</Text>
                </div>
                <div>
                  <Text strong>Created: </Text>
                  <Text>{selectedResult.timestamp.toLocaleString()}</Text>
                </div>
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default VideoWatermark;
