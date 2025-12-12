import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  List,
  Tag,
  Switch,
  Input,
  Upload,
  message,
  Row,
  Col,
  Select,
  Slider,
  Tooltip,
  Statistic,
} from 'antd';
import {
  FileTextOutlined,
  FileTextOutlined as SummarizeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CopyOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  BulbOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SummaryResult {
  originalText: string;
  summary: string;
  keyPoints: string[];
  summaryLength: number;
  compressionRatio: number;
  readingTime: {
    original: number;
    summary: number;
  };
  language: string;
  tone: 'formal' | 'casual' | 'professional' | 'academic';
}

const AIDocumentSummarizer: React.FC = () => {
  const [document, setDocument] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [summaryHistory] = useState<any[]>([]);
  const [summaryLength, setSummaryLength] = useState(30);
  const [extractKeyPoints, setExtractKeyPoints] = useState(true);
  const [tone, setTone] = useState<'formal' | 'casual' | 'professional' | 'academic'>('professional');
  const [language] = useState('english');

  const summarizeDocument = async () => {
    if (!document.trim()) {
      message.warning('Please enter a document to summarize');
      return;
    }

    setIsSummarizing(true);
    setResult(null);

    // Simulate AI document summarization
    setTimeout(() => {
      const words = document.split(' ');
      const targetWords = Math.floor(words.length * (summaryLength / 100));
      const summaryWords = words.slice(0, targetWords).join(' ');
      
      const mockResult: SummaryResult = {
        originalText: document,
        summary: summaryWords + '... [AI-generated summary based on key concepts and main points discussed in the original document.]',
        keyPoints: [
          'Main concept or thesis statement from the document',
          'Supporting evidence and key arguments presented',
          'Important conclusions or findings',
          'Significant implications or recommendations',
          'Contextual background information',
        ],
        summaryLength: summaryWords.length,
        compressionRatio: ((words.length - summaryWords.length) / words.length) * 100,
        readingTime: {
          original: Math.ceil(words.length / 200), // Average reading speed
          summary: Math.ceil(summaryWords.length / 200),
        },
        language,
        tone,
      };

      setResult(mockResult);
      setIsSummarizing(false);
      
      message.success('Document summarized successfully!');
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const exportSummary = () => {
    if (!result) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: result.summary,
      keyPoints: result.keyPoints,
      statistics: {
        originalLength: result.originalText.length,
        summaryLength: result.summaryLength,
        compressionRatio: result.compressionRatio,
        readingTimeSaved: result.readingTime.original - result.readingTime.summary,
      },
      settings: {
        summaryLength,
        tone,
        language,
      },
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-summary-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    message.success('Summary exported successfully!');
  };

  const printSummary = () => {
    if (!result) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow && printWindow.document) {
      const keyPointsHtml = result.keyPoints.map((point) => `<div class="key-point">• ${point}</div>`).join('');
      const htmlContent = `
        <html>
          <head>
            <title>Document Summary</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .summary { line-height: 1.6; }
              .key-points { margin-top: 20px; }
              .key-point { margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <h1>Document Summary</h1>
            <div class="summary">
              <h2>Summary</h2>
              <p>${result.summary}</p>
            </div>
            <div class="key-points">
              <h2>Key Points</h2>
              ${keyPointsHtml}
            </div>
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Document Input</span>
              </Space>
            }
            extra={
              <Space>
                <Select
                  value={tone}
                  onChange={setTone}
                  style={{ width: 120 }}
                >
                  <Select.Option value="formal">Formal</Select.Option>
                  <Select.Option value="casual">Casual</Select.Option>
                  <Select.Option value="professional">Professional</Select.Option>
                  <Select.Option value="academic">Academic</Select.Option>
                </Select>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                placeholder="Paste your document here for AI summarization..."
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                rows={12}
              />
              <div>
                <Text>Summary Length: {summaryLength}%</Text>
                <Slider
                  value={summaryLength}
                  onChange={setSummaryLength}
                  min={10}
                  max={80}
                  style={{ marginTop: '8px' }}
                />
              </div>
              <div>
                <Text>Extract key points:</Text>
                <Switch checked={extractKeyPoints} onChange={setExtractKeyPoints} />
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={<SummarizeOutlined />}
                  loading={isSummarizing}
                  onClick={summarizeDocument}
                  disabled={!document.trim()}
                >
                  {isSummarizing ? 'Summarizing...' : 'Summarize Document'}
                </Button>
                <Upload
                  accept=".txt,.pdf,.doc,.docx"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setDocument(e.target?.result as string);
                    };
                    reader.readAsText(file);
                    return false;
                  }}
                >
                  <Button icon={<FileTextOutlined />}>Upload Document</Button>
                </Upload>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* Summary Statistics */}
            {result && (
              <Card title="Summary Statistics" size="small">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Compression"
                      value={result.compressionRatio}
                      precision={1}
                      suffix="%"
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Time Saved"
                      value={result.readingTime.original - result.readingTime.summary}
                      suffix="min"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Original Words"
                      value={result.originalText.split(' ').length}
                      valueStyle={{ color: '#666' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Summary Words"
                      value={result.summary.split(' ').length}
                      valueStyle={{ color: '#666' }}
                    />
                  </Col>
                </Row>
              </Card>
            )}

            {/* Generated Summary */}
            {result && (
              <Card
                title={
                  <Space>
                    <SummarizeOutlined />
                    <span>Generated Summary</span>
                  </Space>
                }
                size="small"
                extra={
                  <Space>
                    <Tooltip title="Copy summary">
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(result.summary)}
                      />
                    </Tooltip>
                    <Tooltip title="Print summary">
                      <Button
                        type="text"
                        icon={<PrinterOutlined />}
                        onClick={printSummary}
                      />
                    </Tooltip>
                  </Space>
                }
              >
                <Paragraph style={{ lineHeight: 1.6 }}>
                  {result.summary}
                </Paragraph>
              </Card>
            )}

            {/* Key Points */}
            {result && extractKeyPoints && (
              <Card title="Key Points" size="small">
                <List
                  dataSource={result.keyPoints}
                  renderItem={(point) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<BulbOutlined style={{ color: '#faad14' }} />}
                        description={point}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* Actions */}
            {result && (
              <Card size="small">
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={exportSummary}
                  >
                    Export Summary
                  </Button>
                  <Button
                    icon={<ShareAltOutlined />}
                    onClick={() => copyToClipboard(result.summary)}
                  >
                    Share Summary
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setResult(null);
                      setDocument('');
                    }}
                  >
                    Clear
                  </Button>
                </Space>
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      {/* Summary History */}
      {summaryHistory.length > 0 && (
        <Card title="Summary History" style={{ marginTop: '24px' }}>
          <List
            dataSource={summaryHistory}
            renderItem={(summary) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<SummarizeOutlined />}
                  title={
                    <Space>
                      <Text>{summary.title}</Text>
                      <Tag color="blue">{summary.compressionRatio.toFixed(1)}% compressed</Tag>
                      <Tag color="green">{summary.tone}</Tag>
                    </Space>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(summary.timestamp).toLocaleString()}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default AIDocumentSummarizer;
