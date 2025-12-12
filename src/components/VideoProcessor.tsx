import React, { useState, useRef } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Upload, 
  message, 
  Progress, 
  List, 
  Modal, 
  Select, 
  Row, 
  Col,
  Alert,
  Tabs,
  Tag,
  Input,
  Badge
} from 'antd';
import { 
  VideoCameraOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  CameraOutlined,
  DesktopOutlined,
  MobileOutlined,
  ScissorOutlined,
  AudioOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface VideoFile {
  id: string;
  name: string;
  type: 'upload' | 'record' | 'screen' | 'mobile';
  format: string;
  size: number;
  duration?: number;
  resolution?: string;
  fps?: number;
  url: string;
  thumbnail?: string;
  createdAt: string;
  metadata?: {
    codec?: string;
    bitrate?: number;
    audioCodec?: string;
    audioBitrate?: number;
  };
}

interface ProcessingJob {
  id: string;
  videoId: string;
  type: 'compress' | 'convert' | 'trim' | 'extract_audio' | 'add_subtitles' | 'enhance';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  settings: any;
  result?: string;
}

const VideoProcessor: React.FC = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [processingModalVisible, setProcessingModalVisible] = useState(false);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [activeTab, setActiveTab] = useState('library');
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenRecording, setIsScreenRecording] = useState(false);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const videoFormats = [
    { value: 'mp4', label: 'MP4', description: 'Most compatible format' },
    { value: 'webm', label: 'WebM', description: 'Web optimized' },
    { value: 'avi', label: 'AVI', description: 'High quality' },
    { value: 'mov', label: 'MOV', description: 'Apple format' },
    { value: 'mkv', label: 'MKV', description: 'Container format' }
  ];

  const handleVideoUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      message.error('Please upload a video file');
      return false;
    }

    const videoFile: VideoFile = {
      id: Date.now().toString(),
      name: file.name,
      type: 'upload',
      format: file.type.split('/')[1] || 'unknown',
      size: file.size,
      url: URL.createObjectURL(file),
      createdAt: new Date().toISOString()
    };

    // Get video metadata
    const video = document.createElement('video');
    video.src = videoFile.url;
    video.onloadedmetadata = () => {
      videoFile.duration = video.duration;
      videoFile.resolution = `${video.videoWidth}x${video.videoHeight}`;
      
      setVideos(prev => [videoFile, ...prev]);
      message.success(`Video "${file.name}" uploaded successfully!`);
    };

    return false;
  };

  const startCameraRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoFile: VideoFile = {
          id: Date.now().toString(),
          name: `Camera Recording ${new Date().toLocaleString()}`,
          type: 'record',
          format: 'webm',
          size: blob.size,
          url: URL.createObjectURL(blob),
          createdAt: new Date().toISOString()
        };
        
        setVideos(prev => [videoFile, ...prev]);
        message.success('Camera recording saved successfully!');
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      message.info('Camera recording started');
    } catch (error) {
      message.error('Failed to access camera');
    }
  };

  const stopCameraRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      message.info('Camera recording stopped');
    }
  };

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoFile: VideoFile = {
          id: Date.now().toString(),
          name: `Screen Recording ${new Date().toLocaleString()}`,
          type: 'screen',
          format: 'webm',
          size: blob.size,
          url: URL.createObjectURL(blob),
          createdAt: new Date().toISOString()
        };
        
        setVideos(prev => [videoFile, ...prev]);
        message.success('Screen recording saved successfully!');
      };
      
      mediaRecorder.start();
      setIsScreenRecording(true);
      message.info('Screen recording started');
    } catch (error) {
      message.error('Failed to start screen recording');
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && isScreenRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsScreenRecording(false);
      message.info('Screen recording stopped');
    }
  };

  const generateVideoFromPrompt = async () => {
    if (!videoPrompt.trim()) {
      message.error('Please enter a prompt for video generation');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI video generation
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Create a placeholder video file
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Create gradient background
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#4ecdc4');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        context.fillStyle = 'white';
        context.font = '32px Arial';
        context.textAlign = 'center';
        context.fillText('AI Generated Video', canvas.width / 2, canvas.height / 2 - 30);
        context.font = '18px Arial';
        context.fillText(videoPrompt.substring(0, 60) + (videoPrompt.length > 60 ? '...' : ''), canvas.width / 2, canvas.height / 2 + 20);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const videoFile: VideoFile = {
              id: Date.now().toString(),
              name: `AI Generated: ${videoPrompt.substring(0, 30)}...`,
              type: 'mobile',
              format: 'mp4',
              size: blob.size,
              duration: 10, // Placeholder duration
              resolution: '640x360',
              fps: 30,
              url: canvas.toDataURL('image/png'), // Placeholder
              createdAt: new Date().toISOString()
            };

            setVideos(prev => [videoFile, ...prev]);
            message.success('Video generated successfully from prompt!');
            setPromptModalVisible(false);
            setVideoPrompt('');
          }
        }, 'image/png');
      }
    } catch (error) {
      message.error('Failed to generate video from prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const startProcessing = (type: ProcessingJob['type'], settings: any) => {
    if (!selectedVideo) {
      message.error('Please select a video first');
      return;
    }

    const job: ProcessingJob = {
      id: Date.now().toString(),
      videoId: selectedVideo.id,
      type,
      status: 'processing',
      progress: 0,
      settings
    };

    setProcessingJobs(prev => [job, ...prev]);
    setCurrentJob(job);
    setProcessingModalVisible(true);

    // Simulate processing
    const interval = setInterval(() => {
      setProcessingJobs(prev => prev.map(j => {
        if (j.id === job.id) {
          const newProgress = Math.min(j.progress + Math.random() * 15, 95);
          return { ...j, progress: newProgress };
        }
        return j;
      }));
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setProcessingJobs(prev => prev.map(j => {
        if (j.id === job.id) {
          return { 
            ...j, 
            status: 'completed',
            progress: 100,
            result: `processed_${selectedVideo.name}`
          };
        }
        return j;
      }));
      
      message.success(`Video ${type} completed successfully!`);
      setProcessingModalVisible(false);
    }, 3000);
  };

  const deleteVideo = (videoId: string) => {
    setVideos(prev => prev.filter(video => video.id !== videoId));
    message.success('Video deleted successfully!');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoIcon = (type: VideoFile['type']) => {
    switch (type) {
      case 'upload': return <UploadOutlined />;
      case 'record': return <CameraOutlined />;
      case 'screen': return <DesktopOutlined />;
      case 'mobile': return <MobileOutlined />;
      default: return <VideoCameraOutlined />;
    }
  };

  const getVideoTypeColor = (type: VideoFile['type']) => {
    switch (type) {
      case 'upload': return 'blue';
      case 'record': return 'green';
      case 'screen': return 'orange';
      case 'mobile': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Video Processor</Title>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Video Library" key="library">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Recording Controls */}
              <div>
                <Title level={4}>Recording Options</Title>
                <Row gutter={16}>
                  <Col span={6}>
                    <Button 
                      type="primary"
                      onClick={isRecording ? stopCameraRecording : startCameraRecording}
                      block
                    >
                      {isRecording ? 'Stop Camera' : 'Start Camera'}
                    </Button>
                  </Col>
                  <Col span={6}>
                    <Button 
                      type="primary"
                      onClick={isScreenRecording ? stopScreenRecording : startScreenRecording}
                      block
                    >
                      {isScreenRecording ? 'Stop Screen' : 'Start Screen'}
                    </Button>
                  </Col>
                  <Col span={6}>
                    <Upload
                      beforeUpload={handleVideoUpload}
                      showUploadList={false}
                      multiple={false}
                      accept="video/*"
                    >
                      <Button icon={<UploadOutlined />} block>
                        Upload Video
                      </Button>
                    </Upload>
                  </Col>
                  <Col span={6}>
                    <Button 
                      icon={<ThunderboltOutlined />}
                      onClick={() => setPromptModalVisible(true)}
                      type="primary"
                      block
                    >
                      AI Generate
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Video List */}
              <div>
                <Title level={4}>Video Library</Title>
                {videos.length === 0 ? (
                  <Alert
                    message="No videos yet"
                    description="Upload, record, or capture screen to add videos to your library."
                    type="info"
                    showIcon
                  />
                ) : (
                  <List
                    dataSource={videos}
                    renderItem={(video) => (
                      <List.Item
                        actions={[
                          <Button 
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedVideo(video);
                              setPreviewModalVisible(true);
                            }}
                          >
                            Preview
                          </Button>,
                          <Button 
                            icon={<SettingOutlined />}
                            onClick={() => {
                              setSelectedVideo(video);
                              setActiveTab('process');
                            }}
                          >
                            Process
                          </Button>,
                          <Button 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteVideo(video.id)}
                          >
                            Delete
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Badge count={getVideoIcon(video.type)}>{getVideoIcon(video.type)}</Badge>}
                          title={
                            <Space>
                              <Text strong>{video.name}</Text>
                              <Tag color={getVideoTypeColor(video.type)}>{video.type}</Tag>
                              <Tag>{video.format.toUpperCase()}</Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size="small">
                              <Text type="secondary">
                                Size: {formatFileSize(video.size)}
                                {video.duration && ` • Duration: ${formatDuration(video.duration)}`}
                                {video.resolution && ` • Resolution: ${video.resolution}`}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Created: {new Date(video.createdAt).toLocaleString()}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </Space>
          </TabPane>

          <TabPane tab="Video Processing" key="process">
            {selectedVideo ? (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Alert
                  message={`Processing: ${selectedVideo.name}`}
                  description="Choose a processing option below"
                  type="info"
                  showIcon
                />

                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Card 
                      size="small" 
                      title="Compress Video"
                      extra={<ScissorOutlined />}
                      hoverable
                      onClick={() => startProcessing('compress', { quality: 'medium' })}
                    >
                      <Text>Reduce file size while maintaining quality</Text>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card 
                      size="small" 
                      title="Convert Format"
                      extra={<VideoCameraOutlined />}
                      hoverable
                      onClick={() => {
                        Modal.confirm({
                          title: 'Select Format',
                          content: (
                            <Select defaultValue="mp4" style={{ width: '100%' }}>
                              {videoFormats.map(format => (
                                <Option key={format.value} value={format.value}>
                                  {format.label} - {format.description}
                                </Option>
                              ))}
                            </Select>
                          ),
                          onOk: () => startProcessing('convert', { format: 'mp4' })
                        });
                      }}
                    >
                      <Text>Convert to different video format</Text>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card 
                      size="small" 
                      title="Extract Audio"
                      extra={<AudioOutlined />}
                      hoverable
                      onClick={() => startProcessing('extract_audio', { format: 'mp3' })}
                    >
                      <Text>Extract audio track from video</Text>
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card 
                      size="small" 
                      title="Trim Video"
                      extra={<ScissorOutlined />}
                      hoverable
                      onClick={() => {
                        Modal.confirm({
                          title: 'Trim Settings',
                          content: (
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Input placeholder="Start time (e.g., 00:10)" />
                              <Input placeholder="End time (e.g., 01:30)" />
                            </Space>
                          ),
                          onOk: () => startProcessing('trim', { start: 10, end: 90 })
                        });
                      }}
                    >
                      <Text>Cut video to specific time range</Text>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card 
                      size="small" 
                      title="Enhance Quality"
                      extra={<SettingOutlined />}
                      hoverable
                      onClick={() => startProcessing('enhance', { upscale: true, denoise: true })}
                    >
                      <Text>Improve video quality with AI enhancement</Text>
                    </Card>
                  </Col>
                </Row>
              </Space>
            ) : (
              <Alert
                message="No video selected"
                description="Please select a video from the library to process."
                type="warning"
                showIcon
              />
            )}
          </TabPane>

          <TabPane tab="Processing Queue" key="queue">
            <div>
              <Title level={4}>Processing Jobs</Title>
              {processingJobs.length === 0 ? (
                <Alert
                  message="No processing jobs"
                  description="Your video processing jobs will appear here."
                  type="info"
                  showIcon
                />
              ) : (
                <List
                  dataSource={processingJobs}
                  renderItem={(job) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<SettingOutlined spin={job.status === 'processing'} />}
                        title={
                          <Space>
                            <Text>{job.type.replace('_', ' ').toUpperCase()}</Text>
                            <Tag color={job.status === 'completed' ? 'green' : job.status === 'processing' ? 'blue' : job.status === 'failed' ? 'red' : 'default'}>
                              {job.status}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text type="secondary">
                              Video: {videos.find(v => v.id === job.videoId)?.name || 'Unknown'}
                            </Text>
                            {job.status === 'processing' && (
                              <Progress percent={Math.round(job.progress)} status="active" size="small" />
                            )}
                            {job.status === 'completed' && (
                              <Progress percent={100} status="success" size="small" />
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Video Preview Modal */}
      <Modal
        title={`Video Preview - ${selectedVideo?.name}`}
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedVideo && (
          <video
            src={selectedVideo.url}
            controls
            style={{ width: '100%', maxHeight: 500 }}
            autoPlay
          />
        )}
      </Modal>

      {/* Processing Modal */}
      <Modal
        title="Processing Video"
        visible={processingModalVisible}
        onCancel={() => setProcessingModalVisible(false)}
        footer={null}
        closable={false}
      >
        {currentJob && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Text>Processing: {currentJob.type.replace('_', ' ').toUpperCase()}</Text>
            <Progress percent={Math.round(currentJob.progress)} status="active" />
            <Text type="secondary">Please wait while we process your video...</Text>
          </Space>
        )}
      </Modal>

      {/* AI Video Generation Modal */}
      <Modal
        title="Generate Video with AI"
        visible={promptModalVisible}
        onOk={generateVideoFromPrompt}
        onCancel={() => setPromptModalVisible(false)}
        confirmLoading={isGenerating}
        okText="Generate"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Describe the video you want to generate:</Text>
            <TextArea
              value={videoPrompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVideoPrompt(e.target.value)}
              placeholder="e.g., A scenic landscape with mountains and lakes, cinematic style..."
              rows={4}
              style={{ marginTop: 8 }}
            />
          </div>
          <Alert
            message="AI Video Generation"
            description="This feature uses AI to generate videos based on your text description. The generated videos will be added to your library."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default VideoProcessor;
