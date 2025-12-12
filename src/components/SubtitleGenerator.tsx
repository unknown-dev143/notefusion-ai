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
  Input, 
  Select, 
  Row, 
  Col,
  Divider,
  Alert,
  Tabs,
  Tag,
  Switch
} from 'antd';
import { 
  VideoCameraOutlined,
  FileTextOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
  TranslationOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence?: number;
  language?: string;
}

interface VideoFile {
  id: string;
  name: string;
  size: number;
  duration?: number;
  url: string;
  subtitles?: Subtitle[];
}

const SubtitleGenerator: React.FC = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [editingSubtitle, setEditingSubtitle] = useState<Subtitle | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [autoSave, setAutoSave] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' }
  ];

  const handleVideoUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      message.error('Please upload a video file');
      return false;
    }

    const videoFile: VideoFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    };

    setVideos(prev => [videoFile, ...prev]);
    message.success(`Video "${file.name}" uploaded successfully!`);
    return false;
  };

  const generateSubtitles = async (video: VideoFile) => {
    setSelectedVideo(video);
    setIsGenerating(true);
    setProgress(0);

    // Simulate subtitle generation
    const mockSubtitles: Subtitle[] = [
      { id: '1', startTime: 0, endTime: 3, text: 'Welcome to our presentation', confidence: 0.95, language: 'en' },
      { id: '2', startTime: 3, endTime: 6, text: 'Today we will discuss machine learning', confidence: 0.92, language: 'en' },
      { id: '3', startTime: 6, endTime: 9, text: 'Machine learning is a subset of AI', confidence: 0.98, language: 'en' },
      { id: '4', startTime: 9, endTime: 12, text: 'It enables systems to learn from data', confidence: 0.89, language: 'en' },
      { id: '5', startTime: 12, endTime: 15, text: 'Let me show you some examples', confidence: 0.94, language: 'en' },
      { id: '6', startTime: 15, endTime: 18, text: 'Here is our first demonstration', confidence: 0.91, language: 'en' },
      { id: '7', startTime: 18, endTime: 21, text: 'Notice how the system adapts', confidence: 0.87, language: 'en' },
      { id: '8', startTime: 21, endTime: 24, text: 'This is the power of machine learning', confidence: 0.96, language: 'en' }
    ];

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setSubtitles(mockSubtitles);
      setIsGenerating(false);
      message.success('Subtitles generated successfully!');
    }, 3000);
  };

  const translateSubtitles = async () => {
    if (subtitles.length === 0) {
      message.error('Please generate subtitles first');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulate translation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      const translatedSubtitles = subtitles.map(subtitle => ({
        ...subtitle,
        text: `[${targetLanguage.toUpperCase()}] ${subtitle.text}`,
        language: targetLanguage
      }));
      
      setSubtitles(translatedSubtitles);
      setIsGenerating(false);
      message.success(`Subtitles translated to ${languages.find(l => l.code === targetLanguage)?.name}!`);
    }, 2000);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const editSubtitle = (subtitle: Subtitle) => {
    setEditingSubtitle(subtitle);
    setEditModalVisible(true);
  };

  const saveSubtitle = () => {
    if (!editingSubtitle) return;

    setSubtitles(prev => prev.map(sub => 
      sub.id === editingSubtitle.id ? editingSubtitle : sub
    ));

    setEditModalVisible(false);
    setEditingSubtitle(null);
    message.success('Subtitle updated successfully!');
  };

  const deleteSubtitle = (subtitleId: string) => {
    setSubtitles(prev => prev.filter(sub => sub.id !== subtitleId));
    message.success('Subtitle deleted successfully!');
  };

  const exportSubtitles = (format: 'srt' | 'vtt' | 'txt' | 'json') => {
    if (subtitles.length === 0) {
      message.error('No subtitles to export');
      return;
    }

    let content = '';
    let fileName = `subtitles.${format}`;
    let mimeType = 'text/plain';

    switch (format) {
      case 'srt':
        content = subtitles.map((sub, index) => 
          `${index + 1}\n${formatTime(sub.startTime)} --> ${formatTime(sub.endTime)}\n${sub.text}\n`
        ).join('\n');
        break;
      case 'vtt':
        content = 'WEBVTT\n\n' + subtitles.map(sub => 
          `${formatTime(sub.startTime)} --> ${formatTime(sub.endTime)}\n${sub.text}\n`
        ).join('\n');
        break;
      case 'txt':
        content = subtitles.map(sub => 
          `[${formatTime(sub.startTime)} - ${formatTime(sub.endTime)}] ${sub.text}`
        ).join('\n');
        break;
      case 'json':
        content = JSON.stringify(subtitles, null, 2);
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success(`Subtitles exported as ${format.toUpperCase()} successfully!`);
  };

  const importToNotes = () => {
    if (subtitles.length === 0) {
      message.error('No subtitles to import');
      return;
    }

    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const newNote = {
      id: Date.now().toString(),
      title: `Video Transcript - ${selectedVideo?.name || 'Untitled'}`,
      content: subtitles.map(sub => 
        `[${formatTime(sub.startTime)} - ${formatTime(sub.endTime)}] ${sub.text}`
      ).join('\n\n'),
      category: 'study',
      tags: ['video', 'transcript', 'subtitles'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      format: 'plain'
    };

    notes.unshift(newNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    message.success('Subtitles imported to notes successfully!');
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Subtitle Generator</Title>
      
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Upload Section */}
          <div>
            <Title level={4}>Upload Video</Title>
            <Upload
              beforeUpload={handleVideoUpload}
              showUploadList={false}
              multiple={false}
              accept="video/*"
            >
              <Button icon={<UploadOutlined />} size="large">
                Select Video File
              </Button>
            </Upload>
          </div>

          {/* Video List */}
          {videos.length > 0 && (
            <div>
              <Title level={4}>Uploaded Videos</Title>
              <List
                dataSource={videos}
                renderItem={(video) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="primary" 
                        icon={<FileTextOutlined />}
                        onClick={() => generateSubtitles(video)}
                        loading={isGenerating && selectedVideo?.id === video.id}
                      >
                        Generate Subtitles
                      </Button>,
                      <Button 
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setSelectedVideo(video);
                          setPreviewModalVisible(true);
                        }}
                      >
                        Preview
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<VideoCameraOutlined />}
                      title={video.name}
                      description={`Size: ${(video.size / 1024 / 1024).toFixed(2)} MB`}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* Subtitle Controls */}
          {selectedVideo && (
            <div>
              <Title level={4}>Subtitle Controls</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <div>
                    <Text strong>Target Language</Text>
                    <Select
                      value={targetLanguage}
                      onChange={setTargetLanguage}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      {languages.map(lang => (
                        <Option key={lang.code} value={lang.code}>
                          {lang.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <Text strong>Auto-save</Text>
                    <div style={{ marginTop: 8 }}>
                      <Switch checked={autoSave} onChange={setAutoSave} />
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <Button 
                    icon={<TranslationOutlined />}
                    onClick={translateSubtitles}
                    loading={isGenerating}
                    block
                  >
                    Translate
                  </Button>
                </Col>
              </Row>

              {isGenerating && (
                <div style={{ marginTop: 16 }}>
                  <Text>Processing...</Text>
                  <Progress percent={progress} status="active" />
                </div>
              )}
            </div>
          )}

          {/* Subtitles List */}
          {subtitles.length > 0 && (
            <div>
              <Title level={4}>Generated Subtitles</Title>
              <Tabs defaultActiveKey="list">
                <TabPane tab="List View" key="list">
                  <List
                    dataSource={subtitles}
                    renderItem={(subtitle) => (
                      <List.Item
                        actions={[
                          <Button 
                            icon={<PlayCircleOutlined />}
                            onClick={() => jumpToTime(subtitle.startTime)}
                            size="small"
                          >
                            Play
                          </Button>,
                          <Button 
                            icon={<EditOutlined />}
                            onClick={() => editSubtitle(subtitle)}
                            size="small"
                          >
                            Edit
                          </Button>,
                          <Button 
                            danger
                            onClick={() => deleteSubtitle(subtitle.id)}
                            size="small"
                          >
                            Delete
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<ClockCircleOutlined />}
                          title={
                            <Space>
                              <Text>{formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}</Text>
                              {subtitle.confidence && (
                                <Tag color="green">{Math.round(subtitle.confidence * 100)}%</Tag>
                              )}
                            </Space>
                          }
                          description={subtitle.text}
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>
                <TabPane tab="Timeline View" key="timeline">
                  <div style={{ padding: 20, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                    {subtitles.map((subtitle) => (
                      <div
                        key={subtitle.id}
                        style={{
                          position: 'relative',
                          height: 40,
                          marginBottom: 4,
                          backgroundColor: currentTime >= subtitle.startTime && currentTime <= subtitle.endTime ? '#1890ff' : '#e6f7ff',
                          border: '1px solid #91d5ff',
                          borderRadius: 4,
                          padding: '8px 12px',
                          cursor: 'pointer'
                        }}
                        onClick={() => jumpToTime(subtitle.startTime)}
                      >
                        <Text style={{ fontSize: 12, color: currentTime >= subtitle.startTime && currentTime <= subtitle.endTime ? 'white' : 'black' }}>
                          {subtitle.text}
                        </Text>
                      </div>
                    ))}
                  </div>
                </TabPane>
              </Tabs>

              <Divider />

              {/* Export Options */}
              <div>
                <Title level={4}>Export Options</Title>
                <Space wrap>
                  <Button icon={<DownloadOutlined />} onClick={() => exportSubtitles('srt')}>
                    Export as SRT
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={() => exportSubtitles('vtt')}>
                    Export as VTT
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={() => exportSubtitles('txt')}>
                    Export as TXT
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={() => exportSubtitles('json')}>
                    Export as JSON
                  </Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={importToNotes}>
                    Import to Notes
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Space>
      </Card>

      {/* Edit Subtitle Modal */}
      <Modal
        title="Edit Subtitle"
        visible={editModalVisible}
        onOk={saveSubtitle}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingSubtitle(null);
        }}
        okText="Save"
        cancelText="Cancel"
      >
        {editingSubtitle && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Start Time</Text>
              <Input
                value={formatTime(editingSubtitle.startTime)}
                onChange={(e) => {
                  const parts = e.target.value.split(':');
                  const seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                  setEditingSubtitle({ ...editingSubtitle, startTime: seconds });
                }}
                style={{ marginTop: 8 }}
              />
            </div>
            <div>
              <Text strong>End Time</Text>
              <Input
                value={formatTime(editingSubtitle.endTime)}
                onChange={(e) => {
                  const parts = e.target.value.split(':');
                  const seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                  setEditingSubtitle({ ...editingSubtitle, endTime: seconds });
                }}
                style={{ marginTop: 8 }}
              />
            </div>
            <div>
              <Text strong>Text</Text>
              <TextArea
                value={editingSubtitle.text}
                onChange={(e) => setEditingSubtitle({ ...editingSubtitle, text: e.target.value })}
                rows={3}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        )}
      </Modal>

      {/* Video Preview Modal */}
      <Modal
        title={`Video Preview - ${selectedVideo?.name}`}
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedVideo && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <video
              ref={videoRef}
              src={selectedVideo.url}
              controls
              style={{ width: '100%', maxHeight: 400 }}
              onTimeUpdate={handleVideoTimeUpdate}
            />
            
            <div>
              <Space>
                <Button 
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={togglePlayPause}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Text>Current Time: {formatTime(currentTime)}</Text>
              </Space>
            </div>

            {subtitles.length > 0 && (
              <Alert
                message={`${subtitles.length} subtitles available`}
                description="Subtitles are synchronized with the video timeline"
                type="info"
                showIcon
              />
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default SubtitleGenerator;
