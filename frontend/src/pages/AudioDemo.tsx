import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Tabs, message } from 'antd';
import { AudioOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AudioRecorder from '../components/AudioRecorder';
import AudioNoteSearch from '../components/AudioNoteSearch';
import AudioNoteList from '../components/AudioNoteList';
import { audioService } from '../services/audioService';

const { Title } = Typography;
const { TabPane } = Tabs;

// Define the complete audio note type with all required fields
type AudioNoteWithDuration = {
  id: string;
  title: string;
  url: string;
  transcription: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
};

const PAGE_SIZE = 10;

const AudioDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [notes, setNotes] = useState<AudioNoteWithDuration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });

  // Load saved notes with pagination
  const loadNotes = useCallback(async (page = 1, pageSize = PAGE_SIZE) => {
    try {
      setIsLoading(true);
      const { notes: savedNotes, total } = await audioService.getNotes({
        page,
        pageSize,
      });
      
      // Ensure all notes have required fields
      const processedNotes: AudioNoteWithDuration[] = savedNotes.map(note => ({
        id: note.id,
        title: note.title || 'Untitled Recording',
        url: note.url || `#${note.id}`,
        transcription: note.transcription || '',
        duration: note.duration || 0,
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: note.updatedAt || new Date().toISOString(),
      }));
      
      setNotes(processedNotes);
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total,
      }));
    } catch (error) {
      console.error('Error loading notes:', error);
      message.error('Failed to load audio notes');
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load notes on component mount and when pagination changes
  useEffect(() => {
    loadNotes(pagination.current, pagination.pageSize);
  }, [loadNotes, pagination.current, pagination.pageSize]);
  
  // Cleanup audio event listeners on unmount
  useEffect(() => {
    const audioElements = document.querySelectorAll('audio');
    
    const cleanup = () => {
      audioElements.forEach(audio => {
        if (audio instanceof HTMLAudioElement) {
          audio.pause();
          audio.currentTime = 0;
          // Remove all event listeners by cloning the element
          const newAudio = audio.cloneNode(true);
          audio.parentNode?.replaceChild(newAudio, audio);
        }
      });
    };
    
    return cleanup;
  }, []);

  const handleRecordingComplete = async (audioBlob: Blob, transcription: string) => {
    try {
      setIsLoading(true);
      const title = `Recording ${new Date().toLocaleString()}`;
      await audioService.saveNote(audioBlob, title);
      
      // Refresh the notes list to ensure we have the latest data
      await loadNotes(1, pagination.pageSize);
      message.success('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save audio note');
    } finally {
      setIsLoading(false);
    }
  };

  const playNote = useCallback((noteId: string) => {
    setActiveNote(noteId);
    const audio = document.getElementById(`audio-${noteId}`) as HTMLAudioElement | null;
    
    if (!audio) return;
    
    const handleAudioEnd = () => setActiveNote(null);
    
    audio.currentTime = 0;
    audio.play()
      .then(() => {
        audio.addEventListener('ended', handleAudioEnd);
      })
      .catch(error => {
        console.error('Error playing audio:', error);
        setActiveNote(null);
      });
      
    return () => {
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, []);

  const deleteNote = async (noteId: string) => {
    try {
      setIsDeleting(true);
      await audioService.deleteNote(noteId);
      
      // If this was the last item on the page and not the first page,
      // go to the previous page
      if (notes.length === 1 && pagination.current > 1) {
        const newPage = pagination.current - 1;
        setPagination(prev => ({
          ...prev,
          current: newPage,
        }));
        loadNotes(newPage, pagination.pageSize);
      } else {
        // Otherwise, just reload the current page
        loadNotes(pagination.current, pagination.pageSize);
      }
      
      if (activeNote === noteId) {
        setActiveNote(null);
      }
      message.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      message.error('Failed to delete audio note');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <AudioOutlined /> Audio Notes
      </Title>
      
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane
          tab={
            <span>
              <PlusOutlined /> Create New
            </span>
          }
          key="create"
        >
          <div>
            <Card title="Record New Note" style={{ marginBottom: 24 }}>
              <AudioRecorder 
                onRecordingComplete={handleRecordingComplete}
                maxDuration={300}
                autoTranscribe={true}
              />
            </Card>
            
            <Card 
              title="My Audio Notes" 
              style={{ marginTop: 24, height: 'calc(100vh - 300px)', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column' }}
            >
              <AudioNoteList
                notes={notes}
                isLoading={isLoading || isDeleting}
                activeNote={activeNote}
                onPlay={playNote}
                onDelete={deleteNote}
                page={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onPageChange={handlePageChange}
              />
            </Card>
          </div>
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <SearchOutlined /> Search Notes
            </span>
          }
          key="search"
        >
          <AudioNoteSearch />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AudioDemo;
