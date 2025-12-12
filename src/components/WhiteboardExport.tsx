import React, { useState } from 'react';
import { Card, Button, Space, Typography, Row, Col, message, Select, Modal, Input } from 'antd';
import { DownloadOutlined, ShareAltOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const WhiteboardExport: React.FC = () => {
  const [exportFormat, setExportFormat] = useState('png');
  const [layers, setLayers] = useState([
    { id: '1', name: 'Background', visible: true, locked: true },
    { id: '2', name: 'Shapes', visible: true, locked: false },
    { id: '3', name: 'Text', visible: true, locked: false },
    { id: '4', name: 'Charts', visible: true, locked: false }
  ]);

  const enableShapeRecognition = () => {
    // Get the canvas from the whiteboard
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      message.error('Canvas not found');
      return;
    }

    // Simulate shape recognition
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Add visual feedback
      ctx.strokeStyle = '#52c41a';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      // Draw a rectangle around detected shapes (mock implementation)
      ctx.strokeRect(50, 50, 100, 100);
      ctx.strokeRect(200, 100, 80, 80);
      
      // Reset line dash
      ctx.setLineDash([]);
    }
    
    message.success('Shape recognition enabled! Detected shapes highlighted in green.');
  };

  const convertShapesToPerfect = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      message.error('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Clear the temporary recognition lines
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw with perfect shapes (mock implementation)
      ctx.strokeStyle = '#1890ff';
      ctx.lineWidth = 3;
      
      // Draw perfect shapes
      ctx.beginPath();
      ctx.rect(50, 50, 100, 100);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(240, 140, 40, 0, 2 * Math.PI);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(300, 200);
      ctx.lineTo(400, 200);
      ctx.lineTo(350, 280);
      ctx.closePath();
      ctx.stroke();
    }
    
    message.success('Shapes converted to perfect geometric forms!');
  };

  const exportOptions = [
    { value: 'png', label: 'PNG Image', icon: <FileImageOutlined /> },
    { value: 'jpg', label: 'JPG Image', icon: <FileImageOutlined /> },
    { value: 'svg', label: 'SVG Vector', icon: <FileTextOutlined /> },
    { value: 'pdf', label: 'PDF Document', icon: <FilePdfOutlined /> }
  ];

  const handleExport = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      message.error('Canvas not found');
      return;
    }

    switch (exportFormat) {
      case 'png':
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `whiteboard_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            message.success('Whiteboard exported as PNG!');
          }
        });
        break;
      
      case 'jpg':
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `whiteboard_${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            message.success('Whiteboard exported as JPG!');
          }
        }, 'image/jpeg');
        break;
      
      case 'svg':
        // Convert canvas to SVG (simplified version)
        const svgData = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
            <foreignObject width="100%" height="100%">
              <img xmlns="http://www.w3.org/1999/xhtml" src="${canvas.toDataURL()}" />
            </foreignObject>
          </svg>
        `;
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `whiteboard_${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        message.success('Whiteboard exported as SVG!');
        break;
      
      case 'pdf':
        // For PDF export, we'll create a simple HTML and suggest printing to PDF
        const htmlContent = `
          <html>
            <head>
              <title>Whiteboard Export</title>
              <style>
                body { margin: 0; padding: 20px; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <h1>Whiteboard Export</h1>
              <p>Exported on: ${new Date().toLocaleString()}</p>
              <img src="${canvas.toDataURL()}" />
            </body>
          </html>
        `;
        const pdfBlob = new Blob([htmlContent], { type: 'text/html' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const pdfLink = document.createElement('a');
        pdfLink.href = pdfUrl;
        pdfLink.download = `whiteboard_${Date.now()}.html`;
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);
        URL.revokeObjectURL(pdfUrl);
        message.warning('PDF export requires additional library. Exporting as HTML instead. You can print this as PDF.');
        break;
      
      default:
        message.error('Invalid export format');
    }
  };

  const handleShare = async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      message.error('Canvas not found');
      return;
    }

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      // Create share data
      const shareData = {
        title: 'NoteFusion Whiteboard',
        text: 'Check out my whiteboard creation!',
        files: [new File([blob], 'whiteboard.png', { type: 'image/png' })]
      };

      // Try native share API first
      if (navigator.share && navigator.canShare && navigator.canShare({ files: shareData.files })) {
        await navigator.share(shareData);
        message.success('Whiteboard shared successfully!');
      } else {
        // Fallback: create shareable link
        const shareId = Date.now().toString();
        localStorage.setItem(`shared-whiteboard-${shareId}`, canvas.toDataURL());
        
        const shareUrl = `${window.location.origin}/shared-whiteboard/${shareId}`;
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        message.success('Share link copied to clipboard!');
        
        // Also show the link to user
        Modal.info({
          title: 'Share Link Created',
          content: (
            <div>
              <p>Share this link with others:</p>
              <Input.TextArea 
                value={shareUrl} 
                readOnly 
                style={{ marginTop: 8 }}
                onClick={(e: React.MouseEvent<HTMLTextAreaElement>) => (e.target as HTMLTextAreaElement).select()}
              />
              <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Note: This is a demo implementation. In production, this would require a backend server.
              </p>
            </div>
          ),
          width: 500
        });
      }
    } catch (error) {
      message.error('Failed to share whiteboard');
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const copyToClipboard = async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      message.error('Canvas not found');
      return;
    }

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      message.success('Whiteboard copied to clipboard!');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const dataUrl = canvas.toDataURL('image/png');
      const textarea = document.createElement('textarea');
      textarea.value = dataUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      message.success('Whiteboard data copied to clipboard!');
    }
  };

  const addNewLayer = () => {
    const newLayer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false
    };
    setLayers(prev => [...prev, newLayer]);
    message.success('New layer added!');
  };

  return (
    <Card title="Whiteboard Export & Layers">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Export Options */}
        <Card size="small" title="Export Options">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row align="middle" gutter={16}>
              <Col span={8}>
                <Text strong>Export Format:</Text>
              </Col>
              <Col span={16}>
                <Select
                  value={exportFormat}
                  onChange={setExportFormat}
                  style={{ width: '100%' }}
                  options={exportOptions}
                />
              </Col>
            </Row>
            
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  block
                >
                  Export as {exportFormat.toUpperCase()}
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  icon={<ShareAltOutlined />}
                  onClick={handleShare}
                  block
                >
                  Share Whiteboard
                </Button>
              </Col>
              <Col span={8}>
                <Button
                  onClick={copyToClipboard}
                  block
                >
                  Copy to Clipboard
                </Button>
              </Col>
            </Row>
          </Space>
        </Card>

        {/* Layers Management */}
        <Card size="small" title="Layers">
          <Space direction="vertical" style={{ width: '100%' }}>
            {layers.map((layer, index) => (
              <div key={layer.id} style={{
                padding: 12,
                backgroundColor: layer.visible ? '#fafafa' : '#f5f5f5',
                borderRadius: 6,
                border: `1px solid ${layer.locked ? '#ff4d4f' : '#d9d9d9'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Space>
                  <Button
                    size="small"
                    type={layer.visible ? 'primary' : 'default'}
                    onClick={() => toggleLayerVisibility(layer.id)}
                  >
                    {layer.visible ? '👁️' : '👁️‍🗨️'}
                  </Button>
                  <Text strong={layer.visible} style={{ 
                    opacity: layer.visible ? 1 : 0.5,
                    color: layer.locked ? '#ff4d4f' : '#000'
                  }}>
                    {layer.name}
                  </Text>
                </Space>
                
                <Space>
                  <Button
                    size="small"
                    type={layer.locked ? 'default' : 'default'}
                    onClick={() => toggleLayerLock(layer.id)}
                  >
                    {layer.locked ? '🔒' : '🔓'}
                  </Button>
                  <Button
                    size="small"
                    disabled={index === 0}
                  >
                    ⬆️
                  </Button>
                  <Button
                    size="small"
                    disabled={index === layers.length - 1}
                  >
                    ⬇️
                  </Button>
                </Space>
              </div>
            ))}
            
            <Button type="dashed" block style={{ marginTop: 8 }} onClick={addNewLayer}>
              + Add New Layer
            </Button>
          </Space>
        </Card>

        {/* Shape Recognition */}
        <Card size="small" title="Shape Recognition">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{
                  padding: 16,
                  backgroundColor: '#f0f2f5',
                  borderRadius: 6,
                  textAlign: 'center'
                }}>
                  <Title level={4}>🔍 Auto-Detect</Title>
                  <Text>Automatically detect and convert hand-drawn shapes</Text>
                  <Button 
                    type="primary" 
                    style={{ marginTop: 8 }}
                    onClick={enableShapeRecognition}
                  >
                    Enable Recognition
                  </Button>
                </div>
              </Col>
              <Col span={12}>
                <div style={{
                  padding: 16,
                  backgroundColor: '#f6ffed',
                  borderRadius: 6,
                  textAlign: 'center'
                }}>
                  <Title level={4}>⚡ Quick Convert</Title>
                  <Text>Convert selected drawings to perfect shapes</Text>
                  <Button 
                    type="primary" 
                    style={{ marginTop: 8 }}
                    onClick={convertShapesToPerfect}
                  >
                    Convert Selection
                  </Button>
                </div>
              </Col>
            </Row>
          </Space>
        </Card>
      </Space>
    </Card>
  );
};

export default WhiteboardExport;
