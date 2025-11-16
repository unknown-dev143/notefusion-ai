import React, { useState } from 'react';
import { Button, Typography, Input, message, Progress, Card } from 'antd';
import { AudioOutlined, StopOutlined, PauseOutlined, SaveOutlined } from '@ant-design/icons';
import useAudioRecorder from '../../hooks/useAudioRecorder';
import styles from './AudioRecorder.module.css';

const { Text } = Typography;

interface AudioRecorderProps {
  onSave?: (title: string, audioBlob: Blob) => void;
  autoTranscribe?: boolean;
  showSaveButton?: boolean;
  maxDuration?: number; // in seconds
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onSave,
  autoTranscribe = false,
  showSaveButton = true,
  maxDuration = 300, // 5 minutes default
}) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    isRecording,
    isPaused,
    audioUrl,
    isTranscribing,
    transcription,
    elapsedTime,
    startRecording,
    stopRecording,
    togglePause,
    transcribe,
    saveNote,
  } = useAudioRecorder();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    const started = await startRecording();
    if (started && autoTranscribe) {
      // Auto-transcribe will be handled in the hook
    }
  };

  const handleStop = () => {
    stopRecording();
  };

  const handleSave = async () => {
    if (!noteTitle.trim()) {
      message.warning('Please enter a title for your note');
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        // @ts-ignore - We know audioBlob exists when saving
        onSave(noteTitle, audioUrl);
      } else {
        await saveNote(noteTitle);
        setNoteTitle('');
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTranscribe = async () => {
    try {
      await transcribe();
    } catch (error) {
      console.error('Transcription failed:', error);
    }
  };

  return (
    <Card 
      title="Audio Recorder"
      size="small"
      className={styles.container}
    >
      <div className={styles['controls']}>
        {!isRecording ? (
          <Button
            type="primary"
            icon={<AudioOutlined />}
            onClick={handleStart}
            className={styles.recordButton}
          >
            Start Recording
          </Button>
        ) : (
          <div className={styles['recordingControls']}>
            <Button
              icon={isPaused ? <AudioOutlined /> : <PauseOutlined />}
              onClick={togglePause}
              className={styles['controlButton']}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              danger
              icon={<StopOutlined />}
              onClick={handleStop}
              className={styles.controlButton}
            >
              Stop
            </Button>
          </div>
        )}
      </div>

      {isRecording && maxDuration > 0 && (
        <div className={styles['progressContainer']}>
          <Progress
            percent={(elapsedTime / maxDuration) * 100}
            showInfo={false}
            strokeColor="#ff4d4f"
          />
          <div className={styles['timeDisplay']}>
            <Text type="secondary" className={styles['timeText']}>0:00</Text>
            <Text type="secondary" className={styles['timeText']}>{formatTime(maxDuration)}</Text>
          </div>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className={styles['audioContainer']}>
          <audio 
            src={audioUrl} 
            controls 
            className={styles['audioPlayer']}
          />
          
          {showSaveButton && (
            <div className={styles['saveControls']}>
              <Input
                placeholder="Enter note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className={styles['titleInput']}
              />
              <div className={styles['buttonGroup']}>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSave}
                  loading={isSaving}
                  disabled={!noteTitle.trim()}
                  className={styles['saveButton']}
                >
                  Save Note
                </Button>
                
                {!transcription && (
                  <Button 
                    onClick={handleTranscribe}
                    loading={isTranscribing}
                    className={styles['transcribeButton']}
                  >
                    Transcribe
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isTranscribing && (
        <div className={styles['statusContainer']}>
          <Text type="secondary">Transcribing... Please wait.</Text>
        </div>
      )}

      {transcription && (
        <div className={styles['transcriptionContainer']}>
          <Text strong>Transcription:</Text>
          <div className={styles['transcription']}>
            {transcription}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AudioRecorder;
