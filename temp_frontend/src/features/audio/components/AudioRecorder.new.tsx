import React, { useCallback, useState, useRef } from 'react';
import { useAudioRecorder, UseAudioRecorderOptions } from '../hooks/useAudioRecorder';
import { Button, Space, Typography, message, Progress } from 'antd';
import { 
  AudioOutlined, 
  PauseOutlined, 
  PlayCircleOutlined, 
  StopOutlined
} from '@ant-design/icons';
import { TranscriptionResult } from '../services/transcriptionService';

const { Text, Paragraph } = Typography;

interface AudioRecorderProps extends Omit<UseAudioRecorderOptions, 'onChunk' | 'onStop'> {
  onRecordingComplete?: (audioBlob: Blob, transcription?: TranscriptionResult) => void;
  onChunkProcessed?: (chunk: Blob, transcription: TranscriptionResult, chunkIndex: number) => void;
  chunkInterval?: number;
  maxDuration?: number;
  showTranscription?: boolean;
  autoTranscribe?: boolean;
  language?: string;
  onChunkUpload?: (chunk: Blob, chunkIndex: number) => Promise<void>;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onChunkProcessed,
  onChunkUpload,
  chunkInterval = 5000,
  maxDuration = 300, // 5 minutes
  showTranscription = true,
  autoTranscribe = true,
  language = 'en',
  ...rest
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [processedChunks, setProcessedChunks] = useState<number[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptionResultsRef = useRef<TranscriptionResult[]>([]);
  const progressIntervalRef = useRef<number>();

  // Process a single audio chunk
  const processAudioChunk = useCallback(async (chunk: Blob, chunkIndex: number) => {
    if (!autoTranscribe) return;
    
    try {
      setIsProcessing(true);
      setTranscriptionProgress(0);
      
      // Show progress for better UX
      progressIntervalRef.current = window.setInterval(() => {
        setTranscriptionProgress(prev => {
          const next = prev + Math.random() * 10;
          return next > 90 ? 90 : next;
        });
      }, 200);
      
      // In a real implementation, you would call your transcription service here
      // const result = await transcriptionService.transcribeChunk(chunk, language);
      const result: TranscriptionResult = {
        text: `Transcription for chunk ${chunkIndex}`,
        language,
        segments: []
      };
      
      // Update transcription results
      transcriptionResultsRef.current[chunkIndex] = result;
      setProcessedChunks(prev => [...prev, chunkIndex]);
      
      // Combine all transcriptions
      const combinedText = transcriptionResultsRef.current
        .filter(Boolean)
        .map(t => t.text)
        .join(' ');
      
      setTranscription({
        text: combinedText,
        language,
        segments: []
      });
      
      // Notify parent component
      if (onChunkProcessed) {
        onChunkProcessed(chunk, result, chunkIndex);
      }
      
      return result;
    } catch (error) {
      console.error('Error processing chunk:', error);
      message.error('Failed to transcribe audio chunk');
      throw error;
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setTranscriptionProgress(0);
      setIsProcessing(false);
    }
  }, [autoTranscribe, language, onChunkProcessed]);

  // Handle audio chunk
  const handleChunk = async (chunk: Blob, chunkIndex: number) => {
    try {
      audioChunksRef.current[chunkIndex] = chunk;
      
      if (onChunkUpload) {
        await onChunkUpload(chunk, chunkIndex);
      }
      
      if (autoTranscribe) {
        await processAudioChunk(chunk, chunkIndex);
      }
    } catch (error) {
      console.error('Error handling chunk:', error);
      message.error('Failed to process audio chunk');
    }
  };

  // Handle recording stop
  const handleRecordingStop = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Process any remaining chunks if needed
      if (autoTranscribe && audioChunksRef.current.length > 0) {
        setIsTranscribing(true);
        message.loading('Processing full recording...', 0);
        
        try {
          // Process all chunks that haven't been processed yet
          for (let i = 0; i < audioChunksRef.current.length; i++) {
            if (!processedChunks.includes(i)) {
              await processAudioChunk(audioChunksRef.current[i], i);
            }
          }
          
          message.success('Transcription completed');
        } finally {
          setIsTranscribing(false);
          message.destroy();
        }
      }
      
      // Notify parent component
      if (onRecordingComplete) {
        onRecordingComplete(audioBlob, transcription);
      }
    } catch (error) {
      console.error('Error in onRecordingComplete:', error);
      message.error('Failed to complete recording');
    } finally {
      setIsProcessing(false);
    }
  };

  // Start recording handler
  const handleStartRecording = async () => {
    try {
      audioChunksRef.current = [];
      transcriptionResultsRef.current = [];
      setProcessedChunks([]);
      setTranscription(null);
      
      const success = await startRecording();
      if (success) {
        message.success('Recording started');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      message.error('Failed to start recording');
    }
  };

  // Stop recording handler
  const handleStopRecording = () => {
    stopRecording();
    message.info('Recording stopped');
  };

  // Pause recording handler
  const handlePauseRecording = () => {
    pauseRecording();
    message.info('Recording paused');
  };

  // Resume recording handler
  const handleResumeRecording = async () => {
    const success = await resumeRecording();
    if (success) {
      message.info('Recording resumed');
    }
  };

  // Use the audio recorder hook
  const {
    isRecording,
    isPaused,
    recordingTime,
    error,
    isSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    formatTime,
  } = useAudioRecorder({
    ...rest,
    chunkInterval,
    onStop: handleRecordingStop,
    onChunk: handleChunk,
  });

  if (!isSupported) {
    return (
      <div className="audio-recorder-error">
        <Text type="danger">Audio recording is not supported in your browser</Text>
      </div>
    );
  }

  return (
    <div className="audio-recorder">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Recording Controls */}
        <Space wrap>
          {!isRecording ? (
            <Button
              type="primary"
              icon={<AudioOutlined />}
              onClick={handleStartRecording}
              loading={isProcessing}
              disabled={isProcessing}
              size="large"
            >
              Start Recording
            </Button>
          ) : (
            <>
              <Button
                icon={<StopOutlined />}
                onClick={handleStopRecording}
                disabled={isProcessing}
                danger
                size="large"
              >
                Stop
              </Button>
              {isPaused ? (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleResumeRecording}
                  disabled={isProcessing}
                  size="large"
                >
                  Resume
                </Button>
              ) : (
                <Button
                  icon={<PauseOutlined />}
                  onClick={handlePauseRecording}
                  disabled={isProcessing}
                  size="large"
                >
                  Pause
                </Button>
              )}
            </>
          )}
          
          {(isRecording || isPaused) && (
            <Text strong style={{ fontSize: '1.2em', marginLeft: 8 }}>
              {formatTime(recordingTime)}
            </Text>
          )}
        </Space>

        {/* Progress indicator */}
        {isProcessing && (
          <div className="progress-container">
            <Progress
              percent={transcriptionProgress}
              status="active"
              showInfo={false}
            />
            <Text type="secondary">
              {isTranscribing ? 'Transcribing...' : 'Processing...'}
            </Text>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-message">
            <Text type="danger">{error.message}</Text>
          </div>
        )}

        {/* Transcription result */}
        {showTranscription && transcription?.text && (
          <div className="transcription">
            <Text strong>Transcription:</Text>
            <Paragraph>{transcription.text}</Paragraph>
          </div>
        )}
      </Space>
    </div>
  );
};

export default AudioRecorder;
