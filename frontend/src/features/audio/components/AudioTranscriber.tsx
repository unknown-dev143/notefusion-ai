import React, { useState, useRef, useEffect } from 'react';
import { Button, Space, Typography, Card, Progress, Select, message } from 'antd';
import { AudioOutlined, StopOutlined, SaveOutlined } from '@ant-design/icons';
import { audioService } from '../api/audioService';
import { useTranslation } from 'react-i18next';
import styles from './AudioTranscriber.module.css';

const { Title, Text } = Typography;

interface AudioTranscriberProps {
  onTranscriptionComplete?: (text: string) => void;
  language?: string;
  autoStart?: boolean;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onTranscriptionComplete,
  language = 'en-US',
  autoStart = false,
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [availableLanguages, setAvailableLanguages] = useState<Array<{code: string, name: string}>>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  // Load available languages on mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languages = await audioService.getSupportedLanguages();
        setAvailableLanguages(languages);
      } catch (error) {
        console.error('Failed to load languages:', error);
        message.error(t('audio.failedToLoadLanguages'));
      }
    };
    
    loadLanguages();
    
    if (autoStart) {
      startRecording();
    }
    
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        setProgress(0);
        
        // Simulate progress
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const next = prev + Math.random() * 20;
            return next > 90 ? 90 : next;
          });
        }, 300);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const result = await audioService.convertSpeechToText(audioBlob, selectedLanguage);
          
          clearInterval(progressIntervalRef.current);
          setProgress(100);
          setTranscription(result.text);
          
          if (onTranscriptionComplete) {
            onTranscriptionComplete(result.text);
          }
          
          message.success(t('audio.transcriptionComplete'));
        } catch (error) {
          console.error('Transcription failed:', error);
          message.error(t('audio.transcriptionFailed'));
        } finally {
          setIsProcessing(false);
          clearInterval(progressIntervalRef.current);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Set a time slice to get data periodically (every 1 second)
      mediaRecorderRef.current.start(1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      message.error(t('audio.microphoneAccessDenied'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    if (transcription && onTranscriptionComplete) {
      onTranscriptionComplete(transcription);
      message.success(t('audio.transcriptionSaved'));
    }
  };

  return (
    <Card 
      title={t('audio.transcribeAudio')} 
      style={{ width: '100%' }}
      actions={[
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSave}
          disabled={!transcription || isProcessing}
        >
          {t('common.save')}
        </Button>
      ]}
    >
      <Space direction="vertical" className={styles['controls']}>
        <div>
          <Text strong>{t('audio.language')}:</Text>
          <Select
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            style={{ width: 200, marginLeft: 8 }}
            disabled={isRecording || isProcessing}
          >
            {availableLanguages.map((lang) => (
              <Select.Option key={lang.code} value={lang.code}>
                {lang.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        
        {isProcessing ? (
          <div>
            <Text>{t('audio.processing')}</Text>
            <Progress percent={Math.round(progress)} status="active" />
          </div>
        ) : isRecording ? (
          <Button 
            type="primary" 
            danger 
            icon={<StopOutlined />} 
            onClick={stopRecording}
            size="large"
          >
            {t('audio.stopRecording')}
          </Button>
        ) : (
          <Button 
            type="primary" 
            icon={<AudioOutlined />} 
            onClick={startRecording}
            size="large"
          >
            {t('audio.startRecording')}
          </Button>
        )}
        
        {isRecording && (
          <div className={styles['recordingIndicator']}>
            <div className={styles['recordingDot']} />
            <Text type="danger">{t('audio.recording')}...</Text>
          </div>
        )}
        
        {transcription && (
          <div className={styles['transcriptionContainer']}>
            <Title level={5}>{t('audio.transcription')}:</Title>
            <div className={styles['transcriptionBox']}>
              {transcription}
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default AudioTranscriber;
