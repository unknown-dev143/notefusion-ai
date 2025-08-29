import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseAudioRecorderOptions {
  onStart?: () => void;
  onStop?: (audioBlob: Blob) => void;
  onError?: (error: Error) => void;
  onChunk?: (chunk: Blob, chunkIndex: number) => Promise<void>;
  chunkInterval?: number; // Time in milliseconds between chunks (default: 5000ms)
  mimeType?: string; // Default: 'audio/webm;codecs=opus'
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  error: Error | null;
  isSupported: boolean;
  audioBlob: Blob | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => boolean;
  pauseRecording: () => boolean;
  resumeRecording: () => Promise<boolean>;
  formatTime: (seconds: number) => string;
}

export const useAudioRecorder = (options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn => {
  const {
    onStart,
    onStop,
    onError,
    onChunk,
    chunkInterval = 5000,
    mimeType = 'audio/webm;codecs=opus'
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkIndexRef = useRef(0);
  const timerRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Check browser support
  useEffect(() => {
    const isMediaSupported = typeof window !== 'undefined' && 
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined' &&
      MediaRecorder.isTypeSupported(mimeType);

    if (!isMediaSupported) {
      setIsSupported(false);
      setError(new Error('Audio recording is not supported in this browser'));
    }

    return () => {
      stopRecording();
      cleanup();
    };
  }, [mimeType]);

  // Update recording time
  useEffect(() => {
    if (!isRecording) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
      return;
    }

    startTimeRef.current = Date.now() - (recordingTime * 1000);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, recordingTime]);

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    chunkIndexRef.current = 0;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError(new Error('Audio recording is not supported in this browser'));
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      chunkIndexRef.current = 0;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // If chunk callback provided, process the chunk
          if (onChunk) {
            try {
              await onChunk(event.data, chunkIndexRef.current);
              chunkIndexRef.current++;
            } catch (err) {
              console.error('Error processing audio chunk:', err);
              if (onError) onError(err instanceof Error ? err : new Error(String(err)));
            }
          }
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          if (onStop) onStop(audioBlob);
        }
        cleanup();
      };

      mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event}`);
        setError(error);
        if (onError) onError(error);
        cleanup();
      };

      // Start recording with timeslice for chunking
      mediaRecorder.start(chunkInterval);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      if (onStart) onStart();
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to access microphone');
      setError(error);
      if (onError) onError(error);
      cleanup();
      return false;
    }
  }, [isSupported, onStart, onStop, onError, onChunk, chunkInterval, mimeType, cleanup]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return false;
    }

    try {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop recording');
      setError(error);
      if (onError) onError(error);
      return false;
    }
  }, [onError]);

  const pauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
      return false;
    }

    try {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to pause recording');
      setError(error);
      if (onError) onError(error);
      return false;
    }
  }, [onError]);

  const resumeRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'paused') {
      return false;
    }

    try {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resume recording');
      setError(error);
      if (onError) onError(error);
      return false;
    }
  }, [onError]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    error,
    isSupported,
    audioBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };
};

export default useAudioRecorder;
