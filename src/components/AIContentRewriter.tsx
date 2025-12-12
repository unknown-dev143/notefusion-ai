import React, { useState } from 'react';
import { Card, Typography, Button, Space, Input, Select, Tabs, Slider, Tag, Row, Col, Alert, List } from 'antd';
import { 
  EditOutlined,
  CopyOutlined,
  DownloadOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface RewriteOption {
  id: string;
  label: string;
  description: string;
}

interface RewrittenContent {
  id: string;
  original: string;
  rewritten: string;
  style: string;
  tone: string;
  readabilityScore: number;
  seoScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: string;
}

const AIContentRewriter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rewriter');
  const [originalText, setOriginalText] = useState('');
  const [rewrittenText, setRewrittenText] = useState('');
  const [writingStyle, setWritingStyle] = useState('professional');
  const [tone, setTone] = useState('neutral');
  const [creativity, setCreativity] = useState(0.7);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenVersions, setRewrittenVersions] = useState<RewrittenContent[]>([]);
  const [seoKeywords, setSeoKeywords] = useState('');

  const rewriteOptions: RewriteOption[] = [
    { id: 'simplify', label: 'Simplify', description: 'Make text easier to understand' },
    { id: 'expand', label: 'Expand', description: 'Add more detail and examples' },
    { id: 'summarize', label: 'Summarize', description: 'Create concise summary' },
    { id: 'formal', label: 'Formal', description: 'Make more professional' },
    { id: 'casual', label: 'Casual', description: 'Make more conversational' },
    { id: 'persuasive', label: 'Persuasive', description: 'Add persuasive elements' }
  ];

  const handleRewrite = () => {
    setIsRewriting(true);
    // Mock AI rewrite
    setTimeout(() => {
      const rewritten = `Rewritten version of: "${originalText}" with ${writingStyle} style and ${tone} tone. This is an AI-generated content that maintains the original meaning while adapting to the specified parameters.`;
      setRewrittenText(rewritten);
      
      const newVersion: RewrittenContent = {
        id: Date.now().toString(),
        original: originalText,
        rewritten,
        style: writingStyle,
        tone,
        readabilityScore: Math.random() * 40 + 60,
        seoScore: Math.random() * 30 + 70,
        sentiment: tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : 'neutral',
        timestamp: new Date().toISOString()
      };
      
      setRewrittenVersions([newVersion, ...rewrittenVersions]);
      setIsRewriting(false);
    }, 2000);
  };

  const optimizeForSEO = () => {
    const keywords = seoKeywords.split(',').map(k => k.trim());
    // Mock SEO optimization
    setRewrittenText(`SEO-optimized content with keywords: ${keywords.join(', ')}. ${originalText}`);
  };

  const checkReadability = () => {
    const score = Math.random() * 40 + 60;
    return score;
  };

  const analyzeSentiment = () => {
    const sentiments = ['positive', 'neutral', 'negative'];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <Space>
          <EditOutlined />
          AI Content Rewriter
        </Space>
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Content Rewriter" key="rewriter">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Original Content" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <TextArea
                    placeholder="Enter your original text here..."
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    rows={10}
                  />
                  
                  <div>
                    <Text strong>Writing Style:</Text>
                    <Select
                      value={writingStyle}
                      onChange={setWritingStyle}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      <Option value="professional">Professional</Option>
                      <Option value="academic">Academic</Option>
                      <Option value="casual">Casual</Option>
                      <Option value="creative">Creative</Option>
                      <Option value="technical">Technical</Option>
                      <Option value="marketing">Marketing</Option>
                    </Select>
                  </div>

                  <div>
                    <Text strong>Tone:</Text>
                    <Select
                      value={tone}
                      onChange={setTone}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      <Option value="neutral">Neutral</Option>
                      <Option value="positive">Positive</Option>
                      <Option value="negative">Negative</Option>
                      <Option value="urgent">Urgent</Option>
                      <Option value="friendly">Friendly</Option>
                      <Option value="authoritative">Authoritative</Option>
                    </Select>
                  </div>

                  <div>
                    <Text strong>Creativity Level:</Text>
                    <Slider
                      value={creativity}
                      onChange={setCreativity}
                      min={0}
                      max={1}
                      step={0.1}
                      marks={{ 0: 'Conservative', 1: 'Creative' }}
                    />
                  </div>

                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={handleRewrite}
                    loading={isRewriting}
                    disabled={!originalText}
                    block
                  >
                    Rewrite Content
                  </Button>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Rewritten Content" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {rewrittenText ? (
                    <>
                      <TextArea
                        value={rewrittenText}
                        rows={10}
                        readOnly
                      />
                      <Space>
                        <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(rewrittenText)}>
                          Copy
                        </Button>
                        <Button icon={<DownloadOutlined />} onClick={() => downloadContent(rewrittenText, 'rewritten-content.txt')}>
                          Download
                        </Button>
                      </Space>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <EditOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                      <div style={{ marginTop: '16px' }}>
                        <Text type="secondary">Rewritten content will appear here</Text>
                      </div>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>

          <Card title="Quick Rewrite Options" style={{ marginTop: '16px' }}>
            <Row gutter={[16, 16]}>
              {rewriteOptions.map((option) => (
                <Col xs={24} sm={12} md={8} key={option.id}>
                  <Card size="small" hoverable>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>{option.label}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {option.description}
                      </Text>
                      <Button size="small" type="link">
                        Apply
                      </Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="SEO Optimizer" key="seo">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Target Keywords:</Text>
                <Input
                  placeholder="Enter keywords separated by commas..."
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  style={{ marginTop: '8px' }}
                />
              </div>

              <div>
                <Text strong>Content to Optimize:</Text>
                <TextArea
                  placeholder="Enter your content to optimize for SEO..."
                  rows={8}
                  style={{ marginTop: '8px' }}
                />
              </div>

              <Button
                type="primary"
                icon={<GlobalOutlined />}
                onClick={optimizeForSEO}
              >
                Optimize for SEO
              </Button>

              {rewrittenText && (
                <Alert
                  message="SEO Optimization Complete"
                  description="Your content has been optimized with target keywords and improved structure."
                  type="success"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Content Analysis" key="analysis">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Content to Analyze:</Text>
                <TextArea
                  placeholder="Enter content to analyze..."
                  rows={8}
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  style={{ marginTop: '8px' }}
                />
              </div>

              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => {}}
              >
                Analyze Content
              </Button>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card size="small" title="Readability Score">
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {checkReadability().toFixed(1)}%
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color="green">Good</Tag>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12}>
                  <Card size="small" title="Sentiment Analysis">
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {analyzeSentiment()}
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color="blue">Neutral</Tag>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Version History" key="history">
          <Card>
            <List
              dataSource={rewrittenVersions}
              renderItem={(version) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Style: {version.style}</Text>
                        <Text style={{ marginLeft: '16px' }}>Tone: {version.tone}</Text>
                      </div>
                      <div>
                        <Tag color="blue">Readability: {version.readabilityScore.toFixed(1)}%</Tag>
                        <Tag color="green">SEO: {version.seoScore.toFixed(1)}%</Tag>
                        <Tag color="orange">Sentiment: {version.sentiment}</Tag>
                      </div>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {version.rewritten}
                      </Paragraph>
                      <Space>
                        <Button size="small" icon={<CopyOutlined />}>
                          Copy
                        </Button>
                        <Button size="small" icon={<DownloadOutlined />}>
                          Download
                        </Button>
                      </Space>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AIContentRewriter;
