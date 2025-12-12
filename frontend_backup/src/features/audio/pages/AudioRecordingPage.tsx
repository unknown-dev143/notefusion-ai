import React, { useState } from 'react';
import { Card, Typography, message, Space } from 'antd';
import { AudioRecorder } from '../components/AudioRecorder';
import styles from './AudioRecordingPage.module.css';

const { Title, Paragraph } = Typography;

const AudioRecordingPage: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedChunks, setUploadedChunks] = useState<number[]>([]);

  const handleChunkUpload = async (chunk: Blob, chunkIndex: number) => {
    try {
      setIsUploading(true);
      
      // Simulate API call for chunk upload
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would upload the chunk to your server here
      console.log(`Uploaded chunk ${chunkIndex} (${chunk.size} bytes)`);
      
      setUploadedChunks(prev => [...prev, chunkIndex]);
      
      message.success(`Uploaded chunk ${chunkIndex + 1}`);
    } catch (error) {
      console.error('Error uploading chunk:', error);
      message.error(`Failed to upload chunk ${chunkIndex + 1}`);
      throw error; // Re-throw to let the AudioRecorder handle the error
    } finally {
      setIsUploading(false);
    }
  };

  const handleRecordingComplete = (audioBlob: Blob) => {
    console.log('Complete audio recording:', audioBlob);
    message.success(`Recording completed! Total size: ${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`);
    
    // In a real app, you might want to do something with the complete recording
    // For example, upload it to your server or process it further
  };

  return (
    <div className={styles['container']}>
      <Title level={2}>Audio Recorder with Chunked Uploads</Title>
      
      <Card 
        title="Record Audio" 
        className={styles['card']}
        loading={isUploading}
      >
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          onChunkUpload={handleChunkUpload}
          chunkInterval={5000} // 5 seconds per chunk
          maxDuration={300} // 5 minutes max
        />
        
        {uploadedChunks.length > 0 && (
          <div className={styles['chunkContainer']}>
            <Paragraph>Uploaded chunks: {uploadedChunks.length}</Paragraph>
            <Space wrap>
              {uploadedChunks.map((chunk, index) => (
                <span key={index} className={styles['chunkBadge']}>
                  Chunk {chunk + 1}
                </span>
              ))}
            </Space>
          </div>
        )}
      </Card>
      
      <Card title="Instructions">
        <ol>
          <li>Click "Start Recording" to begin recording audio</li>
          <li>The recorder will automatically upload audio in 5-second chunks</li>
          <li>Use the Pause/Resume buttons to control recording</li>
          <li>Click "Stop" when finished</li>
          <li>The complete recording will be available after stopping</li>
        </ol>
      </Card>
    </div>
  );
};

export default AudioRecordingPage;
