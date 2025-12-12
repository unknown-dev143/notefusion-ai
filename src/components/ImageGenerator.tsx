import React, { useState } from 'react';
import { Card, Typography, Button, Space, Input, Select, Slider, message, Upload, Image, Switch } from 'antd';
import { PictureOutlined, DownloadOutlined, UploadOutlined, RobotOutlined, FontSizeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface GenerationOptions {
  prompt: string;
  style: 'realistic' | 'cartoon' | 'artistic' | 'abstract' | 'digital' | 'oil-painting';
  size: '256x256' | '512x512' | '1024x1024';
  quality: 'standard' | 'high';
  count: number;
  addSubtitle: boolean;
  subtitleText: string;
  subtitlePosition: 'top' | 'bottom' | 'center';
  subtitleStyle: 'simple' | 'bold' | 'elegant' | 'modern';
}

const ImageGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<GenerationOptions>({
    prompt: '',
    style: 'realistic',
    size: '512x512',
    quality: 'standard',
    count: 1,
    addSubtitle: false,
    subtitleText: '',
    subtitlePosition: 'bottom',
    subtitleStyle: 'simple'
  });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const generateImages = async () => {
    if (!options.prompt.trim()) {
      message.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI image generation
    setTimeout(async () => {
      const mockImages = Array.from({ length: options.count }, () => {
        const seed = Math.random().toString(36).substring(7);
        return `https://picsum.photos/${options.size.replace('x', '/')}?random=${seed}`;
      });
      
      // Add subtitles if enabled
      let finalImages = mockImages;
      if (options.addSubtitle && options.subtitleText.trim()) {
        finalImages = await Promise.all(
          mockImages.map(img => addSubtitleToImage(img, options.subtitleText, options.subtitlePosition, options.subtitleStyle))
        );
      }
      
      setGeneratedImages(finalImages);
      setIsGenerating(false);
      message.success(`${options.count} image(s) generated successfully!`);
    }, 3000);
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${index + 1}.png`;
    link.target = '_blank';
    link.click();
  };

  const addSubtitleToImage = async (imageUrl: string, subtitle: string, position: string, style: string): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageUrl;

    const img = document.createElement('img') as HTMLImageElement;
    img.crossOrigin = 'anonymous';
    
    return new Promise<string>((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Add subtitle
        ctx.font = getSubtitleFont(style, img.width);
        ctx.fillStyle = getSubtitleColor(style);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const x = canvas.width / 2;
        let y = canvas.height / 2;
        
        if (position === 'top') y = canvas.height * 0.1;
        else if (position === 'bottom') y = canvas.height * 0.9;
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(subtitle, x, y);
        
        resolve(canvas.toDataURL());
      };
      img.src = imageUrl;
    });
  };

  const getSubtitleFont = (style: string, imageWidth: number) => {
    const baseSize = Math.max(imageWidth * 0.03, 16);
    switch (style) {
      case 'bold': return `bold ${baseSize}px Arial`;
      case 'elegant': return `italic ${baseSize}px Georgia`;
      case 'modern': return `${baseSize}px Helvetica`;
      default: return `${baseSize}px Arial`;
    }
  };

  const getSubtitleColor = (style: string) => {
    switch (style) {
      case 'bold': return '#FFFFFF';
      case 'elegant': return '#F0F0F0';
      case 'modern': return '#00FF00';
      default: return '#FFFFFF';
    }
  };

  const uploadImage = (file: File) => {
    // Simulate image upload for editing
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setGeneratedImages([imageUrl]);
      message.success('Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card title="AI Image Generator" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>Prompt:</Text>
          <TextArea
            placeholder="Describe the image you want to generate..."
            value={options.prompt}
            onChange={(e) => setOptions({ ...options, prompt: e.target.value })}
            rows={3}
            style={{ marginTop: 8 }}
          />
        </div>

        <div>
          <Text strong>Style:</Text>
          <Select
            value={options.style}
            onChange={(value) => setOptions({ ...options, style: value })}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Select.Option value="realistic">Realistic</Select.Option>
            <Select.Option value="cartoon">Cartoon</Select.Option>
            <Select.Option value="artistic">Artistic</Select.Option>
            <Select.Option value="abstract">Abstract</Select.Option>
            <Select.Option value="digital">Digital Art</Select.Option>
            <Select.Option value="oil-painting">Oil Painting</Select.Option>
          </Select>
        </div>

        <div>
          <Text strong>Size:</Text>
          <Select
            value={options.size}
            onChange={(value) => setOptions({ ...options, size: value })}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Select.Option value="256x256">Small (256x256)</Select.Option>
            <Select.Option value="512x512">Medium (512x512)</Select.Option>
            <Select.Option value="1024x1024">Large (1024x1024)</Select.Option>
          </Select>
        </div>

        <div>
          <Text strong>
            <FontSizeOutlined /> Subtitle Options:
          </Text>
          <div style={{ marginTop: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Switch
                  checked={options.addSubtitle}
                  onChange={(checked) => setOptions({ ...options, addSubtitle: checked })}
                  checkedChildren="Add Subtitle"
                  unCheckedChildren="No Subtitle"
                />
              </div>

              {options.addSubtitle && (
                <>
                  <div>
                    <Text>Subtitle Text:</Text>
                    <Input
                      value={options.subtitleText}
                      onChange={(e) => setOptions({ ...options, subtitleText: e.target.value })}
                      placeholder="Enter subtitle text..."
                      style={{ marginTop: 4 }}
                    />
                  </div>

                  <div>
                    <Text>Position:</Text>
                    <Select
                      value={options.subtitlePosition}
                      onChange={(value) => setOptions({ ...options, subtitlePosition: value })}
                      style={{ width: '100%', marginTop: 4 }}
                    >
                      <Select.Option value="top">Top</Select.Option>
                      <Select.Option value="center">Center</Select.Option>
                      <Select.Option value="bottom">Bottom</Select.Option>
                    </Select>
                  </div>

                  <div>
                    <Text>Style:</Text>
                    <Select
                      value={options.subtitleStyle}
                      onChange={(value) => setOptions({ ...options, subtitleStyle: value })}
                      style={{ width: '100%', marginTop: 4 }}
                    >
                      <Select.Option value="simple">Simple</Select.Option>
                      <Select.Option value="bold">Bold</Select.Option>
                      <Select.Option value="elegant">Elegant</Select.Option>
                      <Select.Option value="modern">Modern</Select.Option>
                    </Select>
                  </div>
                </>
              )}
            </Space>
          </div>
        </div>

        <div>
          <Text strong>Quality:</Text>
          <Select
            value={options.quality}
            onChange={(value) => setOptions({ ...options, quality: value })}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Select.Option value="standard">Standard</Select.Option>
            <Select.Option value="high">High Quality</Select.Option>
          </Select>
        </div>

        <div>
          <Text strong>Number of Images:</Text>
          <div style={{ marginTop: 8 }}>
            <Slider
              min={1}
              max={4}
              value={options.count}
              onChange={(value) => setOptions({ ...options, count: value })}
              marks={{
                1: '1',
                2: '2',
                3: '3',
                4: '4'
              }}
            />
          </div>
        </div>

        <Space>
          <Button 
            type="primary" 
            icon={<RobotOutlined />}
            onClick={generateImages}
            loading={isGenerating}
            size="large"
          >
            {isGenerating ? 'Generating...' : 'Generate Images'}
          </Button>
          
          <Upload
            accept="image/*"
            beforeUpload={(file) => {
              uploadImage(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              Upload Image
            </Button>
          </Upload>
        </Space>

        {generatedImages.length > 0 && (
          <div>
            <Title level={4}>Generated Images:</Title>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '16px'
            }}>
              {generatedImages.map((imageUrl, index) => (
                <Card
                  key={index}
                  size="small"
                  cover={
                    <Image
                      src={imageUrl}
                      alt={`Generated image ${index + 1}`}
                      style={{ height: '200px', objectFit: 'cover' }}
                      preview
                    />
                  }
                  actions={[
                    <Button
                      key="download"
                      icon={<DownloadOutlined />}
                      onClick={() => downloadImage(imageUrl, index)}
                      size="small"
                    >
                      Download
                    </Button>
                  ]}
                >
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Image {index + 1} • {options.size}
                  </Text>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div style={{ 
          padding: '16px', 
          background: '#f6f8fa', 
          borderRadius: '6px',
          marginTop: '16px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <PictureOutlined style={{ marginRight: '4px' }} />
            AI-powered image generation creates unique images based on your text prompts.
            Generated images can be downloaded and used in your notes or shared with others.
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default ImageGenerator;
