import React, { useState, useRef } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Upload, 
  message, 
  Progress, 
  List, 
  Modal, 
  Select, 
  Row, 
  Col,
  Alert,
  Tabs,
  Tag,
  Input,
  Slider,
  Badge
} from 'antd';
import { 
  PictureOutlined,
  CameraOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileImageOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  ScissorOutlined,
  BgColorsOutlined,
  RotateLeftOutlined,
  ZoomInOutlined,
  FilterOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface ImageFile {
  id: string;
  name: string;
  type: 'upload' | 'camera' | 'screenshot' | 'generated';
  format: string;
  size: number;
  dimensions: { width: number; height: number };
  url: string;
  thumbnail?: string;
  createdAt: string;
  metadata?: {
    colorSpace?: string;
    dpi?: number;
    hasAlpha?: boolean;
    exif?: any;
  };
}

interface ProcessingJob {
  id: string;
  imageId: string;
  type: 'resize' | 'crop' | 'rotate' | 'filter' | 'compress' | 'convert' | 'enhance' | 'watermark';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  settings: any;
  result?: string;
}

const ImageProcessor: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [processingModalVisible, setProcessingModalVisible] = useState(false);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [activeTab, setActiveTab] = useState('library');
  const [isCapturing, setIsCapturing] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [promptModalVisible, setPromptModalVisible] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const imageFormats = [
    { value: 'jpeg', label: 'JPEG', description: 'Best for photos' },
    { value: 'png', label: 'PNG', description: 'Supports transparency' },
    { value: 'webp', label: 'WebP', description: 'Web optimized' },
    { value: 'gif', label: 'GIF', description: 'Animated images' },
    { value: 'bmp', label: 'BMP', description: 'Uncompressed' },
    { value: 'tiff', label: 'TIFF', description: 'High quality' }
  ];

  const filters = [
    { value: 'none', label: 'None' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'sepia', label: 'Sepia' },
    { value: 'blur', label: 'Blur' },
    { value: 'sharpen', label: 'Sharpen' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'cold', label: 'Cold' },
    { value: 'warm', label: 'Warm' }
  ];

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('Please upload an image file');
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const imageFile: ImageFile = {
          id: Date.now().toString(),
          name: file.name,
          type: 'upload',
          format: file.type.split('/')[1] || 'unknown',
          size: file.size,
          dimensions: { width: img.width, height: img.height },
          url: e.target?.result as string,
          createdAt: new Date().toISOString()
        };

        setImages(prev => [imageFile, ...prev]);
        message.success(`Image "${file.name}" uploaded successfully!`);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    return false;
  };

  const captureFromCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      message.error('Failed to access camera');
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const imageFile: ImageFile = {
              id: Date.now().toString(),
              name: `Camera Photo ${new Date().toLocaleString()}`,
              type: 'camera',
              format: 'jpeg',
              size: blob.size,
              dimensions: { width: canvas.width, height: canvas.height },
              url: canvas.toDataURL('image/jpeg'),
              createdAt: new Date().toISOString()
            };

            setImages(prev => [imageFile, ...prev]);
            message.success('Photo captured successfully!');
            
            // Stop camera
            if (videoRef.current?.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              stream.getTracks().forEach(track => track.stop());
              videoRef.current.srcObject = null;
            }
            setIsCapturing(false);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const captureScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        
        if (context) {
          context.drawImage(video, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const imageFile: ImageFile = {
                id: Date.now().toString(),
                name: `Screenshot ${new Date().toLocaleString()}`,
                type: 'screenshot',
                format: 'png',
                size: blob.size,
                dimensions: { width: canvas.width, height: canvas.height },
                url: canvas.toDataURL('image/png'),
                createdAt: new Date().toISOString()
              };

              setImages(prev => [imageFile, ...prev]);
              message.success('Screenshot captured successfully!');
            }
          }, 'image/png');
          
          stream.getTracks().forEach(track => track.stop());
        }
      };
    } catch (error) {
      message.error('Failed to capture screenshot');
    }
  };

  const generateImageFromPrompt = async () => {
    if (!imagePrompt.trim()) {
      message.error('Please enter a prompt for image generation');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI image generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create a canvas with a placeholder image
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Create gradient background
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        context.fillStyle = 'white';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText('AI Generated', canvas.width / 2, canvas.height / 2 - 20);
        context.font = '16px Arial';
        context.fillText(imagePrompt.substring(0, 50) + (imagePrompt.length > 50 ? '...' : ''), canvas.width / 2, canvas.height / 2 + 20);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const imageFile: ImageFile = {
              id: Date.now().toString(),
              name: `AI Generated: ${imagePrompt.substring(0, 30)}...`,
              type: 'generated',
              format: 'png',
              size: blob.size,
              dimensions: { width: canvas.width, height: canvas.height },
              url: canvas.toDataURL('image/png'),
              createdAt: new Date().toISOString()
            };

            setImages(prev => [imageFile, ...prev]);
            message.success('Image generated successfully from prompt!');
            setPromptModalVisible(false);
            setImagePrompt('');
          }
        }, 'image/png');
      }
    } catch (error) {
      message.error('Failed to generate image from prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const startProcessing = (type: ProcessingJob['type'], settings: any) => {
    if (!selectedImage) {
      message.error('Please select an image first');
      return;
    }

    const job: ProcessingJob = {
      id: Date.now().toString(),
      imageId: selectedImage.id,
      type,
      status: 'processing',
      progress: 0,
      settings
    };

    setProcessingJobs(prev => [job, ...prev]);
    setCurrentJob(job);
    setProcessingModalVisible(true);

    // Simulate processing
    const interval = setInterval(() => {
      setProcessingJobs(prev => prev.map(j => {
        if (j.id === job.id) {
          const newProgress = Math.min(j.progress + Math.random() * 20, 95);
          return { ...j, progress: newProgress };
        }
        return j;
      }));
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setProcessingJobs(prev => prev.map(j => {
        if (j.id === job.id) {
          return { 
            ...j, 
            status: 'completed',
            progress: 100,
            result: `processed_${selectedImage.name}`
          };
        }
        return j;
      }));
      
      message.success(`Image ${type} completed successfully!`);
      setProcessingModalVisible(false);
    }, 2000);
  };

  const importToNotes = () => {
    if (!selectedImage) {
      message.error('Please select an image first');
      return;
    }

    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const newNote = {
      id: Date.now().toString(),
      title: `Image - ${selectedImage.name}`,
      content: `
![${selectedImage.name}](${selectedImage.url})

**Image Details:**
- Format: ${selectedImage.format.toUpperCase()}
- Dimensions: ${selectedImage.dimensions.width} x ${selectedImage.dimensions.height}
- Size: ${(selectedImage.size / 1024).toFixed(2)} KB
- Type: ${selectedImage.type}
- Created: ${new Date(selectedImage.createdAt).toLocaleString()}
      `.trim(),
      category: 'study',
      tags: ['image', selectedImage.type, selectedImage.format],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      format: 'markdown'
    };

    notes.unshift(newNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    message.success('Image imported to notes successfully!');
  };

  const deleteImage = (imageId: string) => {
    setImages(prev => prev.filter(image => image.id !== imageId));
    message.success('Image deleted successfully!');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageIcon = (type: ImageFile['type']) => {
    switch (type) {
      case 'upload': return <UploadOutlined />;
      case 'camera': return <CameraOutlined />;
      case 'screenshot': return <PictureOutlined />;
      case 'generated': return <FileImageOutlined />;
      default: return <PictureOutlined />;
    }
  };

  const getImageTypeColor = (type: ImageFile['type']) => {
    switch (type) {
      case 'upload': return 'blue';
      case 'camera': return 'green';
      case 'screenshot': return 'orange';
      case 'generated': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Image Processor</Title>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Image Library" key="library">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Capture Controls */}
              <div>
                <Title level={4}>Image Capture Options</Title>
                <Row gutter={16}>
                  <Col span={6}>
                    <Upload
                      beforeUpload={handleImageUpload}
                      showUploadList={false}
                      multiple={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />} block>
                        Upload Image
                      </Button>
                    </Upload>
                  </Col>
                  <Col span={6}>
                    <Button 
                      icon={<CameraOutlined />}
                      onClick={captureFromCamera}
                      block
                    >
                      Take Photo
                    </Button>
                  </Col>
                  <Col span={6}>
                    <Button 
                      icon={<ScissorOutlined />}
                      onClick={captureScreenshot}
                      block
                    >
                      Screenshot
                    </Button>
                  </Col>
                  <Col span={6}>
                    <Button 
                      icon={<ThunderboltOutlined />}
                      onClick={() => setPromptModalVisible(true)}
                      type="primary"
                      block
                    >
                      AI Generate
                    </Button>
                  </Col>
                  <Col span={6}>
                    {selectedImage && (
                      <Button 
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={importToNotes}
                        block
                      >
                        Import to Notes
                      </Button>
                    )}
                  </Col>
                </Row>
              </div>

              {/* Camera Capture Modal */}
              <Modal
                title="Camera Capture"
                visible={isCapturing}
                onCancel={() => {
                  if (videoRef.current?.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                    videoRef.current.srcObject = null;
                  }
                  setIsCapturing(false);
                }}
                footer={[
                  <Button key="capture" type="primary" onClick={takePhoto}>
                    Take Photo
                  </Button>
                ]}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  style={{ width: '100%' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Modal>

              {/* Image List */}
              <div>
                <Title level={4}>Image Library</Title>
                {images.length === 0 ? (
                  <Alert
                    message="No images yet"
                    description="Upload, capture, or take screenshots to add images to your library."
                    type="info"
                    showIcon
                  />
                ) : (
                  <List
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={images}
                    renderItem={(image) => (
                      <List.Item>
                        <Card
                          hoverable
                          cover={
                            <img 
                              src={image.url} 
                              alt={image.name}
                              style={{ 
                                width: '100%', 
                                height: 150, 
                                objectFit: 'cover' 
                              }}
                            />
                          }
                          actions={[
                            <Button 
                              icon={<EyeOutlined />}
                              onClick={() => {
                                setSelectedImage(image);
                                setPreviewModalVisible(true);
                              }}
                            />,
                            <Button 
                              icon={<SettingOutlined />}
                              onClick={() => {
                                setSelectedImage(image);
                                setActiveTab('process');
                              }}
                            />,
                            <Button 
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => deleteImage(image.id)}
                            />
                          ]}
                        >
                          <Card.Meta
                            title={
                              <Space>
                                <Badge count={getImageIcon(image.type)}>{getImageIcon(image.type)}</Badge>
                                <Text ellipsis style={{ maxWidth: 120 }}>{image.name}</Text>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" size="small">
                                <Tag color={getImageTypeColor(image.type)}>{image.type}</Tag>
                                <Tag>{image.format.toUpperCase()}</Tag>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {image.dimensions.width}×{image.dimensions.height}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {formatFileSize(image.size)}
                                </Text>
                              </Space>
                            }
                          />
                        </Card>
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </Space>
          </TabPane>

          <TabPane tab="Image Processing" key="process">
            {selectedImage ? (
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Alert
                  message={`Processing: ${selectedImage.name}`}
                  description="Choose a processing option below"
                  type="info"
                  showIcon
                />

                {/* Preview */}
                <div>
                  <Title level={4}>Preview</Title>
                  <img 
                    src={selectedImage.url} 
                    alt={selectedImage.name}
                    style={{ 
                      width: '100%', 
                      maxHeight: 300, 
                      objectFit: 'contain',
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                    }}
                  />
                </div>

                {/* Adjustments */}
                <div>
                  <Title level={4}>Adjustments</Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text>Brightness: {brightness}%</Text>
                      <Slider 
                        value={brightness} 
                        onChange={setBrightness}
                        min={0} 
                        max={200} 
                      />
                    </div>
                    <div>
                      <Text>Contrast: {contrast}%</Text>
                      <Slider 
                        value={contrast} 
                        onChange={setContrast}
                        min={0} 
                        max={200} 
                      />
                    </div>
                    <div>
                      <Text>Saturation: {saturation}%</Text>
                      <Slider 
                        value={saturation} 
                        onChange={setSaturation}
                        min={0} 
                        max={200} 
                      />
                    </div>
                  </Space>
                </div>

                {/* Processing Options */}
                <div>
                  <Title level={4}>Processing Options</Title>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card 
                        size="small" 
                        title="Resize"
                        extra={<ZoomInOutlined />}
                        hoverable
                        onClick={() => {
                          Modal.confirm({
                            title: 'Resize Settings',
                            content: (
                              <Space direction="vertical" style={{ width: '100%' }}>
                                <Input placeholder="Width (px)" />
                                <Input placeholder="Height (px)" />
                                <Select defaultValue="contain" style={{ width: '100%' }}>
                                  <Option value="contain">Contain</Option>
                                  <Option value="cover">Cover</Option>
                                  <Option value="stretch">Stretch</Option>
                                </Select>
                              </Space>
                            ),
                            onOk: () => startProcessing('resize', { width: 800, height: 600 })
                          });
                        }}
                      >
                        <Text>Change image dimensions</Text>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card 
                        size="small" 
                        title="Crop"
                        extra={<ScissorOutlined />}
                        hoverable
                        onClick={() => startProcessing('crop', { x: 0, y: 0, width: 200, height: 200 })}
                      >
                        <Text>Crop to specific area</Text>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card 
                        size="small" 
                        title="Rotate"
                        extra={<RotateLeftOutlined />}
                        hoverable
                        onClick={() => startProcessing('rotate', { angle: 90 })}
                      >
                        <Text>Rotate image</Text>
                      </Card>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col span={8}>
                      <Card 
                        size="small" 
                        title="Apply Filter"
                        extra={<FilterOutlined />}
                        hoverable
                        onClick={() => {
                          Modal.confirm({
                            title: 'Select Filter',
                            content: (
                              <Select defaultValue="none" style={{ width: '100%' }}>
                                {filters.map(filter => (
                                  <Option key={filter.value} value={filter.value}>
                                    {filter.label}
                                  </Option>
                                ))}
                              </Select>
                            ),
                            onOk: () => startProcessing('filter', { filter: 'grayscale' })
                          });
                        }}
                      >
                        <Text>Apply visual filters</Text>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card 
                        size="small" 
                        title="Convert Format"
                        extra={<BgColorsOutlined />}
                        hoverable
                        onClick={() => {
                          Modal.confirm({
                            title: 'Select Format',
                            content: (
                              <Select defaultValue="jpeg" style={{ width: '100%' }}>
                                {imageFormats.map(format => (
                                  <Option key={format.value} value={format.value}>
                                    {format.label} - {format.description}
                                  </Option>
                                ))}
                              </Select>
                            ),
                            onOk: () => startProcessing('convert', { format: 'jpeg' })
                          });
                        }}
                      >
                        <Text>Convert to different format</Text>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card 
                        size="small" 
                        title="Enhance"
                        extra={<SettingOutlined />}
                        hoverable
                        onClick={() => startProcessing('enhance', { auto: true })}
                      >
                        <Text>Auto-enhance quality</Text>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Space>
            ) : (
              <Alert
                message="No image selected"
                description="Please select an image from the library to process."
                type="warning"
                showIcon
              />
            )}
          </TabPane>

          <TabPane tab="Processing Queue" key="queue">
            <div>
              <Title level={4}>Processing Jobs</Title>
              {processingJobs.length === 0 ? (
                <Alert
                  message="No processing jobs"
                  description="Your image processing jobs will appear here."
                  type="info"
                  showIcon
                />
              ) : (
                <List
                  dataSource={processingJobs}
                  renderItem={(job) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<SettingOutlined spin={job.status === 'processing'} />}
                        title={
                          <Space>
                            <Text>{job.type.replace('_', ' ').toUpperCase()}</Text>
                            <Tag color={job.status === 'completed' ? 'green' : job.status === 'processing' ? 'blue' : job.status === 'failed' ? 'red' : 'default'}>
                              {job.status}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text type="secondary">
                              Image: {images.find(i => i.id === job.imageId)?.name || 'Unknown'}
                            </Text>
                            {job.status === 'processing' && (
                              <Progress percent={Math.round(job.progress)} status="active" size="small" />
                            )}
                            {job.status === 'completed' && (
                              <Progress percent={100} status="success" size="small" />
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Image Preview Modal */}
      <Modal
        title={`Image Preview - ${selectedImage?.name}`}
        visible={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="notes" type="primary" icon={<SaveOutlined />} onClick={importToNotes}>
            Import to Notes
          </Button>
        ]}
        width={800}
      >
        {selectedImage && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <img 
              src={selectedImage.url} 
              alt={selectedImage.name}
              style={{ 
                width: '100%', 
                maxHeight: 400, 
                objectFit: 'contain' 
              }}
            />
            <div>
              <Text strong>Image Details:</Text>
              <div style={{ marginTop: 8 }}>
                <Space direction="vertical" size="small">
                  <Text>Format: {selectedImage.format.toUpperCase()}</Text>
                  <Text>Dimensions: {selectedImage.dimensions.width} × {selectedImage.dimensions.height}</Text>
                  <Text>Size: {formatFileSize(selectedImage.size)}</Text>
                  <Text>Type: {selectedImage.type}</Text>
                  <Text>Created: {new Date(selectedImage.createdAt).toLocaleString()}</Text>
                </Space>
              </div>
            </div>
          </Space>
        )}
      </Modal>

      {/* Processing Modal */}
      <Modal
        title="Processing Image"
        visible={processingModalVisible}
        onCancel={() => setProcessingModalVisible(false)}
        footer={null}
        closable={false}
      >
        {currentJob && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Text>Processing: {currentJob.type.replace('_', ' ').toUpperCase()}</Text>
            <Progress percent={Math.round(currentJob.progress)} status="active" />
            <Text type="secondary">Please wait while we process your image...</Text>
          </Space>
        )}
      </Modal>

      {/* AI Generation Modal */}
      <Modal
        title="Generate Image with AI"
        visible={promptModalVisible}
        onOk={generateImageFromPrompt}
        onCancel={() => setPromptModalVisible(false)}
        confirmLoading={isGenerating}
        okText="Generate"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Describe the image you want to generate:</Text>
            <TextArea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="e.g., A beautiful sunset over mountains, digital art style..."
              rows={4}
              style={{ marginTop: 8 }}
            />
          </div>
          <Alert
            message="AI Image Generation"
            description="This feature uses AI to generate images based on your text description. The generated images will be added to your library."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default ImageProcessor;
