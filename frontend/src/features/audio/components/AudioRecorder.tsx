import React, { useCallback, useState, useRef, useEffect } from 'react';
import styles from './AudioRecorder.module.css';
import { useAudioRecorder, UseAudioRecorderOptions } from '../hooks/useAudioRecorder';
import { Button, Typography, message, Progress, Space, Modal, Input, Form } from 'antd';
import WaveSurfer from 'wavesurfer.js';
import { SaveOutlined, FileTextOutlined } from '@ant-design/icons';

// Type for CSS module classes
type AudioRecorderStyles = {
  [key: string]: string;
};

// Type assertion for CSS module
const audioRecorderStyles = styles as unknown as AudioRecorderStyles;
import { 
  AudioOutlined, 
  PauseOutlined, 
  PlayCircleOutlined, 
  StopOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { transcriptionService, TranscriptionResult } from '../services/transcriptionService';

const { Text } = Typography;

interface AudioRecorderProps extends Omit<UseAudioRecorderOptions, 'onChunk' | 'onStop'> {
  onRecordingComplete?: (audioBlob: Blob, transcription?: TranscriptionResult) => void;
  onChunkProcessed?: (chunk: Blob, transcription: TranscriptionResult, chunkIndex: number) => void;
  chunkInterval?: number;
  maxDuration?: number; // in seconds
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
  maxDuration = 300, // 5 minutes default
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
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form] = Form.useForm();
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptionResultsRef = useRef<TranscriptionResult[]>([]);
  
  // Format time with hours if needed
  const formatDisplayTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Update combined transcription from all chunks
  const updateCombinedTranscription = useCallback(() => {
    const results = transcriptionResultsRef.current.filter((r): r is TranscriptionResult => Boolean(r));
    if (results.length === 0) {
      setTranscription(null);
      return;
    }
    
    // Combine all segments from all chunks
    const combinedSegments = results.flatMap(result => result.segments || []);
    
    // Sort segments by start time
    combinedSegments.sort((a, b) => a.start - b.start);
    
    // Create combined transcription
    const combinedTranscription: TranscriptionResult = {
      text: results.map(r => r.text).join(' ').replace(/\s+/g, ' ').trim(),
      language: results[0]?.language || language || 'en',
      segments: combinedSegments
    };
    
    setTranscription(combinedTranscription);
  }, [language]);
  
  // Process a single audio chunk
  const processAudioChunk = useCallback(async (chunk: Blob, chunkIndex: number) => {
    if (!autoTranscribe) return;
    
    try {
      setIsProcessing(true);
      setTranscriptionProgress(0);
      
      // Show progress for better UX
      const progressInterval = window.setInterval(() => {
        setTranscriptionProgress(prev => {
          const next = prev + Math.random() * 10;
          return next > 90 ? 90 : next;
        });
      }, 200);
      
      // Transcribe the chunk
      const result = await transcriptionService.transcribeChunk(
        chunk,
        language
      );
      
      clearInterval(progressInterval);
      setTranscriptionProgress(100);
      
      // Update transcription results
      const newResults = [...transcriptionResultsRef.current];
      newResults[chunkIndex] = result;
      transcriptionResultsRef.current = newResults;
      
      setProcessedChunks(prev => [...prev, chunkIndex]);
      
      // Notify parent component
      if (onChunkProcessed) {
        onChunkProcessed(chunk, result, chunkIndex);
      }
      
      // Update combined transcription
      updateCombinedTranscription();
      
      return result;
    } catch (error) {
      console.error('Error processing chunk:', error);
      message.error('Failed to process audio chunk');
      throw error;
    } finally {
      setIsProcessing(false);
      setTranscriptionProgress(0);
    }
  }, [autoTranscribe, language, onChunkProcessed, updateCombinedTranscription]);
  
  
  // Handle recording stop
  const handleRecordingStop = useCallback(async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Process any remaining chunks if needed
      if (autoTranscribe && audioChunksRef.current.length > 0) {
        setIsTranscribing(true);
        message.loading('Processing full recording...', 0);
        
        try {
          // Process all chunks that haven't been processed yet
          const chunks = [...audioChunksRef.current];
          for (let i = 0; i < chunks.length; i++) {
            if (!processedChunks.includes(i) && chunks[i]) {
              await processAudioChunk(chunks[i] as Blob, i);
            }
          }
          
          message.success('Transcription completed');
        } finally {
          setIsTranscribing(false);
          message.destroy();
        }
      }
      
      // Notify parent component with current transcription
      if (onRecordingComplete && transcription) {
        onRecordingComplete(audioBlob, transcription);
      } else if (onRecordingComplete) {
        onRecordingComplete(audioBlob);
      }
    } catch (error) {
      console.error('Error in onRecordingComplete:', error);
      message.error('Failed to complete recording');
    } finally {
      setIsProcessing(false);
    }
  }, [onRecordingComplete, transcription, processAudioChunk, processedChunks, autoTranscribe]);
  
  // Handle audio chunk
  const handleChunk = useCallback(async (chunk: Blob, chunkIndex: number) => {
    try {
      const chunks = [...audioChunksRef.current];
      chunks[chunkIndex] = chunk;
      audioChunksRef.current = chunks;
      
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
  }, [onChunkUpload, autoTranscribe, processAudioChunk]);

  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current && !wavesurfer.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#1890ff',
        progressColor: '#52c41a',
        cursorColor: '#ff4d4f',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 80,
        barGap: 2,
        responsive: true,
        normalize: true,
        partialRender: true
      });

      wavesurfer.current.on('ready', () => {
        if (wavesurfer.current) {
          wavesurfer.current.play();
        }
      });
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, []);

  // Update waveform data when recording
  useEffect(() => {
    if (isRecording && wavesurfer.current) {
      // Clear previous waveform
      wavesurfer.current.empty();
      
      // Create a silent audio context for visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // Update waveform periodically
      const updateWaveform = () => {
        if (isRecording && wavesurfer.current) {
          analyser.getByteTimeDomainData(dataArray);
          const normalizedData = Array.from(dataArray).map(value => (value - 128) / 128);
          setWaveformData(normalizedData);
          requestAnimationFrame(updateWaveform);
        }
      };
      
      updateWaveform();
      
      return () => {
        audioContext.close();
      };
    }
  }, [isRecording]);

  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    audioBlob,
    error: recordingError,
  } = useAudioRecorder({
    ...rest,
    onStart: useCallback(() => {
      setProcessedChunks([]);
      setTranscription(null);
      setWaveformData([]);
      if (rest.onStart) rest.onStart();
    }, [rest]),
    onStop: handleRecordingStop,
    onError: useCallback((error: Error) => {
      console.error('Recording error:', error);
      message.error(`Recording error: ${error.message}`);
      if (rest.onError) rest.onError(error);
    }, [rest]),
    onChunk: handleChunk,
    chunkInterval: chunkInterval || 5000, // Default to 5 seconds per chunk
  });

  if (!isSupported) {
    return (
      <div className={styles['error']}>
        <Text type="danger">Audio recording is not supported in your browser</Text>
      </div>
    );
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle saving to notes
  const handleSaveToNotes = async (values: { title: string; tags: string }) => {
    if (!audioBlob || !transcription) return;
    
    setIsSaving(true);
    try {
      // Convert blob to base64 for storage
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      // Prepare note data
      const noteData = {
        title: values.title || `Audio Note - ${new Date().toLocaleString()}`,
        content: transcription.text,
        audioData: audioBase64,
        transcription: transcription.text,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        metadata: {
          duration: recordingTime,
          recordedAt: new Date().toISOString(),
          language: language
        }
      };

      // Here you would typically make an API call to save the note
      // Example: await api.saveNote(noteData);
      console.log('Saving note:', noteData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Note saved successfully!');
      setIsSaveModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Show save modal if there's a recording and transcription
  const showSaveModal = () => {
    if (!audioBlob) {
      message.warning('Please record audio first');
      return;
    }
    if (!transcription) {
      message.warning('Please wait for transcription to complete');
      return;
    }
    setIsSaveModalVisible(true);
  };

  return (
    <div className={audioRecorderStyles['audioRecorder']}>
      {/* Waveform Visualization */}
      <div 
        ref={waveformRef} 
        className={audioRecorderStyles['waveform']}
        style={{ display: isRecording || audioBlob ? 'block' : 'none' }}
      />
      
      <div className={audioRecorderStyles['controls']}>
        {/* Recording Controls */}
        <Space size="middle" align="center">
        {!isRecording ? (
          <Button
            type="primary"
            icon={<AudioOutlined />}
            onClick={startRecording}
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
              onClick={stopRecording}
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
                onClick={resumeRecording}
                disabled={isProcessing}
                size="large"
              >
                Resume
              </Button>
            ) : (
              <Button
                icon={<PauseOutlined />}
                onClick={pauseRecording}
                disabled={isProcessing}
                size="large"
              >
                Pause
              </Button>
            )}
          </>
        )}
        
        {(isRecording || isPaused) && (
          <span className={audioRecorderStyles['timer']}>
            {formatDisplayTime(recordingTime)}
            {maxDuration && maxDuration > 0 && ` / ${formatDisplayTime(maxDuration)}`}
          </span>
        )}
      </div>
      
      {/* Processing Indicator */}
      {(isProcessing || isTranscribing) && (
        <div className={audioRecorderStyles['processingIndicator']}>
          <Text type="secondary">
            {isTranscribing ? 'Processing full recording...' : 'Processing audio chunk...'}
          </Text>
          <Progress 
            percent={transcriptionProgress} 
            status="active" 
            showInfo={false}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
      )}
      
      {/* Audio Preview */}
      {audioBlob && (
        <div className={audioRecorderStyles['audioPreviewContainer']}>
          <audio
            ref={audioRef}
            src={URL.createObjectURL(audioBlob)} 
            controls 
            className={audioRecorderStyles['audioPreview']}
            onPlay={() => {
              if (wavesurfer.current) {
                wavesurfer.current.play();
              }
            }}
            onPause={() => {
              if (wavesurfer.current) {
                wavesurfer.current.pause();
              }
            }}
            onSeeked={(e) => {
              if (wavesurfer.current) {
                const audio = e.target as HTMLAudioElement;
                const seekTo = (audio.currentTime / audio.duration) * 100;
                wavesurfer.current.seekTo(seekTo / 100);
              }
            }}
          />
          <div className={audioRecorderStyles['recordingTime']}>
            {formatTime(recordingTime)}
            {maxDuration && maxDuration > 0 && ` / ${formatTime(maxDuration)}`}
          </div>
        </div>
      )}
      
      {/* Transcription Result */}
      {showTranscription && transcription && (
        <div className={audioRecorderStyles['transcription']}>
          <div className={audioRecorderStyles['transcriptionHeader']}>
            <h4><FileTextOutlined /> Transcription</h4>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={showSaveModal}
              disabled={isTranscribing}
            >
              Save to Notes
            </Button>
          </div>
          <p>{transcription.text}</p>
        </div>
      )}

      {/* Save to Notes Modal */}
      <Modal
        title="Save to Notes"
        open={isSaveModalVisible}
        onCancel={() => setIsSaveModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsSaveModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            loading={isSaving}
            onClick={() => form.submit()}
          >
            Save Note
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveToNotes}
          initialValues={{
            title: `Audio Note - ${new Date().toLocaleString()}`,
            tags: ''
          }}
        >
          <Form.Item
            name="title"
            label="Note Title"
            rules={[{ required: true, message: 'Please enter a title for your note' }]}
          >
            <Input placeholder="Enter note title" />
          </Form.Item>
          <Form.Item
            name="tags"
            label="Tags (comma-separated)"
          >
            <Input placeholder="tag1, tag2, tag3" />
          </Form.Item>
          <div className={audioRecorderStyles['previewSection']}>
            <p><strong>Audio Duration:</strong> {formatTime(recordingTime)}</p>
            {transcription?.text && (
              <div className={audioRecorderStyles['transcriptionPreview']}>
                <p><strong>Preview:</strong></p>
                <p>{transcription.text.length > 200 
                  ? `${transcription.text.substring(0, 200)}...` 
                  : transcription.text}</p>
              </div>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AudioRecorder;
