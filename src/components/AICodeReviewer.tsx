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
  Tooltip,
  Statistic,
  Select,
} from 'antd';
import {
  CodeOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  SecurityScanOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'suggestion' | 'optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  line?: number;
  column?: number;
  code?: string;
  suggestion?: string;
  autoFixable: boolean;
}

interface CodeMetrics {
  complexity: number;
  maintainability: number;
  testCoverage: number;
  duplications: number;
  linesOfCode: number;
  technicalDebt: number;
}

const AICodeReviewer: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode] = useState<'quick' | 'detailed'>('quick');
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [metrics, setMetrics] = useState<CodeMetrics | null>(null);
  const [autoFix, setAutoFix] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [analysisHistory] = useState<any[]>([]);

  const analyzeCode = async () => {
    if (!code.trim()) {
      message.warning('Please enter some code to analyze');
      return;
    }

    setIsAnalyzing(true);
    setIssues([]);
    setMetrics(null);

    // Simulate AI code analysis
    setTimeout(() => {
      const mockIssues: CodeIssue[] = [
        {
          id: '1',
          type: 'error',
          severity: 'high',
          title: 'Potential Null Reference',
          description: 'Variable "user" may be null when accessing profile property',
          line: 15,
          column: 8,
          code: 'user.profile.name',
          suggestion: 'Add null check: if (user && user.profile)',
          autoFixable: true,
        },
        {
          id: '2',
          type: 'warning',
          severity: 'medium',
          title: 'Unused Variable',
          description: 'Variable "tempData" is declared but never used',
          line: 23,
          column: 12,
          code: 'const tempData = getData();',
          suggestion: 'Remove unused variable or use it in the code',
          autoFixable: true,
        },
        {
          id: '3',
          type: 'suggestion',
          severity: 'low',
          title: 'Performance Optimization',
          description: 'Consider using async/await instead of Promise chains',
          line: 45,
          column: 3,
          code: 'getData().then(process).then(save)',
          suggestion: 'Use async/await for better readability',
          autoFixable: false,
        },
      ];

      const mockMetrics: CodeMetrics = {
        complexity: 7.2,
        maintainability: 8.5,
        testCoverage: 65,
        duplications: 12,
        linesOfCode: 342,
        technicalDebt: 45,
      };

      setIssues(mockIssues);
      setMetrics(mockMetrics);
      setIsAnalyzing(false);
      
      message.success('Code analysis completed!');
    }, 2000);
  };

  const applyAutoFix = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue && issue.autoFixable) {
      message.success(`Auto-fix applied for: ${issue.title}`);
      setIssues(prev => prev.filter(i => i.id !== issueId));
    } else {
      message.info('This issue requires manual fixing');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <BugOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'suggestion': return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'optimization': return <ThunderboltOutlined style={{ color: '#52c41a' }} />;
      default: return <CodeOutlined />;
    }
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      language,
      metrics,
      issues,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-analysis-${Date.now()}.json`;
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
                <CodeOutlined />
                <span>Code Input</span>
              </Space>
            }
            extra={
              <Space>
                <Select
                  value={language}
                  onChange={setLanguage}
                  style={{ width: 120 }}
                >
                  <Select.Option value="javascript">JavaScript</Select.Option>
                  <Select.Option value="typescript">TypeScript</Select.Option>
                  <Select.Option value="python">Python</Select.Option>
                  <Select.Option value="java">Java</Select.Option>
                  <Select.Option value="cpp">C++</Select.Option>
                </Select>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                placeholder="Paste your code here for AI analysis..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                style={{ fontFamily: 'monospace' }}
              />
              <Space>
                <Button
                  type="primary"
                  icon={<SecurityScanOutlined />}
                  loading={isAnalyzing}
                  onClick={analyzeCode}
                  disabled={!code.trim()}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
                </Button>
                <Upload
                  accept=".js,.ts,.py,.java,.cpp,.c"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setCode(e.target?.result as string);
                    };
                    reader.readAsText(file);
                    return false;
                  }}
                >
                  <Button icon={<FileTextOutlined />}>Upload File</Button>
                </Upload>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* Analysis Settings */}
            <Card title="Analysis Settings" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Auto-fix issues:</Text>
                  <Switch checked={autoFix} onChange={setAutoFix} />
                </div>
                <div>
                  <Text>Show suggestions:</Text>
                  <Switch checked={showSuggestions} onChange={setShowSuggestions} />
                </div>
              </Space>
            </Card>

            {/* Code Metrics */}
            {metrics && (
              <Card title="Code Metrics" size="small">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Complexity"
                      value={metrics.complexity}
                      precision={1}
                      valueStyle={{ color: metrics.complexity > 10 ? '#ff4d4f' : '#3f8600' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Maintainability"
                      value={metrics.maintainability}
                      precision={1}
                      valueStyle={{ color: metrics.maintainability < 5 ? '#ff4d4f' : '#3f8600' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Test Coverage"
                      value={metrics.testCoverage}
                      suffix="%"
                      valueStyle={{ color: metrics.testCoverage < 50 ? '#ff4d4f' : '#3f8600' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Lines of Code"
                      value={metrics.linesOfCode}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                </Row>
              </Card>
            )}

            {/* Issues Found */}
            <Card
              title={
                <Space>
                  <BugOutlined />
                  <span>Issues Found</span>
                  <Badge count={issues.length} />
                </Space>
              }
              size="small"
              extra={
                <Space>
                  <Button
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={exportReport}
                    disabled={!issues.length}
                  >
                    Export
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    size="small"
                    onClick={() => setIssues([])}
                  >
                    Clear
                  </Button>
                </Space>
              }
            >
              <List
                dataSource={issues}
                renderItem={(issue) => (
                  <List.Item
                    actions={[
                      issue.autoFixable && (
                        <Tooltip title="Apply auto-fix">
                          <Button
                            type="text"
                            icon={<CheckCircleOutlined />}
                            onClick={() => applyAutoFix(issue.id)}
                            size="small"
                          />
                        </Tooltip>
                      ),
                    ]}
                  >
                    <List.Item.Meta
                      avatar={getTypeIcon(issue.type)}
                      title={
                        <Space>
                          <Text strong>{issue.title}</Text>
                          <Tag color={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Text type="secondary">{issue.description}</Text>
                          {issue.line && (
                            <div style={{ marginTop: '4px' }}>
                              <Text code>Line {issue.line}</Text>
                              {issue.column && <Text code>:{issue.column}</Text>}
                            </div>
                          )}
                          {showSuggestions && issue.suggestion && (
                            <Alert
                              message="Suggestion"
                              description={issue.suggestion}
                              type="info"
                              style={{ marginTop: '8px' }}
                            />
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No issues found. Great job!' }}
              />
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card title="Analysis History" style={{ marginTop: '24px' }}>
          <List
            dataSource={analysisHistory}
            renderItem={(analysis) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<CodeOutlined />}
                  title={`Analysis - ${new Date(analysis.timestamp).toLocaleString()}`}
                  description={
                    <Space>
                      <Text>Language: {analysis.language}</Text>
                      <Text>Issues: {analysis.issuesCount}</Text>
                      {analysis.metrics && (
                        <Text>Score: {((analysis.metrics.maintainability + analysis.metrics.testCoverage) / 2).toFixed(1)}</Text>
                      )}
                    </Space>
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

export default AICodeReviewer;
