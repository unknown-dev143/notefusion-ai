import React, { useState, useRef, useCallback } from 'react';
import { Card, Typography, Button, Space, Row, Col, Input, message, Upload, Table, Tag, Modal, Form, TimePicker, Tooltip } from 'antd';
import { 
  PlayCircleOutlined, 
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Chapter {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  thumbnail?: string;
  duration: number;
}


const VideoChapters: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [form] = Form.useForm();

  const handleVideoUpload = (file: File) => {
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setChapters([]);
      message.success('Video uploaded successfully!');
    } else {
      message.error('Please upload a valid video file');
    }
  };

  const handleVideoTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleVideoLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setTotalDuration(videoRef.current.duration);
    }
  }, []);

  const addChapterAtCurrentTime = () => {
    if (!videoRef.current) return;

    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title: `Chapter ${chapters.length + 1}`,
      description: '',
      timestamp: currentTime,
      duration: 0,
      thumbnail: generateThumbnail(currentTime)
    };

    setEditingChapter(newChapter);
    setIsModalVisible(true);
    form.setFieldsValue({
      title: newChapter.title,
      description: newChapter.description,
      timestamp: dayjs().startOf('day').add(currentTime, 'second')
    });
  };

  const generateThumbnail = (time: number): string => {
    if (!videoRef.current || !canvasRef.current) return '';

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    video.currentTime = time;
    canvas.width = 160;
    canvas.height = 90;

    setTimeout(() => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }, 100);

    return canvas.toDataURL('image/jpeg', 0.7);
  };

  const saveChapter = () => {
    form.validateFields().then(values => {
      const chapterData: Chapter = {
        id: editingChapter?.id || `chapter-${Date.now()}`,
        title: values.title,
        description: values.description,
        timestamp: values.timestamp.diff(dayjs().startOf('day'), 'second'),
        duration: 0,
        thumbnail: editingChapter?.thumbnail
      };

      if (editingChapter) {
        setChapters(prev => prev.map(ch => ch.id === editingChapter.id ? chapterData : ch));
      } else {
        setChapters(prev => [...prev, chapterData].sort((a, b) => a.timestamp - b.timestamp));
      }

      setIsModalVisible(false);
      setEditingChapter(null);
      form.resetFields();
      message.success('Chapter saved successfully!');
    });
  };

  const editChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setIsModalVisible(true);
    form.setFieldsValue({
      title: chapter.title,
      description: chapter.description,
      timestamp: dayjs().startOf('day').add(chapter.timestamp, 'second')
    });
  };

  const deleteChapter = (chapterId: string) => {
    setChapters(prev => prev.filter(ch => ch.id !== chapterId));
    message.success('Chapter deleted successfully!');
  };

  const jumpToChapter = (chapter: Chapter) => {
    if (videoRef.current) {
      videoRef.current.currentTime = chapter.timestamp;
      setSelectedChapter(chapter);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exportChapters = () => {
    const chaptersData = {
      videoUrl,
      chapters,
      totalDuration,
      createdAt: new Date()
    };

    const dataStr = JSON.stringify(chaptersData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `video-chapters-${Date.now()}.json`;
    link.click();
    
    message.success('Chapters exported successfully!');
  };

  const columns = [
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (thumbnail: string, record: Chapter) => (
        <img
          src={thumbnail}
          alt={record.title}
          style={{ width: 60, height: 34, objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => jumpToChapter(record)}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Chapter) => (
        <div>
          <div style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => jumpToChapter(record)}>
            {title}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => (
        <Tag color="blue">
          <ClockCircleOutlined /> {formatTime(timestamp)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Chapter) => (
        <Space>
          <Tooltip title="Jump to chapter">
            <Button
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => jumpToChapter(record)}
            />
          </Tooltip>
          <Tooltip title="Edit chapter">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => editChapter(record)}
            />
          </Tooltip>
          <Tooltip title="Delete chapter">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteChapter(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Video Chapters</Title>
            <Text type="secondary">Add navigation markers to your videos</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">{chapters.length} chapters</Tag>
              {videoUrl && <Tag color="green">{formatTime(totalDuration)}</Tag>}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Video Player" size="small">
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
                <div>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    style={{ width: '100%' }}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onPlay={() => {}}
                    onPause={() => {}}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  
                  <div style={{ marginTop: 12 }}>
                    <Space>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addChapterAtCurrentTime}
                      >
                        Add Chapter at {formatTime(currentTime)}
                      </Button>
                      <Button
                        icon={<SaveOutlined />}
                        onClick={exportChapters}
                        disabled={chapters.length === 0}
                      >
                        Export Chapters
                      </Button>
                    </Space>
                  </div>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Chapters List" size="small">
            <Table
              columns={columns}
              dataSource={chapters}
              pagination={false}
              size="small"
              rowKey="id"
              scroll={{ y: 300 }}
            />
          </Card>

          {selectedChapter && (
            <Card title="Current Chapter" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Title:</Text> {selectedChapter.title}
                </div>
                <div>
                  <Text strong>Description:</Text> {selectedChapter.description || 'No description'}
                </div>
                <div>
                  <Text strong>Timestamp:</Text> {formatTime(selectedChapter.timestamp)}
                </div>
                <div>
                  <Text strong>Progress:</Text>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ background: '#f0f0f0', height: 4, borderRadius: 2 }}>
                      <div
                        style={{
                          background: '#1890ff',
                          height: '100%',
                          borderRadius: 2,
                          width: `${(currentTime / totalDuration) * 100}%`
                        }}
                      />
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatTime(currentTime)} / {formatTime(totalDuration)}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title={editingChapter ? 'Edit Chapter' : 'Add Chapter'}
        open={isModalVisible}
        onOk={saveChapter}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingChapter(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Chapter Title"
            rules={[{ required: true, message: 'Please enter chapter title' }]}
          >
            <Input placeholder="Enter chapter title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              placeholder="Enter chapter description (optional)"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="timestamp"
            label="Timestamp"
            rules={[{ required: true, message: 'Please select timestamp' }]}
          >
            <TimePicker format="mm:ss" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VideoChapters;
