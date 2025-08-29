import React, { useState, useRef, useEffect } from 'react';
import { Button, Space, Typography, message, Progress } from 'antd';
import { AudioOutlined, StopOutlined, PlayCircleOutlined, SaveOutlined } from '@ant-design/icons';
import axios from 'axios';
import styles from './AudioRecorder.module.css';

const { Text } = Typography;

/**
 * Props for the AudioRecorder component
 * @typedef {Object} AudioRecorderProps
 * @property {function} [onRecordingComplete] - Callback function called when recording is complete
 * @property {Blob} onRecordingComplete.audioBlob - The recorded audio as a Blob
 * @property {string} onRecordingComplete.transcription - The transcribed text from the audio
 * @property {boolean} [autoTranscribe=true] - Whether to automatically transcribe the audio after recording
 * @property {number} [maxDuration=300] - Maximum recording duration in seconds (default: 300s / 5 minutes)
 */
interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, transcription: string) => void;
  autoTranscribe?: boolean;
  maxDuration?: number;
}

/**
 * AudioRecorder Component
 * 
 * A React component that provides audio recording functionality with optional transcription.
 * Features include:
 * - Start/stop/pause/resume recording
 * - Audio playback
 * - Automatic transcription
 * - Progress tracking
 * 
 * @component
 * @example
 * // Basic usage
 * <AudioRecorder 
 *   onRecordingComplete={(audioBlob, transcription) => {
 *     console.log('Recorded audio:', audioBlob);
 *     console.log('Transcription:', transcription);
 *   }}
 *   autoTranscribe={true}
 *   maxDuration={120}
 * />
 */
const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  autoTranscribe = true,
  maxDuration = 300,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  /**
   * Requests access to the user's microphone and starts a new recording session
   * @async
   * @throws {Error} If microphone access is denied or unavailable
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        if (autoTranscribe) {
          await transcribeAudio(audioBlob);
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      startTimer();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      message.error('Could not access microphone. Please check your permissions.');
    }
  };
  
  /**
   * Stops the current recording session and processes the recorded audio
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
    }
  };
  
  /**
   * Toggles between pause and resume for the current recording
   */
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    
    if (isPaused) {
      mediaRecorderRef.current.resume();
      startTimer();
    } else {
      mediaRecorderRef.current.pause();
      stopTimer();
    }
    
    setIsPaused(!isPaused);
  };
  
  /**
   * Starts the timer for the current recording session
   */
  const startTimer = () => {
    stopTimer();
    const startTime = Date.now() - (elapsedTime * 1000);
    
    timerRef.current = window.setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(newElapsed);
      
      // Stop if max duration reached
      if (maxDuration && newElapsed >= maxDuration) {
        stopRecording();
      }
    }, 1000) as unknown as number;
  };
  
  /**
   * Stops the timer for the current recording session
   */
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  /**
   * Sends the recorded audio to the backend for transcription
   * @param {Blob} audioBlob - The audio data to transcribe
   * @returns {Promise<string>} The transcribed text
   * @throws {Error} If transcription fails
   */
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    if (!audioBlob) return '';
    
    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await axios.post('/api/audio/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setTranscription(response.data.text);
      
      if (onRecordingComplete) {
        onRecordingComplete(audioBlob, response.data.text);
      }
      
      message.success('Audio transcribed successfully');
    } catch (error) {
      console.error('Error transcribing audio:', error);
      message.error('Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };
  
  /**
   * Formats seconds into MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string (MM:SS)
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  /**
   * Saves the recorded audio as a note with the given title
   * @param {string} title - The title for the audio note
   * @returns {Promise<void>}
   */
  const saveAudioNote = async (title: string): Promise<void> => {
    try {
      // TO DO: implement saving audio note logic
    } catch (error) {
      console.error('Error saving audio note:', error);
      message.error('Failed to save audio note');
    }
  };
  
  /**
   * Toggles between starting and stopping recording
   */
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  /**
   * Toggles between playing and pausing the recorded audio
   */
  const togglePlayback = () => {
    if (!mediaRecorderRef.current) return;
    if (!audioBlob) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `recording-${new Date().toISOString().slice(0, 19)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  useEffect(() => {
    return () => {
      // Cleanup
      stopTimer();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  return (
    <div className={styles.audioRecorder}>
      <div className={styles.recorderControls}>
        {!isRecording ? (
          <Button 
            type="primary" 
            icon={<AudioOutlined />} 
            onClick={startRecording}
            disabled={isTranscribing}
          >
            Start Recording
          </Button>
        ) : (
          <Space>
            <Button 
              danger 
              icon={<StopOutlined />} 
              onClick={stopRecording}
            >
              Stop
            </Button>
            <Button 
              icon={isPaused ? <PlayCircleOutlined /> : <StopOutlined />}
              onClick={togglePause}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Text type="secondary">
              {formatTime(elapsedTime)}
            </Text>
          </Space>
        )}

        {audioUrl && !isRecording && (
          <Button
            type="text"
            icon={<SaveOutlined />}
            onClick={saveRecording}
            className={styles.saveButton}
          >
            Save
          </Button>
        )}
      </div>

      {isRecording && maxDuration && (
        <div className={styles.progressContainer}>
          <Progress 
            percent={(elapsedTime / maxDuration) * 100} 
            showInfo={false}
            status={elapsedTime >= maxDuration * 0.9 ? 'exception' : 'active'}
          />
          <Text type="secondary" className={styles.progressText}>
            Max duration: {formatTime(maxDuration)}
          </Text>
        </div>
      )}
      
      {audioUrl && !isRecording && (
        <div className={styles.audioPreview}>
          <audio 
            src={audioUrl} 
            controls 
            className={styles.audioPlayer}
          />
        </div>
      )}
      
      {isTranscribing && (
        <div className={styles.transcribingText}>
          <Text type="secondary">Transcribing...</Text>
        </div>
      )}
      
      {transcription && (
        <div className={styles.transcription}>
          <Text strong>Transcription:</Text>
          <div className={styles.transcriptionText}>
            {transcription}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
