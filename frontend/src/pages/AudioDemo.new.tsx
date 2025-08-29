import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, List, Button, Tabs, message, Empty } from 'antd';
import styles from './AudioDemo.module.css';
import { AudioOutlined, PlayCircleOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import AudioRecorder from '../components/AudioRecorder';
import AudioNoteSearch from '../components/AudioNoteSearch';
import { audioService, AudioNote } from '../services/audioService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface AudioNoteWithDuration extends AudioNote {
  duration: number;
}

const AudioDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [notes, setNotes] = useState<AudioNoteWithDuration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  // Load saved notes on component mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true);
        const { notes: savedNotes } = await audioService.getNotes();
        setNotes(savedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
        message.error('Failed to load audio notes');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  const handleRecordingComplete = async (audioBlob: Blob, transcription: string) => {
    try {
      setIsLoading(true);
      const title = `Recording ${new Date().toLocaleString()}`;
      const { id, url } = await audioService.saveNote(audioBlob, title);
      
      const newNote: AudioNoteWithDuration = {
        id,
        title,
        url,
        transcription,
        duration: 0, // Will be updated after processing
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setNotes(prev => [newNote, ...prev]);
      message.success('Note saved successfully');
    } catch (error) {
      console.error('Error saving note:', error);
      message.error('Failed to save audio note');
    } finally {
      setIsLoading(false);
    }
  };

  const playNote = (noteId: string) => {
    setActiveNote(noteId);
    const audio = document.getElementById(`audio-${noteId}`) as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await audioService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      if (activeNote === noteId) {
        setActiveNote(null);
      }
      message.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      message.error('Failed to delete audio note');
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className={styles['audioDemo']}>
      <Title level={2} className={styles['audioTitle']}>
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
            
            <Card title="My Audio Notes" style={{ marginTop: 24 }}>
              <List
                itemLayout="horizontal"
                dataSource={notes}
                loading={isLoading}
                locale={{
                  emptyText: (
                    <Empty 
                      description={
                        <span>No audio notes recorded yet</span>
                      }
                    />
                  ),
                }}
                renderItem={(note) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        icon={<PlayCircleOutlined />}
                        onClick={() => playNote(note.id)}
                        disabled={isLoading}
                      >
                        {activeNote === note.id ? 'Playing...' : 'Play'}
                      </Button>,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteNote(note.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Text strong ellipsis={{ tooltip: note.title }}>
                          {note.title}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Space size="middle">
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {new Date(note.createdAt).toLocaleString()}
                            </Text>
                            {note.duration > 0 && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {Math.floor(note.duration / 60)}:
                                {(note.duration % 60).toString().padStart(2, '0')}
                              </Text>
                            )}
                          </Space>
                          {note.transcription && (
                            <div className={styles['transcriptionContainer']}>
                              <Text 
                                ellipsis={{ tooltip: note.transcription }}
                                className={styles['transcriptionText']}
                              >
                                {note.transcription}
                              </Text>
                            </div>
                          )}
                        </Space>
                      }
                    />
                    <audio
                      id={`audio-${note.id}`}
                      src={note.url}
                      onEnded={() => setActiveNote(null)}
                      onLoadedMetadata={(e) => {
                        // Update duration when audio metadata is loaded
                        const audio = e.target as HTMLAudioElement;
                        setNotes(prev => prev.map(n => 
                          n.id === note.id 
                            ? { ...n, duration: Math.round(audio.duration) } 
                            : n
                        ));
                      }}
                      style={{ display: 'none' }}
                    />
                  </List.Item>
                )}
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
