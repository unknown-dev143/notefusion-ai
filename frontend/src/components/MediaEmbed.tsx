import React, { useState, useCallback } from 'react';
import { Button, message, Modal, Upload, Space } from 'antd';
import { UploadOutlined, PlayCircleOutlined, PictureOutlined, FileOutlined } from '@ant-design/icons';
import './MediaEmbed/MediaEmbed.css';

type MediaType = 'image' | 'video' | 'audio' | 'file';

interface MediaEmbedProps {
  onEmbed: (url: string, type: MediaType) => void;
  onUpload: (file: File) => Promise<string>;
  isUploading?: boolean;
}

const MediaEmbed: React.FC<MediaEmbedProps> = ({ onEmbed, onUpload, isUploading = false }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [selectedType, setSelectedType] = useState<MediaType>('image');
  const [uploading, setUploading] = useState(false);

  const handleEmbed = () => {
    if (!embedUrl) {
      message.warning('Please enter a URL');
      return;
    }
    onEmbed(embedUrl, selectedType);
    setEmbedUrl('');
    setIsModalVisible(false);
  };

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const url = await onUpload(file);
      message.success('File uploaded successfully');
      onEmbed(url, selectedType);
      setIsModalVisible(false);
    } catch (error) {
      message.error('Upload failed');
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload behavior
  }, [onUpload, onEmbed, selectedType]);

  const beforeUpload = (file: File) => {
    handleUpload(file);
    return false; // Prevent default upload behavior
  };

  const renderMediaPreview = () => {
    if (!embedUrl) return null;
    
    switch (selectedType) {
      case 'image':
        return <img src={embedUrl} alt="Preview" className="media-embed-preview" />;
      case 'video':
        return (
          <video controls className="media-embed-video">
            <source src={embedUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <audio controls className="media-embed-audio">
            <source src={embedUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        );
      default:
        return null;
    }
  };

  return (
    <div className="media-embed-container">
      <Button 
        className="media-embed-button"
        type="text" 
        icon={<PictureOutlined />} 
        onClick={() => {
          setSelectedType('image');
          setIsModalVisible(true);
        }}
        title="Embed Image"
      />
      <Button 
        className="media-embed-button"
        type="text" 
        icon={<PlayCircleOutlined />} 
        onClick={() => {
          setSelectedType('video');
          setIsModalVisible(true);
        }}
        title="Embed Video"
      />
      <Upload 
        accept=".pdf,.doc,.docx,.txt" 
        beforeUpload={beforeUpload}
        showUploadList={false}
        disabled={isUploading || uploading}
      >
        <Button 
          className="media-embed-button"
          type="text" 
          icon={<FileOutlined />} 
          loading={isUploading || uploading}
          title="Upload File"
        />
      </Upload>

      <Modal
        title={`Embed ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
        open={isModalVisible}
        onOk={handleEmbed}
        onCancel={() => setIsModalVisible(false)}
        okText="Embed"
        cancelText="Cancel"
      >
        <Space direction="vertical" className="media-embed-modal">
          <div>
            <input
              type="text"
              className="ant-input media-embed-input"
              placeholder={`Enter ${selectedType} URL`}
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
            />
          </div>
          
          <div className="media-preview-container">
            {renderMediaPreview()}
          </div>
          
          <div className="media-upload-section">
            <Upload 
              accept={
                selectedType === 'image' 
                  ? 'image/*' 
                  : selectedType === 'video' 
                    ? 'video/*' 
                    : selectedType === 'audio' 
                      ? 'audio/*' 
                      : '*/*'
              }
              beforeUpload={beforeUpload}
              showUploadList={false}
              disabled={uploading}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </Upload>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default MediaEmbed;
