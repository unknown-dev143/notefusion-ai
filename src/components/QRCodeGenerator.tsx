import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Input, 
  message, 
  Modal, 
  List,
  Tabs,
  Tag,
  Alert,
  Row,
  Col,
  Select,
  Switch
} from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrcodeOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  LinkOutlined,
  CopyOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface ShareableContent {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'document' | 'subtitle' | 'image' | 'video';
  url?: string;
  tags?: string[];
  createdAt: string;
}

const QRCodeGenerator: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<ShareableContent | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareType, setShareType] = useState<'qr' | 'link' | 'embed'>('qr');
  const [isPublic, setIsPublic] = useState(false);
  const [expiresIn, setExpiresIn] = useState('7d');
  const [password, setPassword] = useState('');
  const [generatedLinks, setGeneratedLinks] = useState<any[]>([]);

  const shareableContent: ShareableContent[] = [
    // Load from localStorage notes
    ...(JSON.parse(localStorage.getItem('notes') || '[]').map((note: any) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      type: 'note' as const,
      tags: note.tags,
      createdAt: note.createdAt
    }))),
    // Mock other content types
    {
      id: 'doc1',
      title: 'Sample Document',
      content: 'This is a sample document content...',
      type: 'document' as const,
      tags: ['document', 'sample'],
      createdAt: new Date().toISOString()
    }
  ];

  const generateShareableUrl = (content: ShareableContent) => {
    const baseUrl = window.location.origin;
    const shareId = btoa(JSON.stringify({
      id: content.id,
      type: content.type,
      timestamp: Date.now()
    }));
    
    return `${baseUrl}/shared/${shareId}`;
  };

  const generateQRCode = (content: ShareableContent) => {
    setSelectedContent(content);
    const url = generateShareableUrl(content);
    setShareUrl(url);
    setShareType('qr');
    setQrModalVisible(true);
  };

  const generateShareLink = (content: ShareableContent) => {
    setSelectedContent(content);
    const url = generateShareableUrl(content);
    setShareUrl(url);
    setShareType('link');
    setShareModalVisible(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Copied to clipboard!');
    }).catch(() => {
      message.error('Failed to copy to clipboard');
    });
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement('a');
      link.download = `qrcode-${selectedContent?.title || 'content'}.png`;
      link.href = url;
      link.click();
    }
  };

  const generateEmbedCode = (content: ShareableContent) => {
    const embedCode = `<iframe src="${generateShareableUrl(content)}" width="100%" height="500" frameborder="0"></iframe>`;
    return embedCode;
  };

  const shareToSocialMedia = (platform: string, content: ShareableContent) => {
    const url = generateShareableUrl(content);
    const text = `Check out this ${content.type}: ${content.title}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  const createShareLink = () => {
    if (!selectedContent) return;
    
    const linkData = {
      id: Date.now().toString(),
      contentId: selectedContent.id,
      url: shareUrl,
      type: shareType,
      isPublic,
      expiresIn,
      password,
      createdAt: new Date().toISOString(),
      views: 0,
      maxViews: 100
    };
    
    setGeneratedLinks(prev => [linkData, ...prev]);
    message.success('Share link created successfully!');
  };

  const exportShareData = () => {
    const dataStr = JSON.stringify(generatedLinks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'share-links.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>QR Code & Share Generator</Title>
      
      <Card>
        <Tabs defaultActiveKey="content">
          <TabPane tab="Shareable Content" key="content">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Alert
                message="Share Your Content"
                description="Generate QR codes, share links, and embed codes for your notes and documents."
                type="info"
                showIcon
              />
              
              <div>
                <Title level={4}>Available Content</Title>
                {shareableContent.length === 0 ? (
                  <Alert
                    message="No content available"
                    description="Create some notes or documents to share them."
                    type="warning"
                    showIcon
                  />
                ) : (
                  <List
                    dataSource={shareableContent}
                    renderItem={(content) => (
                      <List.Item
                        actions={[
                          <Button 
                            icon={<QrcodeOutlined />}
                            onClick={() => generateQRCode(content)}
                          >
                            QR Code
                          </Button>,
                          <Button 
                            icon={<LinkOutlined />}
                            onClick={() => generateShareLink(content)}
                          >
                            Share Link
                          </Button>,
                          <Button 
                            icon={<ShareAltOutlined />}
                            onClick={() => {
                              Modal.confirm({
                                title: 'Share to Social Media',
                                content: (
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button onClick={() => shareToSocialMedia('twitter', content)}>
                                      Share on Twitter
                                    </Button>
                                    <Button onClick={() => shareToSocialMedia('facebook', content)}>
                                      Share on Facebook
                                    </Button>
                                    <Button onClick={() => shareToSocialMedia('linkedin', content)}>
                                      Share on LinkedIn
                                    </Button>
                                    <Button onClick={() => shareToSocialMedia('whatsapp', content)}>
                                      Share on WhatsApp
                                    </Button>
                                  </Space>
                                )
                              });
                            }}
                          >
                            Social
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={content.title}
                          description={
                            <Space direction="vertical" size="small">
                              <Tag color="blue">{content.type}</Tag>
                              <Text type="secondary" ellipsis>
                                {content.content.substring(0, 100)}...
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Created: {new Date(content.createdAt).toLocaleDateString()}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </Space>
          </TabPane>

          <TabPane tab="Generated Links" key="links">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4}>Generated Share Links</Title>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={exportShareData}
                  disabled={generatedLinks.length === 0}
                >
                  Export Links
                </Button>
              </div>
              
              {generatedLinks.length === 0 ? (
                <Alert
                  message="No links generated yet"
                  description="Generate some QR codes or share links to see them here."
                  type="info"
                  showIcon
                />
              ) : (
                <List
                  dataSource={generatedLinks}
                  renderItem={(link) => (
                    <List.Item
                      actions={[
                        <Button 
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(link.url)}
                        >
                          Copy
                        </Button>,
                        <Button 
                          icon={<EyeOutlined />}
                          onClick={() => window.open(link.url, '_blank')}
                        >
                          View
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={`Link ${link.id}`}
                        description={
                          <Space direction="vertical" size="small">
                            <Text code style={{ fontSize: 12 }}>{link.url}</Text>
                            <Space>
                              <Tag color={link.type === 'qr' ? 'blue' : 'green'}>
                                {link.type.toUpperCase()}
                              </Tag>
                              <Tag color={link.isPublic ? 'green' : 'orange'}>
                                {link.isPublic ? 'Public' : 'Private'}
                              </Tag>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Views: {link.views}/{link.maxViews}
                              </Text>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Created: {new Date(link.createdAt).toLocaleString()}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Space>
          </TabPane>
        </Tabs>
      </Card>

      {/* QR Code Modal */}
      <Modal
        title={`QR Code - ${selectedContent?.title}`}
        visible={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={downloadQRCode}>
            Download QR Code
          </Button>,
          <Button key="copy" icon={<CopyOutlined />} onClick={() => copyToClipboard(shareUrl)}>
            Copy URL
          </Button>,
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            Close
          </Button>
        ]}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large" align="center">
          <QRCodeSVG value={shareUrl} size={256} />
          <Text type="secondary">Scan to view content</Text>
          <Text code style={{ wordBreak: 'break-all' }}>{shareUrl}</Text>
        </Space>
      </Modal>

      {/* Share Link Modal */}
      <Modal
        title={`Share Link - ${selectedContent?.title}`}
        visible={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="create" type="primary" onClick={createShareLink}>
            Create Share Link
          </Button>,
          <Button key="close" onClick={() => setShareModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Share URL:</Text>
            <Input
              value={shareUrl}
              readOnly
              addonAfter={<CopyOutlined onClick={() => copyToClipboard(shareUrl)} />}
              style={{ marginTop: 8 }}
            />
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <div>
                <Text strong>Visibility:</Text>
                <div style={{ marginTop: 8 }}>
                  <Switch 
                    checked={isPublic} 
                    onChange={setIsPublic}
                    checkedChildren="Public"
                    unCheckedChildren="Private"
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {isPublic ? 'Anyone with the link can view' : 'Only authorized users can view'}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text strong>Expires in:</Text>
                <Select
                  value={expiresIn}
                  onChange={setExpiresIn}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <Option value="1d">1 Day</Option>
                  <Option value="7d">7 Days</Option>
                  <Option value="30d">30 Days</Option>
                  <Option value="never">Never</Option>
                </Select>
              </div>
            </Col>
          </Row>

          <div>
            <Text strong>Password (optional):</Text>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Add password protection"
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <Text strong>Embed Code:</Text>
            <TextArea
              value={selectedContent ? generateEmbedCode(selectedContent) : ''}
              readOnly
              rows={3}
              style={{ marginTop: 8 }}
            />
          </div>

          <Alert
            message="Sharing Options"
            description="You can also share this content directly to social media platforms."
            type="info"
            showIcon
          />
        </Space>
      </Modal>
    </div>
  );
};

export default QRCodeGenerator;
