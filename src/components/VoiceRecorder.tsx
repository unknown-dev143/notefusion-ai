import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Button, Space, Progress, message, List, Tag, Tooltip, Input, Modal } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StopOutlined, 
  AudioOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface TranscriptSegment {
  id: string;
  timestamp: string;
  text: string;
  confidence: number;
  speaker?: string;
}

interface RecordingSession {
  id: string;
  name: string;
  duration: number;
  date: string;
  transcript: TranscriptSegment[];
  audioBlob?: Blob;
}

const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sessions, setSessions] = useState<RecordingSession[]>([
    {
      id: '1',
      name: 'Lecture 1 - Introduction',
      duration: 1800,
      date: new Date().toISOString(),
      transcript: [
        {
          id: '1',
          timestamp: '00:00:00',
          text: 'Welcome to today\'s lecture on artificial intelligence.',
          confidence: 0.95,
          speaker: 'Professor'
        },
        {
          id: '2',
          timestamp: '00:00:15',
          text: 'We will be covering the fundamentals of machine learning.',
          confidence: 0.92,
          speaker: 'Professor'
        }
      ]
    }
  ]);
  
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [editingSegment, setEditingSegment] = useState<TranscriptSegment | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editText, setEditText] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Setup audio context for level monitoring
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const newSession: RecordingSession = {
          id: Date.now().toString(),
          name: `Recording ${new Date().toLocaleString()}`,
          duration,
          date: new Date().toISOString(),
          transcript: [],
          audioBlob
        };
        
        setCurrentSession(newSession);
        setSessions(prev => [newSession, ...prev]);
        setIsTranscribing(true);
        
        // Simulate transcription
        setTimeout(() => {
          const mockTranscript: TranscriptSegment[] = [
            {
              id: '1',
              timestamp: '00:00:00',
              text: 'This is a sample transcription of the recorded audio.',
              confidence: 0.89,
              speaker: 'Speaker 1'
            }
          ];
          
          newSession.transcript = mockTranscript;
          setIsTranscribing(false);
          message.success('Transcription completed!');
        }, 3000);

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setDuration(0);
      message.success('Recording started');
    } catch (error) {
      message.error('Failed to access microphone');
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setAudioLevel(0);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        message.info('Recording resumed');
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        message.info('Recording paused');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const editTranscriptSegment = (segment: TranscriptSegment) => {
    setEditingSegment(segment);
    setEditText(segment.text);
    setEditModalVisible(true);
  };

  const saveTranscriptEdit = () => {
    if (editingSegment && currentSession) {
      const updatedSegment = { ...editingSegment, text: editText };
      const updatedTranscript = currentSession.transcript.map(seg => 
        seg.id === editingSegment.id ? updatedSegment : seg
      );
      
      setCurrentSession({ ...currentSession, transcript: updatedTranscript });
      setSessions(prev => prev.map(session => 
        session.id === currentSession.id ? { ...session, transcript: updatedTranscript } : session
      ));
      
      setEditModalVisible(false);
      setEditingSegment(null);
      setEditText('');
      message.success('Transcript updated');
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
    message.success('Session deleted');
  };

  return (
    <Card title="Voice Recorder & Transcription" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Recording Controls */}
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '24px' }}>
              {formatTime(duration)}
            </Text>
            {isRecording && (
              <Tag color={isPaused ? 'orange' : 'red'} style={{ marginLeft: '8px' }}>
                {isPaused ? 'PAUSED' : 'RECORDING'}
              </Tag>
            )}
          </div>

          {isRecording && (
            <div style={{ marginBottom: '16px' }}>
              <Progress 
                percent={audioLevel} 
                showInfo={false} 
                strokeColor={isPaused ? '#faad14' : '#f5222d'}
                size="small"
              />
            </div>
          )}

          <Space size="large">
            {!isRecording ? (
              <Button 
                type="primary" 
                size="large"
                icon={<AudioOutlined />}
                onClick={startRecording}
              >
                Start Recording
              </Button>
            ) : (
              <>
                <Button 
                  size="large"
                  icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                  onClick={pauseRecording}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button 
                  danger
                  size="large"
                  icon={<StopOutlined />}
                  onClick={stopRecording}
                >
                  Stop
                </Button>
              </>
            )}
          </Space>
        </div>

        {/* Transcription Status */}
        {isTranscribing && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CloudUploadOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
            <div style={{ marginTop: '8px' }}>
              <Text>Transcribing audio...</Text>
            </div>
          </div>
        )}

        {/* Current Session Transcript */}
        {currentSession && currentSession.transcript.length > 0 && (
          <div>
            <Title level={4}>
              <FileTextOutlined /> Transcript: {currentSession.name}
            </Title>
            <List
              dataSource={currentSession.transcript}
              renderItem={(segment) => (
                <List.Item
                  actions={[
                    <Tooltip title="Edit transcript">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />}
                        onClick={() => editTranscriptSegment(segment)}
                      />
                    </Tooltip>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color="blue">{segment.timestamp}</Tag>
                        {segment.speaker && <Tag color="green">{segment.speaker}</Tag>}
                        <Tag color="purple">{Math.round(segment.confidence * 100)}% confidence</Tag>
                      </Space>
                    }
                    description={segment.text}
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {/* Previous Sessions */}
        <div>
          <Title level={4}>Previous Sessions</Title>
          <List
            dataSource={sessions}
            renderItem={(session) => (
              <List.Item
                actions={[
                  <Button 
                    type="text" 
                    onClick={() => setCurrentSession(session)}
                  >
                    View
                  </Button>,
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteSession(session.id)}
                  />
                ]}
              >
                <List.Item.Meta
                  title={session.name}
                  description={`${formatTime(session.duration)} • ${new Date(session.date).toLocaleString()}`}
                />
              </List.Item>
            )}
          />
        </div>

        {/* Edit Transcript Modal */}
        <Modal
          title="Edit Transcript Segment"
          open={editModalVisible}
          onOk={saveTranscriptEdit}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingSegment(null);
            setEditText('');
          }}
        >
          <TextArea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={4}
            placeholder="Edit transcript text..."
          />
        </Modal>
      </Space>
    </Card>
  );
};

export default VoiceRecorder;
