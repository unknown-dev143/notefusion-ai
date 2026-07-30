import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Space, Typography, Tag, message } from 'antd';
import { 
  AudioOutlined, 
  StopOutlined, 
  PauseOutlined, 
  CaretRightOutlined,
  ThunderboltFilled
} from '@ant-design/icons';
import './VoiceRecorder.css';

const { Text } = Typography;

interface VoiceRecorderProps {
  onTranscriptUpdate: (fullTranscript: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onTranscriptUpdate, 
  isRecording, 
  setIsRecording 
}) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsConnection && wsConnection.readyState === WebSocket.OPEN) {
          wsConnection.send(event.data);
        }
      };

      recorder.onstart = () => {
        setIsRecording(true);
        setIsPaused(false);
        setRecordingTime(0);
        
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);

        // Start WebSocket connection for real-time transcription
        // Using WS_BASE_URL from a central config or hardcoded for now
        const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8001/ws/recording';
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('VoiceRecorder: WebSocket connected');
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.transcript) {
              onTranscriptUpdate(data.full_transcript || data.transcript);
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          message.error('Transcription service unavailable');
        };
        
        setWsConnection(ws);
      };

      recorder.onstop = () => {
        setIsRecording(false);
        setIsPaused(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (wsConnection) {
          wsConnection.close();
        }
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      message.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      message.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      message.success('Recording saved');
    }
  };

  const togglePause = () => {
    if (mediaRecorder) {
      if (isPaused) {
        mediaRecorder.resume();
        setIsPaused(false);
      } else {
        mediaRecorder.pause();
        setIsPaused(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="voice-recorder-card">
      <Space direction="vertical" align="center" style={{ width: '100%' }} size="middle">
        <div className="recorder-status">
          {isRecording ? (
            <Space>
              <div className="recording-dot" />
              <Text strong style={{ fontSize: '18px', fontFamily: 'monospace' }}>
                {formatTime(recordingTime)}
              </Text>
            </Space>
          ) : (
            <Tag color="default">Ready to Record</Tag>
          )}
        </div>

        <div className="recorder-controls">
          {!isRecording ? (
            <Button 
              type="primary" 
              shape="round" 
              size="large" 
              icon={<AudioOutlined />} 
              onClick={startRecording}
              className="record-btn-start"
            >
              Start Recording
            </Button>
          ) : (
            <Space size="large">
              <Button 
                shape="circle" 
                size="large" 
                icon={isPaused ? <CaretRightOutlined /> : <PauseOutlined />} 
                onClick={togglePause}
                title={isPaused ? 'Resume' : 'Pause'}
              />
              <Button 
                type="primary" 
                danger 
                shape="circle" 
                size="large" 
                icon={<StopOutlined />} 
                onClick={stopRecording}
                title="Stop"
              />
            </Space>
          )}
        </div>

        {isRecording && (
          <div className="transcription-indicator">
            <Space>
              <ThunderboltFilled style={{ color: '#faad14' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>Live AI Transcription Active</Text>
            </Space>
            <div className="wave-animation">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default VoiceRecorder;
