import React, { useState } from 'react';
import { Card, Typography, Button, Space, Input, Select, Tabs, List, Tag, Progress, Modal, Table, Badge, Tooltip } from 'antd';
import { 
  SearchOutlined,
  BookOutlined,
  FileTextOutlined,
  BulbOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RobotOutlined,
  GlobalOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  journal: string;
  doi: string;
  citations: number;
  relevanceScore: number;
  url: string;
  summary?: string;
}

interface Citation {
  id: string;
  type: 'APA' | 'MLA' | 'Chicago' | 'Harvard';
  format: string;
  paper: ResearchPaper;
}

const AIResearchAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ResearchPaper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<ResearchPaper[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [citationStyle, setCitationStyle] = useState<'APA' | 'MLA' | 'Chicago' | 'Harvard'>('APA');
  const [generatedCitations, setGeneratedCitations] = useState<Citation[]>([]);
  const [plagiarismResults, setPlagiarismResults] = useState<any>(null);
  const [literatureReview, setLiteratureReview] = useState('');
  const [researchSummary, setResearchSummary] = useState('');

  // Mock data
  const mockPapers: ResearchPaper[] = [
    {
      id: '1',
      title: 'Machine Learning Applications in Healthcare: A Comprehensive Review',
      authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen'],
      abstract: 'This paper explores the various applications of machine learning in healthcare...',
      year: 2023,
      journal: 'Journal of Medical AI',
      doi: '10.1234/jmedai.2023.001',
      citations: 45,
      relevanceScore: 0.95,
      url: 'https://example.com/paper1',
      summary: 'Comprehensive overview of ML applications in healthcare diagnosis and treatment.'
    },
    {
      id: '2',
      title: 'Deep Learning for Natural Language Processing: Recent Advances',
      authors: ['Dr. Emily Rodriguez', 'Dr. James Wilson'],
      abstract: 'Recent advances in deep learning have revolutionized NLP...',
      year: 2023,
      journal: 'AI Transactions',
      doi: '10.1234/aitrans.2023.002',
      citations: 78,
      relevanceScore: 0.88,
      url: 'https://example.com/paper2'
    }
  ];

  const handleSearch = () => {
    setIsSearching(true);
    // Mock search
    setTimeout(() => {
      setSearchResults(mockPapers);
      setIsSearching(false);
    }, 2000);
  };

  const handleSelectPaper = (paper: ResearchPaper) => {
    if (!selectedPapers.find(p => p.id === paper.id)) {
      setSelectedPapers([...selectedPapers, paper]);
    }
  };

  const generateCitations = () => {
    const citations: Citation[] = selectedPapers.map(paper => ({
      id: Date.now().toString() + paper.id,
      type: citationStyle,
      format: generateCitationFormat(paper, citationStyle),
      paper
    }));
    setGeneratedCitations(citations);
  };

  const generateCitationFormat = (paper: ResearchPaper, style: string): string => {
    switch (style) {
      case 'APA':
        return `${paper.authors.join(', ')} (${paper.year}). ${paper.title}. ${paper.journal}.`;
      case 'MLA':
        return `${paper.authors[0]}, et al. "${paper.title}." ${paper.journal}, ${paper.year}.`;
      case 'Chicago':
        return `${paper.authors[0]}. "${paper.title}." ${paper.journal} ${paper.year}.`;
      case 'Harvard':
        return `${paper.authors[0]} (${paper.year}) ${paper.title}, ${paper.journal}.`;
      default:
        return paper.title;
    }
  };

  const checkPlagiarism = () => {
    // Mock plagiarism check
    setPlagiarismResults({
      score: 0.12,
      sources: [
        { title: 'Source 1', similarity: 0.08 },
        { title: 'Source 2', similarity: 0.04 }
      ],
      status: 'low'
    });
  };

  const generateLiteratureReview = () => {
    const review = `
# Literature Review: ${searchQuery}

## Introduction
This literature review examines the current state of research on ${searchQuery}. 
The analysis covers recent developments, key findings, and future directions.

## Key Themes
1. **Theme 1**: Recent advances in ${searchQuery}
2. **Theme 2**: Applications and implications
3. **Theme 3**: Future research directions

## Major Findings
Based on the analysis of ${selectedPapers.length} selected papers, several key findings emerge...

## Conclusion
The literature suggests that ${searchQuery} is a rapidly evolving field with significant potential...
    `;
    setLiteratureReview(review);
  };

  const generateResearchSummary = () => {
    const summary = `
# Research Summary: ${searchQuery}

## Executive Summary
This research analyzed ${searchResults.length} papers on ${searchQuery}, 
revealing important insights and trends.

## Key Insights
- **Finding 1**: Most significant discovery in the field
- **Finding 2**: Emerging trends and patterns
- **Finding 3**: Gaps in current research

## Recommendations
Based on the analysis, the following recommendations are proposed...

## Future Directions
Potential areas for future research include...
    `;
    setResearchSummary(summary);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: ResearchPaper) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary">{record.authors.join(', ')}</Text>
        </div>
      )
    },
    {
      title: 'Journal',
      dataIndex: 'journal',
      key: 'journal'
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year'
    },
    {
      title: 'Citations',
      dataIndex: 'citations',
      key: 'citations'
    },
    {
      title: 'Relevance',
      dataIndex: 'relevanceScore',
      key: 'relevanceScore',
      render: (score: number) => (
        <Progress percent={Math.round(score * 100)} size="small" />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: ResearchPaper) => (
        <Space>
          <Button size="small" onClick={() => handleSelectPaper(record)}>
            Select
          </Button>
          <Button size="small" icon={<DownloadOutlined />} />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <Space>
          <RobotOutlined />
          AI Research Assistant
        </Space>
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Research Search" key="search">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Input.Search
                  placeholder="Enter research topic or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onSearch={handleSearch}
                  loading={isSearching}
                  enterButton={<SearchOutlined />}
                />
              </div>

              {searchResults.length > 0 && (
                <Table
                  dataSource={searchResults}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              )}
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Citation Generator" key="citations">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Citation Style:</Text>
                <Select
                  value={citationStyle}
                  onChange={setCitationStyle}
                  style={{ marginLeft: '8px' }}
                >
                  <Option value="APA">APA</Option>
                  <Option value="MLA">MLA</Option>
                  <Option value="Chicago">Chicago</Option>
                  <Option value="Harvard">Harvard</Option>
                </Select>
                <Button
                  type="primary"
                  onClick={generateCitations}
                  disabled={selectedPapers.length === 0}
                  style={{ marginLeft: '8px' }}
                >
                  Generate Citations
                </Button>
              </div>

              {selectedPapers.length > 0 && (
                <div>
                  <Text strong>Selected Papers ({selectedPapers.length})</Text>
                  <List
                    dataSource={selectedPapers}
                    renderItem={(paper) => (
                      <List.Item>
                        <Space>
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          <Text>{paper.title}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              )}

              {generatedCitations.length > 0 && (
                <div>
                  <Text strong>Generated Citations</Text>
                  {generatedCitations.map((citation) => (
                    <Card key={citation.id} size="small" style={{ marginBottom: '8px' }}>
                      <Text>{citation.format}</Text>
                    </Card>
                  ))}
                </div>
              )}
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Plagiarism Checker" key="plagiarism">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <TextArea
                  placeholder="Paste your text to check for plagiarism..."
                  rows={8}
                />
                <Button
                  type="primary"
                  onClick={checkPlagiarism}
                  style={{ marginTop: '8px' }}
                >
                  Check Plagiarism
                </Button>
              </div>

              {plagiarismResults && (
                <div>
                  <Title level={4}>Plagiarism Results</Title>
                  <Progress
                    percent={Math.round(plagiarismResults.score * 100)}
                    status={plagiarismResults.status === 'low' ? 'success' : 'exception'}
                  />
                  <Text>Similarity Score: {(plagiarismResults.score * 100).toFixed(1)}%</Text>
                </div>
              )}
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Literature Review" key="review">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                onClick={generateLiteratureReview}
                disabled={selectedPapers.length === 0}
              >
                Generate Literature Review
              </Button>

              {literatureReview && (
                <div>
                  <Title level={4}>Generated Literature Review</Title>
                  <Paragraph style={{ whiteSpace: 'pre-line' }}>
                    {literatureReview}
                  </Paragraph>
                </div>
              )}
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Research Summary" key="summary">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                onClick={generateResearchSummary}
                disabled={searchResults.length === 0}
              >
                Generate Research Summary
              </Button>

              {researchSummary && (
                <div>
                  <Title level={4}>Research Summary</Title>
                  <Paragraph style={{ whiteSpace: 'pre-line' }}>
                    {researchSummary}
                  </Paragraph>
                </div>
              )}
            </Space>
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AIResearchAssistant;
