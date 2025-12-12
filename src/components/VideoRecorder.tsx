import React, { useState, useRef, useCallback } from 'react';
import { Card, Typography, Button, Space, message, Select, Switch, Progress, Row, Col } from 'antd';
import { PlayCircleOutlined, StopOutlined, PauseOutlined, DownloadOutlined, VideoCameraOutlined, DesktopOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface RecordingData {
  id: string;
  url: string;
  timestamp: Date;
  duration: number;
  size: number;
  type: 'screen' | 'camera' | 'both';
}

const VideoRecorder: React.FC = () => {
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingMode, setRecordingMode] = useState<'screen' | 'camera' | 'both'>('screen');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoQuality, setVideoQuality] = useState<'low' | 'medium' | 'high'>('high');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      let stream: MediaStream;

      if (recordingMode === 'screen' || recordingMode === 'both') {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: videoQuality === 'high' ? 1920 : videoQuality === 'medium' ? 1280 : 640 },
            height: { ideal: videoQuality === 'high' ? 1080 : videoQuality === 'medium' ? 720 : 480 },
            frameRate: { ideal: 30 }
          },
          audio: audioEnabled
        });

        if (recordingMode === 'both' && audioEnabled) {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          screenStream.addTrack(audioStream.getAudioTracks()[0]);
        }

        stream = screenStream;
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: videoQuality === 'high' ? 1920 : videoQuality === 'medium' ? 1280 : 640 },
            height: { ideal: videoQuality === 'high' ? 1080 : videoQuality === 'medium' ? 720 : 480 },
            frameRate: { ideal: 30 }
          },
          audio: audioEnabled
        });
      }

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const newRecording: RecordingData = {
          id: Date.now().toString(),
          url,
          timestamp: new Date(),
          duration: recordingTime,
          size: blob.size,
          type: recordingMode
        };

        setRecordings(prev => [newRecording, ...prev]);
        setRecordingTime(0);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        message.success('Recording saved successfully!');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      message.error('Failed to start recording. Please check permissions.');
    }
  }, [recordingMode, audioEnabled, videoQuality, recordingTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  }, [isRecording, isPaused]);

  const downloadRecording = (recording: RecordingData) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `recording_${recording.id}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Recording downloaded!');
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(recording => recording.id !== id));
    message.success('Recording deleted!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Video Recorder</Title>
      
      <Card title="Recording Settings" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <Text strong>Recording Mode</Text>
                <Select
                  value={recordingMode}
                  onChange={setRecordingMode}
                  style={{ width: '100%', marginTop: 8 }}
                  disabled={isRecording}
                >
                  <Option value="screen">
                    <Space><DesktopOutlined /> Screen Recording</Space>
                  </Option>
                  <Option value="camera">
                    <Space><VideoCameraOutlined /> Camera Recording</Space>
                  </Option>
                  <Option value="both">
                    <Space><VideoCameraOutlined /> Screen + Camera</Space>
                  </Option>
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text strong>Video Quality</Text>
                <Select
                  value={videoQuality}
                  onChange={setVideoQuality}
                  style={{ width: '100%', marginTop: 8 }}
                  disabled={isRecording}
                >
                  <Option value="low">Low (480p)</Option>
                  <Option value="medium">Medium (720p)</Option>
                  <Option value="high">High (1080p)</Option>
                </Select>
              </div>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Enable Audio</Text>
            <Switch checked={audioEnabled} onChange={setAudioEnabled} disabled={isRecording} />
          </div>

          {isRecording && (
            <div>
              <Text strong>Recording Time: {formatTime(recordingTime)}</Text>
              <Progress 
                percent={0} 
                status="active" 
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </div>
          )}

          <Space>
            {!isRecording ? (
              <Button
                type="primary"
                icon={<VideoCameraOutlined />}
                onClick={startRecording}
                size="large"
              >
                Start Recording
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    icon={<PauseOutlined />}
                    onClick={pauseRecording}
                    size="large"
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={resumeRecording}
                    size="large"
                  >
                    Resume
                  </Button>
                )}
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={stopRecording}
                  size="large"
                >
                  Stop
                </Button>
              </>
            )}
          </Space>
        </Space>
      </Card>

      {recordings.length > 0 && (
        <Card title={`Recordings (${recordings.length})`}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {recordings.map((recording) => (
              <Card key={recording.id} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{recording.type.charAt(0).toUpperCase() + recording.type.slice(1)} Recording</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {recording.timestamp.toLocaleString()} • {formatTime(recording.duration)} • {formatFileSize(recording.size)}
                      </Text>
                    </div>
                    <Space>
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadRecording(recording)}
                      >
                        Download
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={() => deleteRecording(recording.id)}
                      >
                        Delete
                      </Button>
                    </Space>
                  </div>
                  <video
                    controls
                    style={{ width: '100%', maxHeight: '300px' }}
                    src={recording.url}
                  >
                    Your browser does not support the video tag.
                  </video>
                </Space>
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default VideoRecorder;
