import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Select, 
  message, 
  Modal, 
  Input,
  Tabs,
  Row,
  Col,
  Divider,
  Alert,
  QRCode,
  Switch,
  Upload,
  Progress,
  Tag
} from 'antd';
import { 
  ShareAltOutlined,
  DownloadOutlined,
  MailOutlined,
  TwitterOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  WhatsAppOutlined,
  QrcodeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  CopyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface ShareableItem {
  id: string;
  type: 'note' | 'document' | 'whiteboard' | 'image' | 'video';
  title: string;
  content: string;
  url: string;
  thumbnail?: string;
  size?: number;
}

interface ExportOption {
  format: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ShareAndExport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('share');
  const [selectedItem, setSelectedItem] = useState<ShareableItem | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [shareLink, setShareLink] = useState('');
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareSettings, setShareSettings] = useState({
    allowDownload: true,
    allowEdit: false,
    passwordProtected: false,
    expiresAfter: 'never'
  });

  const mockItems: ShareableItem[] = [
    {
      id: '1',
      type: 'note',
      title: 'Machine Learning Notes',
      content: 'Comprehensive notes on machine learning fundamentals...',
      url: '/notes/ml-notes',
      size: 1024000
    },
    {
      id: '2',
      type: 'document',
      title: 'Research Paper.pdf',
      content: 'Research paper on neural networks...',
      url: '/docs/research-paper',
      size: 2048000
    },
    {
      id: '3',
      type: 'whiteboard',
      title: 'Brainstorming Session',
      content: 'Whiteboard with brainstorming ideas...',
      url: '/whiteboard/session-1',
      size: 512000
    }
  ];

  const exportOptions: ExportOption[] = [
    {
      format: 'pdf',
      label: 'PDF Document',
      icon: <FilePdfOutlined />,
      description: 'Portable Document Format - best for sharing'
    },
    {
      format: 'docx',
      label: 'Word Document',
      icon: <FileWordOutlined />,
      description: 'Microsoft Word format - editable'
    },
    {
      format: 'xlsx',
      label: 'Excel Spreadsheet',
      icon: <FileExcelOutlined />,
      description: 'Microsoft Excel format - for data'
    },
    {
      format: 'png',
      label: 'PNG Image',
      icon: <FileImageOutlined />,
      description: 'High quality image - for graphics'
    },
    {
      format: 'txt',
      label: 'Text File',
      icon: <FileTextOutlined />,
      description: 'Plain text - universal format'
    }
  ];

  const socialPlatforms = [
    { key: 'twitter', name: 'Twitter', icon: <TwitterOutlined style={{ color: '#1DA1F2' }} />, color: '#1DA1F2' },
    { key: 'facebook', name: 'Facebook', icon: <FacebookOutlined style={{ color: '#4267B2' }} />, color: '#4267B2' },
    { key: 'linkedin', name: 'LinkedIn', icon: <LinkedinOutlined style={{ color: '#0077B5' }} />, color: '#0077B5' },
    { key: 'whatsapp', name: 'WhatsApp', icon: <WhatsAppOutlined style={{ color: '#25D366' }} />, color: '#25D366' },
    { key: 'email', name: 'Email', icon: <MailOutlined style={{ color: '#EA4335' }} />, color: '#EA4335' }
  ];

  const generateShareLink = (item: ShareableItem) => {
    const shareId = btoa(`${item.id}-${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '');
    const link = `${window.location.origin}/shared/${shareId}`;
    
    // Store share data in localStorage (in production, this would be on a server)
    localStorage.setItem(`share-${shareId}`, JSON.stringify({
      item,
      settings: shareSettings,
      createdAt: new Date().toISOString()
    }));
    
    return link;
  };

  const handleShare = (item: ShareableItem) => {
    setSelectedItem(item);
    const link = generateShareLink(item);
    setShareLink(link);
    setShareModalVisible(true);
  };

  const handleExport = (item: ShareableItem) => {
    setSelectedItem(item);
    setExportModalVisible(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Link copied to clipboard!');
    } catch (error) {
      message.error('Failed to copy link');
    }
  };

  const shareToSocial = (platform: string) => {
    if (!selectedItem) return;

    const url = encodeURIComponent(shareLink);
    const text = encodeURIComponent(`Check out this ${selectedItem.type}: ${selectedItem.title}`);

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(selectedItem.title)}&body=${text}%20${url}`;
        break;
    }
  };

  const performExport = async () => {
    if (!selectedItem) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      // Create export based on format
      let content = selectedItem.content;
      let mimeType = 'text/plain';
      let fileName = `${selectedItem.title.replace(/[^a-zA-Z0-9]/g, '_')}.${selectedFormat}`;

      switch (selectedFormat) {
        case 'pdf':
          content = generatePDFContent(selectedItem);
          mimeType = 'application/pdf';
          break;
        case 'docx':
          content = generateDOCXContent(selectedItem);
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'xlsx':
          content = generateExcelContent(selectedItem);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'png':
          content = generateImageContent(selectedItem);
          mimeType = 'image/png';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setUploading(false);
      setUploadProgress(0);
      setExportModalVisible(false);
      message.success(`${selectedItem.title} exported as ${selectedFormat.toUpperCase()} successfully!`);
    }, 2000);
  };

  const generatePDFContent = (item: ShareableItem): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${item.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    .meta { color: #666; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>${item.title}</h1>
  <div class="meta">
    <p>Type: ${item.type}</p>
    <p>Exported: ${new Date().toLocaleString()}</p>
  </div>
  <div>${item.content}</div>
</body>
</html>`;
  };

  const generateDOCXContent = (item: ShareableItem): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${item.title}</title>
  <style>
    body { font-family: 'Calibri', sans-serif; margin: 40px; }
    h1 { color: #2c3e50; }
  </style>
</head>
<body>
  <h1>${item.title}</h1>
  <p><strong>Type:</strong> ${item.type}</p>
  <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>
  <hr>
  <div>${item.content}</div>
</body>
</html>`;
  };

  const generateExcelContent = (item: ShareableItem): string => {
    return `Title,Type,Exported Date,Content
"${item.title}","${item.type}","${new Date().toLocaleString()}","${item.content.replace(/"/g, '""')}"`;
  };

  const generateImageContent = (item: ShareableItem): string => {
    // This would generate an actual image in a real implementation
    return `Image content for ${item.title}`;
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Share & Export</Title>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Share Items" key="share">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Alert
                message="Share your content"
                description="Select any item below to generate shareable links or share directly to social media."
                type="info"
                showIcon
              />
              
              <div>
                <Title level={4}>Available Items</Title>
                <Row gutter={[16, 16]}>
                  {mockItems.map(item => (
                    <Col span={8} key={item.id}>
                      <Card 
                        size="small"
                        hoverable
                        actions={[
                          <Button 
                            icon={<ShareAltOutlined />} 
                            onClick={() => handleShare(item)}
                            size="small"
                          >
                            Share
                          </Button>,
                          <Button 
                            icon={<DownloadOutlined />} 
                            onClick={() => handleExport(item)}
                            size="small"
                          >
                            Export
                          </Button>
                        ]}
                      >
                        <Card.Meta
                          title={item.title}
                          description={
                            <Space direction="vertical" size="small">
                              <Tag color="blue">{item.type}</Tag>
                              <Text type="secondary">
                                {item.size && `${(item.size / 1024 / 1024).toFixed(2)} MB`}
                              </Text>
                            </Space>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Space>
          </TabPane>

          <TabPane tab="Export History" key="history">
            <div>
              <Title level={4}>Recent Exports</Title>
              <Alert
                message="No export history yet"
                description="Your export history will appear here once you start exporting items."
                type="info"
                showIcon
              />
            </div>
          </TabPane>

          <TabPane tab="Cloud Storage" key="cloud">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Alert
                message="Cloud Storage Integration"
                description="Upload your files to cloud storage for easy access and sharing."
                type="info"
                showIcon
              />
              
              <Upload.Dragger
                name="file"
                multiple={false}
                showUploadList={false}
                beforeUpload={() => false}
              >
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">Click or drag file to upload to cloud</p>
                <p className="ant-upload-hint">Support for single file upload.</p>
              </Upload.Dragger>

              {uploading && (
                <div>
                  <Text>Uploading to cloud...</Text>
                  <Progress percent={uploadProgress} status="active" />
                </div>
              )}
            </Space>
          </TabPane>
        </Tabs>
      </Card>

      {/* Share Modal */}
      <Modal
        title={`Share: ${selectedItem?.title}`}
        visible={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedItem && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={5}>Share Link</Title>
              <Input.TextArea
                value={shareLink}
                readOnly
                rows={3}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                style={{ marginTop: 8 }}
              />
              <Space style={{ marginTop: 8 }}>
                <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(shareLink)}>
                  Copy Link
                </Button>
                <Button icon={<QrcodeOutlined />} onClick={() => setQrCodeVisible(true)}>
                  Show QR Code
                </Button>
              </Space>
            </div>

            <Divider />

            <div>
              <Title level={5}>Share to Social Media</Title>
              <Row gutter={[8, 8]}>
                {socialPlatforms.map(platform => (
                  <Col span={12} key={platform.key}>
                    <Button
                      icon={platform.icon}
                      onClick={() => shareToSocial(platform.key)}
                      style={{ width: '100%', borderColor: platform.color }}
                    >
                      Share to {platform.name}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>

            <Divider />

            <div>
              <Title level={5}>Share Settings</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Space>
                    <Text>Allow Download:</Text>
                    <Switch 
                      checked={shareSettings.allowDownload}
                      onChange={(checked) => setShareSettings(prev => ({ ...prev, allowDownload: checked }))}
                    />
                  </Space>
                </div>
                <div>
                  <Space>
                    <Text>Allow Edit:</Text>
                    <Switch 
                      checked={shareSettings.allowEdit}
                      onChange={(checked) => setShareSettings(prev => ({ ...prev, allowEdit: checked }))}
                    />
                  </Space>
                </div>
                <div>
                  <Space>
                    <Text>Password Protected:</Text>
                    <Switch 
                      checked={shareSettings.passwordProtected}
                      onChange={(checked) => setShareSettings(prev => ({ ...prev, passwordProtected: checked }))}
                    />
                  </Space>
                </div>
              </Space>
            </div>
          </Space>
        )}
      </Modal>

      {/* Export Modal */}
      <Modal
        title={`Export: ${selectedItem?.title}`}
        visible={exportModalVisible}
        onOk={performExport}
        onCancel={() => setExportModalVisible(false)}
        confirmLoading={uploading}
        width={500}
      >
        {selectedItem && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={5}>Select Export Format</Title>
              <Select
                value={selectedFormat}
                onChange={setSelectedFormat}
                style={{ width: '100%', marginTop: 8 }}
              >
                {exportOptions.map(option => (
                  <Option key={option.format} value={option.format}>
                    <Space>
                      {option.icon}
                      <div>
                        <div>{option.label}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {option.description}
                        </Text>
                      </div>
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>

            {uploading && (
              <div>
                <Text>Exporting...</Text>
                <Progress percent={uploadProgress} status="active" />
              </div>
            )}

            <Alert
              message="Export Information"
              description={`Your ${selectedItem.type} will be exported as ${selectedFormat.toUpperCase()} format with all content preserved.`}
              type="info"
              showIcon
            />
          </Space>
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title="QR Code"
        visible={qrCodeVisible}
        onCancel={() => setQrCodeVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQrCodeVisible(false)}>
            Close
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center' }}>
          <QRCode value={shareLink} size={200} />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Scan this QR code to access the shared content</Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShareAndExport;
