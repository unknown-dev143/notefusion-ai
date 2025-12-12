import React, { useState, useRef } from 'react';
import { Card, Typography, Button, Space, Row, Col, message, Upload, Table, Tag, Select, Input, Progress } from 'antd';
import { 
  FileTextOutlined, 
  DownloadOutlined, 
  PlayCircleOutlined,
  SoundOutlined,
  EditOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface TranscriptionSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
  speaker?: string;
}

interface TranscriptionResult {
  id: string;
  videoUrl: string;
  language: string;
  duration: number;
  segments: TranscriptionSegment[];
  fullText: string;
  createdAt: Date;
  accuracy: number;
}

const VideoTranscription: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [transcriptions, setTranscriptions] = useState<TranscriptionResult[]>([]);
  const [selectedTranscription, setSelectedTranscription] = useState<TranscriptionResult | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');

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

  const simulateTranscription = async () => {
    if (!videoUrl) {
      message.error('Please upload a video first');
      return;
    }

    setIsTranscribing(true);
    setTranscriptionProgress(0);

    try {
      // Simulate transcription process
      const sampleSegments: TranscriptionSegment[] = [
        {
          id: '1',
          startTime: 0,
          endTime: 5,
          text: 'Welcome to this tutorial on React development.',
          confidence: 0.95,
          speaker: 'Speaker 1'
        },
        {
          id: '2',
          startTime: 5,
          endTime: 10,
          text: 'Today we will learn about React hooks and how they can help us build better applications.',
          confidence: 0.92,
          speaker: 'Speaker 1'
        },
        {
          id: '3',
          startTime: 10,
          endTime: 15,
          text: 'React hooks were introduced in version 16.8 and have revolutionized the way we write React components.',
          confidence: 0.89,
          speaker: 'Speaker 1'
        },
        {
          id: '4',
          startTime: 15,
          endTime: 20,
          text: 'The most commonly used hooks are useState and useEffect.',
          confidence: 0.94,
          speaker: 'Speaker 1'
        }
      ];

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setTranscriptionProgress(i);
      }

      const fullText = sampleSegments.map(seg => seg.text).join(' ');
      const avgConfidence = sampleSegments.reduce((sum, seg) => sum + seg.confidence, 0) / sampleSegments.length;

      const result: TranscriptionResult = {
        id: `transcription-${Date.now()}`,
        videoUrl,
        language: selectedLanguage,
        duration: 20,
        segments: sampleSegments,
        fullText,
        createdAt: new Date(),
        accuracy: Math.round(avgConfidence * 100)
      };

      setTranscriptions(prev => [result, ...prev]);
      setSelectedTranscription(result);
      message.success('Transcription completed successfully!');
    } catch (error) {
      message.error('Transcription failed');
    } finally {
      setIsTranscribing(false);
      setTranscriptionProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const jumpToSegment = (segment: TranscriptionSegment) => {
    if (videoRef.current) {
      videoRef.current.currentTime = segment.startTime;
      videoRef.current.play();
    }
  };

  const editSegment = (segmentId: string, currentText: string) => {
    setEditingSegment(segmentId);
    setEditedText(currentText);
  };

  const saveSegmentEdit = () => {
    if (!selectedTranscription || !editingSegment) return;

    const updatedSegments = selectedTranscription.segments.map(seg =>
      seg.id === editingSegment ? { ...seg, text: editedText } : seg
    );

    const updatedTranscription = {
      ...selectedTranscription,
      segments: updatedSegments,
      fullText: updatedSegments.map(seg => seg.text).join(' ')
    };

    setSelectedTranscription(updatedTranscription);
    setTranscriptions(prev => prev.map(t => t.id === updatedTranscription.id ? updatedTranscription : t));
    setEditingSegment(null);
    setEditedText('');
    message.success('Segment updated successfully!');
  };

  const exportTranscription = (format: 'txt' | 'srt' | 'vtt') => {
    if (!selectedTranscription) return;

    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    switch (format) {
      case 'txt':
        content = selectedTranscription.fullText;
        filename = `transcription-${Date.now()}.txt`;
        break;
      case 'srt':
        content = selectedTranscription.segments.map((seg, index) => {
          return `${index + 1}\n${formatTime(seg.startTime)} --> ${formatTime(seg.endTime)}\n${seg.text}\n`;
        }).join('\n');
        filename = `transcription-${Date.now()}.srt`;
        break;
      case 'vtt':
        content = 'WEBVTT\n\n' + selectedTranscription.segments.map(seg => {
          return `${formatTime(seg.startTime)} --> ${formatTime(seg.endTime)}\n${seg.text}\n`;
        }).join('\n');
        filename = `transcription-${Date.now()}.vtt`;
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    message.success(`Transcription exported as ${format.toUpperCase()}!`);
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'startTime',
      key: 'time',
      render: (startTime: number, record: TranscriptionSegment) => (
        <div>
          <Tag color="blue">
            <ClockCircleOutlined /> {formatTime(startTime)} - {formatTime(record.endTime)}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Text',
      dataIndex: 'text',
      key: 'text',
      render: (text: string, record: TranscriptionSegment) => (
        <div>
          {editingSegment === record.id ? (
            <div>
              <TextArea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={2}
                style={{ marginBottom: 8 }}
              />
              <Space>
                <Button size="small" type="primary" onClick={saveSegmentEdit}>
                  Save
                </Button>
                <Button size="small" onClick={() => setEditingSegment(null)}>
                  Cancel
                </Button>
              </Space>
            </div>
          ) : (
            <div>
              <Text>{text}</Text>
              <div style={{ marginTop: 4 }}>
                <Space>
                  <Button
                    size="small"
                    type="link"
                    icon={<PlayCircleOutlined />}
                    onClick={() => jumpToSegment(record)}
                  >
                    Play
                  </Button>
                  <Button
                    size="small"
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => editSegment(record.id, text)}
                  >
                    Edit
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence: number) => (
        <Tag color={confidence > 0.9 ? 'green' : confidence > 0.8 ? 'orange' : 'red'}>
          {Math.round(confidence * 100)}%
        </Tag>
      ),
    },
    {
      title: 'Speaker',
      dataIndex: 'speaker',
      key: 'speaker',
      render: (speaker: string) => (
        <Tag color="purple">{speaker}</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>Video Transcription</Title>
            <Text type="secondary">Convert speech to text with AI-powered transcription</Text>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">{transcriptions.length} transcriptions</Tag>
              {selectedTranscription && <Tag color="green">{selectedTranscription.accuracy}% accuracy</Tag>}
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

              <div>
                <Text strong>Language:</Text>
                <Select
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="en-US">English (US)</Option>
                  <Option value="en-GB">English (UK)</Option>
                  <Option value="es-ES">Spanish</Option>
                  <Option value="fr-FR">French</Option>
                  <Option value="de-DE">German</Option>
                  <Option value="it-IT">Italian</Option>
                  <Option value="pt-BR">Portuguese</Option>
                  <Option value="zh-CN">Chinese (Mandarin)</Option>
                  <Option value="ja-JP">Japanese</Option>
                  <Option value="ko-KR">Korean</Option>
                </Select>
              </div>

              <Button
                type="primary"
                icon={<SoundOutlined />}
                onClick={simulateTranscription}
                loading={isTranscribing}
                disabled={!videoUrl}
                block
              >
                Start Transcription
              </Button>

              {isTranscribing && (
                <div>
                  <Text>Transcribing video...</Text>
                  <Progress percent={transcriptionProgress} style={{ marginTop: 8 }} />
                </div>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Transcription Results" size="small">
            {selectedTranscription ? (
              <div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Language: </Text>
                    <Tag color="blue" icon={<GlobalOutlined />}>
                      {selectedTranscription.language}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Duration: </Text>
                    <Text>{formatTime(selectedTranscription.duration)}</Text>
                  </div>
                  <div>
                    <Text strong>Accuracy: </Text>
                    <Tag color={selectedTranscription.accuracy > 90 ? 'green' : 'orange'}>
                      {selectedTranscription.accuracy}%
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Segments: </Text>
                    <Text>{selectedTranscription.segments.length}</Text>
                  </div>
                  <div>
                    <Text strong>Export Options:</Text>
                    <Space style={{ marginTop: 8 }}>
                      <Button
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={() => exportTranscription('txt')}
                      >
                        TXT
                      </Button>
                      <Button
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={() => exportTranscription('srt')}
                      >
                        SRT
                      </Button>
                      <Button
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={() => exportTranscription('vtt')}
                      >
                        VTT
                      </Button>
                    </Space>
                  </div>
                </Space>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <SoundOutlined style={{ fontSize: 48 }} />
                <div style={{ marginTop: 16 }}>Upload a video and start transcription to see results</div>
              </div>
            )}
          </Card>

          {selectedTranscription && (
            <Card title="Full Text" size="small" style={{ marginTop: 16 }}>
              <TextArea
                value={selectedTranscription.fullText}
                readOnly
                rows={6}
                style={{ marginBottom: 16 }}
              />
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => exportTranscription('txt')}
              >
                Download Full Text
              </Button>
            </Card>
          )}
        </Col>
      </Row>

      {selectedTranscription && (
        <Card title="Transcription Segments" size="small" style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={selectedTranscription.segments}
            pagination={{ pageSize: 10 }}
            size="small"
            rowKey="id"
          />
        </Card>
      )}
    </div>
  );
};

export default VideoTranscription;
