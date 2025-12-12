import React, { useState, useRef } from 'react';
import { Card, Typography, Row, Col, Statistic, Progress, Table, Tag, Button, Space, Upload, Select, message, Slider } from 'antd';
import { 
  CompressOutlined, 
  DownloadOutlined, 
  PlayCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  FileImageOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface CompressionSettings {
  quality: number;
  resolution: 'original' | '720p' | '480p' | '360p';
  format: 'mp4' | 'webm' | 'avi';
  frameRate: number;
  bitrate: number;
}

interface CompressionResult {
  id: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  originalDuration: number;
  compressedDuration: number;
  originalResolution: string;
  compressedResolution: string;
  format: string;
  url: string;
  timestamp: Date;
}

const VideoCompression: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<CompressionResult | null>(null);
  
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 70,
    resolution: 'original',
    format: 'mp4',
    frameRate: 30,
    bitrate: 1000
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      message.success('Video uploaded successfully!');
    } else {
      message.error('Please upload a valid video file');
    }
  };

  const simulateCompression = async () => {
    if (!videoFile || !videoUrl) {
      message.error('Please upload a video first');
      return;
    }

    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const video = videoRef.current;
      if (!video) return;

      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      const originalSize = videoFile.size;
      const originalResolution = `${video.videoWidth}x${video.videoHeight}`;
      const originalDuration = video.duration;

      // Simulate compression process
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setCompressionProgress(i);
      }

      // Calculate compressed values based on settings
      let compressedResolution = originalResolution;
      if (settings.resolution !== 'original') {
        const resolutions = {
          '720p': '1280x720',
          '480p': '854x480',
          '360p': '640x360'
        };
        compressedResolution = resolutions[settings.resolution];
      }

      const qualityFactor = settings.quality / 100;
      const resolutionFactor = settings.resolution === 'original' ? 1 : 
        settings.resolution === '720p' ? 0.5 :
        settings.resolution === '480p' ? 0.3 : 0.2;

      const compressedSize = Math.round(originalSize * qualityFactor * resolutionFactor * 0.7);
      const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);

      const result: CompressionResult = {
        id: `compression-${Date.now()}`,
        originalSize,
        compressedSize,
        compressionRatio,
        originalDuration,
        compressedDuration: originalDuration, // Duration remains same
        originalResolution,
        compressedResolution,
        format: settings.format,
        url: videoUrl, // In real app, this would be the compressed video URL
        timestamp: new Date()
      };

      setCompressionResults(prev => [result, ...prev]);
      setSelectedResult(result);
      message.success('Video compressed successfully!');
    } catch (error) {
      message.error('Compression failed');
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const columns = [
    {
      title: 'Original',
      dataIndex: 'originalSize',
      key: 'originalSize',
      render: (size: number, record: CompressionResult) => (
        <div>
          <div>{formatFileSize(size)}</div>
          <Text type="secondary">
            {record.originalResolution} • {formatDuration(record.originalDuration)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Compressed',
      dataIndex: 'compressedSize',
      key: 'compressedSize',
      render: (size: number, record: CompressionResult) => (
        <div>
          <div>{formatFileSize(size)}</div>
          <Text type="secondary">
            {record.compressedResolution} • {record.format.toUpperCase()}
          </Text>
        </div>
      ),
    },
    {
      title: 'Compression',
      dataIndex: 'compressionRatio',
      key: 'compressionRatio',
      render: (ratio: number) => (
        <Tag color={ratio > 50 ? 'green' : ratio > 30 ? 'orange' : 'red'}>
          {ratio}% saved
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date: Date) => date.toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CompressionResult) => (
        <Space>
          <Button
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => setSelectedResult(record)}
          >
            Preview
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => message.info('Download started')}
          >
            Download
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Video Compression Tool</Title>
            <Text type="secondary">Optimize video size without compromising quality</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">{compressionResults.length} compressions</Tag>
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
                  handleFileUpload(file);
                  return false;
                }}
              >
                <Button icon={<FileImageOutlined />}>Choose Video File</Button>
              </Upload>

              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  style={{ width: '100%', maxHeight: 200 }}
                />
              )}

              {videoFile && (
                <div>
                  <Space>
                    <InfoCircleOutlined />
                    <Text strong>File Info:</Text>
                  </Space>
                  <div style={{ marginTop: 8 }}>
                    <div><Text type="secondary">Size:</Text> {formatFileSize(videoFile.size)}</div>
                    <div><Text type="secondary">Type:</Text> {videoFile.type}</div>
                    <div><Text type="secondary">Name:</Text> {videoFile.name}</div>
                  </div>
                </div>
              )}
            </Space>
          </Card>

          <Card title="Compression Settings" size="small" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Quality:</Text>
                <Slider
                  min={10}
                  max={100}
                  value={settings.quality}
                  onChange={(value: number) => setSettings(prev => ({ ...prev, quality: value }))}
                  marks={{ 10: 'Low', 50: 'Medium', 100: 'High' }}
                />
                <Text type="secondary">{settings.quality}%</Text>
              </div>

              <div>
                <Text strong>Resolution:</Text>
                <Select
                  value={settings.resolution}
                  onChange={(value) => setSettings(prev => ({ ...prev, resolution: value }))}
                  style={{ width: '100%' }}
                >
                  <Option value="original">Original</Option>
                  <Option value="720p">720p (HD)</Option>
                  <Option value="480p">480p (SD)</Option>
                  <Option value="360p">360p (Low)</Option>
                </Select>
              </div>

              <div>
                <Text strong>Output Format:</Text>
                <Select
                  value={settings.format}
                  onChange={(value) => setSettings(prev => ({ ...prev, format: value }))}
                  style={{ width: '100%' }}
                >
                  <Option value="mp4">MP4 (Recommended)</Option>
                  <Option value="webm">WebM (Web Optimized)</Option>
                  <Option value="avi">AVI (Legacy)</Option>
                </Select>
              </div>

              <div>
                <Text strong>Frame Rate:</Text>
                <Slider
                  min={15}
                  max={60}
                  value={settings.frameRate}
                  onChange={(value: number) => setSettings(prev => ({ ...prev, frameRate: value }))}
                  marks={{ 15: '15', 30: '30', 60: '60' }}
                />
                <Text type="secondary">{settings.frameRate} fps</Text>
              </div>

              <div>
                <Text strong>Bitrate (kbps):</Text>
                <Slider
                  min={500}
                  max={5000}
                  step={100}
                  value={settings.bitrate}
                  onChange={(value: number) => setSettings(prev => ({ ...prev, bitrate: value }))}
                  marks={{ 500: '500', 1000: '1k', 2500: '2.5k', 5000: '5k' }}
                />
                <Text type="secondary">{settings.bitrate} kbps</Text>
              </div>

              <Button
                type="primary"
                icon={<CompressOutlined />}
                onClick={simulateCompression}
                loading={isCompressing}
                disabled={!videoFile}
                block
              >
                Start Compression
              </Button>
            </Space>

            {isCompressing && (
              <Progress
                percent={compressionProgress}
                style={{ marginTop: 16 }}
                status="active"
                format={() => `${compressionProgress}%`}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Compression History" size="small">
            <Table
              columns={columns}
              dataSource={compressionResults}
              pagination={{ pageSize: 5 }}
              size="small"
              rowKey="id"
            />
          </Card>

          {selectedResult && (
            <Card title="Compression Details" size="small" style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={12}>
                  <Statistic
                    title="Space Saved"
                    value={selectedResult.compressionRatio}
                    suffix="%"
                    prefix={<ThunderboltOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col xs={12}>
                  <Statistic
                    title="Size Reduction"
                    value={formatFileSize(selectedResult.originalSize - selectedResult.compressedSize)}
                    prefix={<CompressOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>

              <div style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Original: </Text>
                    <Text>{formatFileSize(selectedResult.originalSize)} • {selectedResult.originalResolution}</Text>
                  </div>
                  <div>
                    <Text strong>Compressed: </Text>
                    <Text>{formatFileSize(selectedResult.compressedSize)} • {selectedResult.compressedResolution}</Text>
                  </div>
                  <div>
                    <Text strong>Format: </Text>
                    <Text>{selectedResult.format.toUpperCase()}</Text>
                  </div>
                  <div>
                    <Text strong>Duration: </Text>
                    <Text>{formatDuration(selectedResult.compressedDuration)}</Text>
                  </div>
                </Space>
              </div>

              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Space>
                  <Button icon={<PlayCircleOutlined />}>Preview</Button>
                  <Button type="primary" icon={<DownloadOutlined />}>Download</Button>
                </Space>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default VideoCompression;
