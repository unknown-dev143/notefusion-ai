import { useState, useRef, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { audioService } from '../services/audioService';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Start recording
  const startRecording = useCallback(async () => {
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
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      
      mediaRecorder.start(1000);
      setIsRecording(true);
      setElapsedTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      message.error('Could not access microphone. Please check permissions.');
      return false;
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    
    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    setIsPaused(!isPaused);
  }, [isPaused]);

  // Transcribe audio
  const transcribe = useCallback(async () => {
    if (!audioBlob) return;
    
    setIsTranscribing(true);
    try {
      const result = await audioService.transcribe(audioBlob);
      setTranscription(result.text);
      return result.text;
    } catch (error) {
      console.error('Transcription failed:', error);
      message.error('Failed to transcribe audio');
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  }, [audioBlob]);

  // Save audio note
  const saveNote = useCallback(async (title: string) => {
    if (!audioBlob) throw new Error('No audio to save');
    
    try {
      const result = await audioService.saveNote(audioBlob, title);
      message.success('Note saved successfully');
      return result;
    } catch (error) {
      console.error('Failed to save note:', error);
      message.error('Failed to save note');
      throw error;
    }
  }, [audioBlob]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    // State
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    isTranscribing,
    transcription,
    elapsedTime,
    
    // Actions
    startRecording,
    stopRecording,
    togglePause,
    transcribe,
    saveNote,
  };
};

export default useAudioRecorder;
