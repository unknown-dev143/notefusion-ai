import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Input, Space, Typography, List, message } from 'antd';
import { AudioOutlined, PauseOutlined, PlayCircleOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from './AudioNoteTaker.module.css';

const { Text } = Typography;

interface AudioNote {
  id: string;
  timestamp: number;
  content: string;
  audioTime: number;
}

interface AudioNoteTakerProps {
  onSave?: (notes: AudioNote[]) => void;
  initialNotes?: AudioNote[];
}

export const AudioNoteTaker: React.FC<AudioNoteTakerProps> = ({ onSave, initialNotes = [] }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState<AudioNote[]>(initialNotes);
  const [currentNote, setCurrentNote] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize audio context
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.onloadedmetadata = () => {
            setCurrentTime(0);
          };
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start time tracking
      const startTime = Date.now() - (currentTime * 1000);
      
      const updateTime = () => {
        setCurrentTime((Date.now() - startTime) / 1000);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      };
      
      animationFrameRef.current = requestAnimationFrame(updateTime);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      message.error(t('audio.microphoneAccessDenied'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleAddNote = () => {
    if (!currentNote.trim()) return;
    
    const newNote: AudioNote = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content: currentNote,
      audioTime: currentTime
    };
    
    setNotes([...notes, newNote]);
    setCurrentNote('');
    message.success(t('audio.noteAdded'));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSave = () => {
    if (onSave) {
      onSave(notes);
      message.success(t('audio.notesSaved'));
    }
  };

  const seekToTimestamp = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <Card 
      title={t('audio.audioNotes')}
      actions={[
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSave}
          disabled={notes.length === 0}
        >
          {t('common.save')}
        </Button>
      ]}
    >
      <div className={styles['container']}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className={styles['controlsContainer']}>
          <div className={styles['controlsRow']}>
            {isRecording ? (
              <Button 
                danger 
                icon={<PauseOutlined />} 
                onClick={stopRecording}
                className={`${styles['button']} ${styles['recordButton']}`}
              >
                {t('audio.stopRecording')}
              </Button>
            ) : (
              <Button 
                type="primary" 
                icon={<AudioOutlined />} 
                onClick={startRecording}
                disabled={isPlaying}
                className={`${styles['button']} ${styles['recordButton']}`}
              >
                {t('audio.startRecording')}
              </Button>
            )}
            
            {!isRecording && audioChunksRef.current.length > 0 && (
              <Button 
                icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />} 
                onClick={togglePlayback}
              >
                {isPlaying ? t('audio.pause') : t('audio.play')}
              </Button>
            )}
            
            <div className={styles['timer']}>
              <Text strong>{formatTime(currentTime)}</Text>
            </div>
          </div>
          
          <audio 
            ref={audioRef}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => setIsPlaying(false)}
            className={styles['audioPlayer']}
          />
        </div>
        
        <div className={styles['noteInputContainer']}>
          <Space.Compact className={styles['noteInput']}>
            <Input
              placeholder={t('audio.addNotePlaceholder')}
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              onPressEnter={handleAddNote}
              disabled={!isRecording && !audioChunksRef.current.length}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddNote}
              disabled={!currentNote.trim() || (!isRecording && !audioChunksRef.current.length)}
            >
              {t('common.add')}
            </Button>
          </Space.Compact>
        </div>
        
        <div>
          <Text strong>{t('audio.notes')} ({notes.length})</Text>
          <List
            dataSource={notes}
            renderItem={(note) => (
              <List.Item
                actions={[
                  <Button 
                    key="play" 
                    type="text" 
                    size="small" 
                    onClick={() => seekToTimestamp(note.audioTime)}
                  >
                    {formatTime(note.audioTime)}
                  </Button>,
                  <Button 
                    key="delete" 
                    type="text" 
                    danger 
                    size="small" 
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    {t('common.delete')}
                  </Button>
                ]}
              >
                <div className={styles['noteContent']}>{note.content}</div>
              </List.Item>
            )}
            bordered
            className={`${styles['noteList']}`}
          />
        </div>
      </Space>
      </div>
    </Card>
  );
};

export default AudioNoteTaker;
