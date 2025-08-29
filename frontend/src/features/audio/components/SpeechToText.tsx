import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Space, Typography, message, Select } from 'antd';
import { AudioOutlined, AudioMutedOutlined, SaveOutlined } from '@ant-design/icons';
import styles from './SpeechToText.module.css';

const { Text } = Typography;
const { Option } = Select;

export const SpeechToText: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
  ];

  useEffect(() => {
    // Initialize speech recognition
    const initSpeechRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        message.error('Speech recognition is not supported in your browser');
        return null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        message.error(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        if (isRecording) {
          recognition.start();
        }
      };

      return recognition;
    };

    recognitionRef.current = initSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        setTranscript('');
      }
    }
  };

  const handleSave = () => {
    if (!transcript.trim()) {
      message.warning('No transcript to save');
      return;
    }
    
    setIsProcessing(true);
    // TODO: Implement save functionality
    console.log('Saving transcript:', transcript);
    
    // Simulate save
    setTimeout(() => {
      setIsProcessing(false);
      message.success('Transcript saved successfully');
    }, 1000);
  };

  return (
    <div className={styles['speechToText']}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card size="small" title="Speech Recognition">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div className={styles['selectContainer']}>
              <Select
                value={language}
                onChange={setLanguage}
                className={`${styles['selectInput'] || ''}`}
                disabled={isRecording}
              >
                {languages.map(lang => (
                  <Option key={lang.code} value={lang.code}>
                    {lang.name}
                  </Option>
                ))}
              </Select>
            </div>
            
            <div className={styles['recordingButtonContainer']}>
              <Button
                type={isRecording ? 'default' : 'primary'}
                icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
                onClick={toggleRecording}
                size="large"
                shape="round"
                danger={isRecording}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
            </div>
            
            <div className={styles['transcriptContainer']}>
              <div className={styles['transcriptLabel']}>
                <Text strong>Transcript:</Text>
              </div>
              <Card className={`${styles['transcriptCard'] || ''}`}>
                {transcript || <Text type="secondary">Your transcribed text will appear here...</Text>}
              </Card>
            </div>
            
            <div className={styles['saveButtonContainer']}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={isProcessing}
                disabled={!transcript.trim() || isRecording}
              >
                Save Transcript
              </Button>
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};
