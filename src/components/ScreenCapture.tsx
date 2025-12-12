import React, { useState, useRef, useCallback } from 'react';
import { Card, Typography, Button, Space, message, Image, Select, Switch } from 'antd';
import { CameraOutlined, DownloadOutlined, ScissorOutlined, FullscreenOutlined, DesktopOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface ScreenshotData {
  id: string;
  url: string;
  timestamp: Date;
  type: 'full' | 'area' | 'window';
}

const ScreenCapture: React.FC = () => {
  const [screenshots, setScreenshots] = useState<ScreenshotData[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'full' | 'area' | 'window'>('full');
  const [autoSave, setAutoSave] = useState(true);
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureScreen = useCallback(async () => {
    setIsCapturing(true);
    
    try {
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const newScreenshot: ScreenshotData = {
              id: Date.now().toString(),
              url,
              timestamp: new Date(),
              type: captureMode
            };

            setScreenshots(prev => [newScreenshot, ...prev]);
            
            if (autoSave) {
              downloadScreenshot(newScreenshot);
            }

            message.success('Screenshot captured successfully!');
          }
        }, `image/${imageFormat}`);

        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
      };
    } catch (error) {
      console.error('Error capturing screen:', error);
      message.error('Failed to capture screen. Please ensure you grant screen capture permissions.');
      setIsCapturing(false);
    }
  }, [captureMode, autoSave, imageFormat]);

  const downloadScreenshot = (screenshot: ScreenshotData) => {
    const link = document.createElement('a');
    link.href = screenshot.url;
    link.download = `screenshot_${screenshot.id}.${imageFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Screenshot downloaded!');
  };

  const deleteScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(screenshot => screenshot.id !== id));
    message.success('Screenshot deleted!');
  };

  const copyToClipboard = async (screenshot: ScreenshotData) => {
    try {
      const response = await fetch(screenshot.url);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      message.success('Screenshot copied to clipboard!');
    } catch (error) {
      message.error('Failed to copy to clipboard');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Screen Capture Tool</Title>
      
      <Card title="Capture Settings" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Capture Mode</Text>
            <Select
              value={captureMode}
              onChange={setCaptureMode}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value="full">
                <Space><FullscreenOutlined /> Full Screen</Space>
              </Option>
              <Option value="area">
                <Space><ScissorOutlined /> Selected Area</Space>
              </Option>
              <Option value="window">
                <Space><DesktopOutlined /> Active Window</Space>
              </Option>
            </Select>
          </div>

          <div>
            <Text strong>Image Format</Text>
            <Select
              value={imageFormat}
              onChange={setImageFormat}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value="png">PNG (Lossless)</Option>
              <Option value="jpeg">JPEG (Compressed)</Option>
              <Option value="webp">WebP (Modern)</Option>
            </Select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Auto-save screenshots</Text>
            <Switch checked={autoSave} onChange={setAutoSave} />
          </div>

          <Button
            type="primary"
            icon={<CameraOutlined />}
            onClick={captureScreen}
            loading={isCapturing}
            size="large"
            block
          >
            {isCapturing ? 'Capturing...' : 'Capture Screen'}
          </Button>
        </Space>
      </Card>

      {screenshots.length > 0 && (
        <Card title={`Screenshots (${screenshots.length})`}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {screenshots.map((screenshot) => (
              <Card key={screenshot.id} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{screenshot.type.charAt(0).toUpperCase() + screenshot.type.slice(1)} Screen</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {screenshot.timestamp.toLocaleString()}
                      </Text>
                    </div>
                    <Space>
                      <Button
                        size="small"
                        onClick={() => copyToClipboard(screenshot)}
                      >
                        Copy
                      </Button>
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadScreenshot(screenshot)}
                      >
                        Download
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={() => deleteScreenshot(screenshot.id)}
                      >
                        Delete
                      </Button>
                    </Space>
                  </div>
                  <Image
                    src={screenshot.url}
                    alt={`Screenshot ${screenshot.id}`}
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </Space>
              </Card>
            ))}
          </Space>
        </Card>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ScreenCapture;
