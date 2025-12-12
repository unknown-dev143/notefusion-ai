import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Button, Space, Slider, Upload, message, Row, Col, Image } from 'antd';
import { 
  PictureOutlined, 
  DownloadOutlined, 
  UploadOutlined, 
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface FilterOptions {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
}

const ImageEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [savedImages, setSavedImages] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0
  });

  useEffect(() => {
    if (currentImage && canvasRef.current) {
      applyFilters();
    }
  }, [currentImage, filters, rotation, scale]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img') as HTMLImageElement;
      img.onload = () => {
        setCurrentImage(img);
        message.success('Image uploaded successfully!');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    return false;
  };

  const applyFilters = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Apply CSS filters
    const filterString = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
    `;
    ctx.filter = filterString;

    // Draw image
    ctx.drawImage(currentImage, 0, 0);

    // Restore context state
    ctx.restore();
  };

  const rotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const rotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const resetImage = () => {
    setRotation(0);
    setScale(1);
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0
    });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
    message.success('Image downloaded successfully!');
  };

  const saveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) {
      message.error('Please upload an image first');
      return;
    }

    const imageData = canvas.toDataURL('image/png');
    const savedImage = {
      id: Date.now().toString(),
      name: `Edited Image ${savedImages.length + 1}`,
      url: imageData,
      filters: filters,
      rotation: rotation,
      scale: scale,
      createdAt: new Date().toISOString()
    };

    setSavedImages(prev => [...prev, savedImage]);
    
    // Save to localStorage for persistence
    const existingImages = JSON.parse(localStorage.getItem('imageGallery') || '[]');
    localStorage.setItem('imageGallery', JSON.stringify([...existingImages, savedImage]));
    
    message.success('Image saved to gallery successfully!');
  };

  const updateFilter = (filterName: keyof FilterOptions, value: number) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Image Editor</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Canvas">
            <div style={{ 
              background: '#f5f5f5', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: 400,
              overflow: 'auto'
            }}>
              {currentImage ? (
                <canvas
                  ref={canvasRef}
                  style={{ 
                    maxWidth: '100%',
                    height: 'auto',
                    border: '1px solid #d9d9d9'
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <PictureOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                  <Title level={4} type="secondary" style={{ marginTop: 16 }}>
                    No image loaded
                  </Title>
                  <Text type="secondary">
                    Upload an image to start editing
                  </Text>
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="Upload Image">
              <Upload
                accept="image/*"
                beforeUpload={handleImageUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} block>
                  Upload Image
                </Button>
              </Upload>
            </Card>

            <Card title="Transform">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Rotation: {rotation}°</Text>
                  <div style={{ marginTop: 8 }}>
                    <Button icon={<RotateLeftOutlined />} onClick={rotateLeft} style={{ marginRight: 8 }}>
                      Rotate Left
                    </Button>
                    <Button icon={<RotateRightOutlined />} onClick={rotateRight}>
                      Rotate Right
                    </Button>
                  </div>
                </div>

                <div>
                  <Text>Scale: {scale.toFixed(1)}x</Text>
                  <div style={{ marginTop: 8 }}>
                    <Button icon={<ZoomOutOutlined />} onClick={zoomOut} style={{ marginRight: 8 }}>
                      Zoom Out
                    </Button>
                    <Button icon={<ZoomInOutlined />} onClick={zoomIn}>
                      Zoom In
                    </Button>
                  </div>
                </div>

                <Button icon={<ReloadOutlined />} onClick={resetImage} block>
                  Reset All
                </Button>
              </Space>
            </Card>

            <Card title="Filters">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Brightness: {filters.brightness}%</Text>
                  <Slider
                    min={0}
                    max={200}
                    value={filters.brightness}
                    onChange={(value) => updateFilter('brightness', value)}
                  />
                </div>

                <div>
                  <Text>Contrast: {filters.contrast}%</Text>
                  <Slider
                    min={0}
                    max={200}
                    value={filters.contrast}
                    onChange={(value) => updateFilter('contrast', value)}
                  />
                </div>

                <div>
                  <Text>Saturation: {filters.saturation}%</Text>
                  <Slider
                    min={0}
                    max={200}
                    value={filters.saturation}
                    onChange={(value) => updateFilter('saturation', value)}
                  />
                </div>

                <div>
                  <Text>Blur: {filters.blur}px</Text>
                  <Slider
                    min={0}
                    max={10}
                    value={filters.blur}
                    onChange={(value) => updateFilter('blur', value)}
                  />
                </div>

                <div>
                  <Text>Grayscale: {filters.grayscale}%</Text>
                  <Slider
                    min={0}
                    max={100}
                    value={filters.grayscale}
                    onChange={(value) => updateFilter('grayscale', value)}
                  />
                </div>

                <div>
                  <Text>Sepia: {filters.sepia}%</Text>
                  <Slider
                    min={0}
                    max={100}
                    value={filters.sepia}
                    onChange={(value) => updateFilter('sepia', value)}
                  />
                </div>
              </Space>
            </Card>

            <Card title="Actions">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />} 
                  onClick={downloadImage}
                  block
                  disabled={!currentImage}
                >
                  Download Image
                </Button>
                <Button 
                  icon={<SaveOutlined />} 
                  onClick={saveToGallery}
                  block
                  disabled={!currentImage}
                >
                  Save to Gallery
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Image Gallery */}
      {savedImages.length > 0 && (
        <Card title="Image Gallery" style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            {savedImages.map((image) => (
              <Col xs={24} sm={12} md={8} lg={6} key={image.id}>
                <Card
                  size="small"
                  hoverable
                  cover={
                    <Image
                      src={image.url}
                      alt={image.name}
                      style={{ height: 120, objectFit: 'cover' }}
                      preview={false}
                    />
                  }
                  actions={[
                    <Button size="small" icon={<DownloadOutlined />}>
                      Download
                    </Button>,
                    <Button size="small" icon={<SaveOutlined />}>
                      Edit
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={image.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Rotation: {image.rotation}°
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Scale: {image.scale}x
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(image.createdAt).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default ImageEditor;
