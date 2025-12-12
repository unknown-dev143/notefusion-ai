import React, { useState, useEffect } from 'react';
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
  Progress,
} from 'antd';
import {
  HeartOutlined,
  SmileOutlined,
  FrownOutlined,
  MehOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface SentimentResult {
  overall: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
  keywords: Array<{
    word: string;
    sentiment: string;
    confidence: number;
  }>;
  sentences: Array<{
    text: string;
    sentiment: string;
    confidence: number;
  }>;
}

const AISentimentAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [analysisHistory] = useState<any[]>([]);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(false);
  const [showEmotions, setShowEmotions] = useState(true);
  const [analysisMode, setAnalysisMode] = useState<'quick' | 'detailed'>('quick');

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      message.warning('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI sentiment analysis
    setTimeout(() => {
      const mockResult: SentimentResult = {
        overall: text.toLowerCase().includes('good') || text.toLowerCase().includes('great') ? 'positive' : 
                text.toLowerCase().includes('bad') || text.toLowerCase().includes('terrible') ? 'negative' : 'neutral',
        confidence: 85 + Math.random() * 10,
        emotions: {
          joy: Math.random() * 100,
          anger: Math.random() * 30,
          fear: Math.random() * 20,
          sadness: Math.random() * 40,
          surprise: Math.random() * 60,
          disgust: Math.random() * 15,
        },
        keywords: [
          { word: 'excellent', sentiment: 'positive', confidence: 95 },
          { word: 'problem', sentiment: 'negative', confidence: 88 },
          { word: 'amazing', sentiment: 'positive', confidence: 92 },
          { word: 'issue', sentiment: 'negative', confidence: 85 },
        ],
        sentences: text.split('.').filter(s => s.trim()).map((sentence, index) => ({
          text: sentence.trim(),
          sentiment: index % 3 === 0 ? 'positive' : index % 3 === 1 ? 'negative' : 'neutral',
          confidence: 80 + Math.random() * 15,
        })),
      };

      setResult(mockResult);
      setIsAnalyzing(false);
      
      message.success('Sentiment analysis completed!');
    }, 1500);
  };

  useEffect(() => {
    if (realTimeAnalysis && text.length > 10) {
      const timer = setTimeout(() => {
        analyzeSentiment();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [text, realTimeAnalysis]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <SmileOutlined style={{ color: '#52c41a' }} />;
      case 'negative': return <FrownOutlined style={{ color: '#ff4d4f' }} />;
      case 'neutral': return <MehOutlined style={{ color: '#1890ff' }} />;
      default: return <MehOutlined />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#52c41a';
      case 'negative': return '#ff4d4f';
      case 'neutral': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  const exportReport = () => {
    if (!result) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      text,
      result,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    message.success('Analysis report exported');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <HeartOutlined />
                <span>Text Input</span>
              </Space>
            }
            extra={
              <Space>
                <Select
                  value={analysisMode}
                  onChange={setAnalysisMode}
                  style={{ width: 100 }}
                >
                  <Select.Option value="quick">Quick</Select.Option>
                  <Select.Option value="detailed">Detailed</Select.Option>
                </Select>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                placeholder="Enter text to analyze sentiment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
              />
              <Space>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  loading={isAnalyzing}
                  onClick={analyzeSentiment}
                  disabled={!text.trim()}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Sentiment'}
                </Button>
                <Upload
                  accept=".txt,.csv,.json"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setText(e.target?.result as string);
                    };
                    reader.readAsText(file);
                    return false;
                  }}
                >
                  <Button icon={<FileTextOutlined />}>Upload File</Button>
                </Upload>
              </Space>
              <div>
                <Text>Real-time analysis:</Text>
                <Switch checked={realTimeAnalysis} onChange={setRealTimeAnalysis} />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* Overall Sentiment */}
            {result && (
              <Card title="Overall Sentiment" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    {getSentimentIcon(result.overall)}
                    <Title level={3} style={{ color: getSentimentColor(result.overall), margin: '8px 0' }}>
                      {result.overall.toUpperCase()}
                    </Title>
                    <Progress
                      percent={result.confidence}
                      status="active"
                      strokeColor={getSentimentColor(result.overall)}
                    />
                    <Text type="secondary">Confidence: {result.confidence.toFixed(1)}%</Text>
                  </div>
                </Space>
              </Card>
            )}

            {/* Emotions Analysis */}
            {result && showEmotions && (
              <Card title="Emotions Analysis" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {Object.entries(result.emotions).map(([emotion, value]) => (
                    <div key={emotion}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Text style={{ textTransform: 'capitalize' }}>{emotion}</Text>
                        <Text>{value.toFixed(1)}%</Text>
                      </div>
                      <Progress
                        percent={value}
                        size="small"
                        strokeColor={
                          emotion === 'joy' ? '#52c41a' :
                          emotion === 'anger' ? '#ff4d4f' :
                          emotion === 'fear' ? '#722ed1' :
                          emotion === 'sadness' ? '#1890ff' :
                          emotion === 'surprise' ? '#faad14' :
                          '#eb2f96'
                        }
                      />
                    </div>
                  ))}
                </Space>
              </Card>
            )}

            {/* Keywords */}
            {result && (
              <Card title="Sentiment Keywords" size="small">
                <Space wrap>
                  {result.keywords.map((keyword, index) => (
                    <Tag
                      key={index}
                      color={
                        keyword.sentiment === 'positive' ? 'green' :
                        keyword.sentiment === 'negative' ? 'red' : 'blue'
                      }
                    >
                      {keyword.word} ({keyword.confidence.toFixed(0)}%)
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}

            {/* Actions */}
            {result && (
              <Card size="small">
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={exportReport}
                  >
                    Export Report
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setResult(null);
                      setText('');
                    }}
                  >
                    Clear
                  </Button>
                  <div>
                    <Text>Show emotions:</Text>
                    <Switch checked={showEmotions} onChange={setShowEmotions} />
                  </div>
                </Space>
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      {/* Sentence Analysis */}
      {result && result.sentences.length > 0 && (
        <Card title="Sentence-by-Sentence Analysis" style={{ marginTop: '24px' }}>
          <List
            dataSource={result.sentences}
            renderItem={(sentence, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={getSentimentIcon(sentence.sentiment)}
                  title={
                    <Space>
                      <Text>Sentence {index + 1}</Text>
                      <Tag color={getSentimentColor(sentence.sentiment)}>
                        {sentence.sentiment}
                      </Tag>
                      <Text type="secondary">{sentence.confidence.toFixed(1)}%</Text>
                    </Space>
                  }
                  description={sentence.text}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card title="Analysis History" style={{ marginTop: '24px' }}>
          <List
            dataSource={analysisHistory}
            renderItem={(analysis) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<HeartOutlined />}
                  title={
                    <Space>
                      {getSentimentIcon(analysis.overall)}
                      <Text>{analysis.overall.toUpperCase()}</Text>
                      <Text type="secondary">({analysis.confidence.toFixed(1)}%)</Text>
                    </Space>
                  }
                  description={
                    <div>
                      <Text>{analysis.text}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(analysis.timestamp).toLocaleString()}
                      </Text>
                    </div>
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

export default AISentimentAnalyzer;
