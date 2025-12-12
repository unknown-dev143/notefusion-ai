import React, { useState } from 'react';
import { Card, Input, Space, Select, DatePicker, Tag, List, Typography, Row, Col, Checkbox, Rate, message } from 'antd';
import { SearchOutlined, FilterOutlined, CalendarOutlined, StarOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'flashcard' | 'mindmap' | 'document';
  author: string;
  createdAt: string;
  tags: string[];
  rating?: number;
  relevance: number;
}

const AdvancedSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'notes' | 'flashcards' | 'mindmaps' | 'documents'>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [author, setAuthor] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const availableTags = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Literature', 'Geography', 'Psychology', 'Economics',
    'Study Notes', 'Exam Prep', 'Assignment', 'Research', 'Summary'
  ];

  const sampleResults: SearchResult[] = [
    {
      id: '1',
      title: 'Calculus Derivatives Study Guide',
      content: 'Comprehensive guide to differentiation rules and applications...',
      type: 'note',
      author: 'Alice Chen',
      createdAt: '2024-01-15T10:30:00',
      tags: ['Mathematics', 'Study Notes'],
      rating: 4.5,
      relevance: 95
    }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      message.warning('Please enter a search query');
      return;
    }

    setIsSearching(true);
    
    setTimeout(() => {
      setSearchResults(sampleResults);
      setIsSearching(false);
      message.success(`Found ${sampleResults.length} results`);
    }, 1000);
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileTextOutlined />;
      case 'flashcard': return <StarOutlined />;
      case 'mindmap': return <UserOutlined />;
      case 'document': return <FileTextOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'blue';
      case 'flashcard': return 'green';
      case 'mindmap': return 'purple';
      case 'document': return 'orange';
      default: return 'default';
    }
  };

  return (
    <Card title="Advanced Search" extra={<SearchOutlined />}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Search
              placeholder="Search across all content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              loading={isSearching}
              enterButton
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              value={searchType}
              onChange={setSearchType}
              style={{ width: '100%' }}
              placeholder="Content Type"
            >
              <Select.Option value="all">All Content</Select.Option>
              <Select.Option value="notes">Notes Only</Select.Option>
              <Select.Option value="flashcards">Flashcards Only</Select.Option>
              <Select.Option value="mindmaps">Mind Maps Only</Select.Option>
              <Select.Option value="documents">Documents Only</Select.Option>
            </Select>
          </Col>
        </Row>

        <Card size="small" title="Filters" extra={<FilterOutlined />}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text strong>Date Range:</Text>
              <RangePicker 
                style={{ width: '100%', marginTop: 8 }}
                onChange={() => {}}
              />
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Author:</Text>
              <Input
                placeholder="Search by author..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Minimum Rating:</Text>
              <div style={{ marginTop: 8 }}>
                <Rate
                  value={minRating}
                  onChange={setMinRating}
                />
                <Text style={{ marginLeft: 8 }}>
                  {minRating > 0 ? `${minRating}+ stars` : 'Any rating'}
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Tags:</Text>
              <div style={{ marginTop: 8, maxHeight: 100, overflowY: 'auto' }}>
                <Space wrap>
                  {availableTags.map(tag => (
                    <Checkbox
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onChange={(e) => handleTagChange(tag, e.target.checked)}
                    >
                      {tag}
                    </Checkbox>
                  ))}
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {searchResults.length > 0 && (
          <Card size="small" title={`Results (${searchResults.length})`}>
            <List
              dataSource={searchResults}
              renderItem={(result) => (
                <List.Item
                  key={result.id}
                  style={{ 
                    padding: 16,
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    marginBottom: 8
                  }}
                >
                  <List.Item.Meta
                    avatar={getTypeIcon(result.type)}
                    title={
                      <Space>
                        <Text strong>{result.title}</Text>
                        <Tag color={getTypeColor(result.type)}>{result.type}</Tag>
                        <Tag color="blue">{result.relevance}% match</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>{result.content}</Text>
                        <Space wrap>
                          {result.tags.map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </Space>
                        <Space split={<span>•</span>}>
                          <Text type="secondary">By {result.author}</Text>
                          <Text type="secondary">
                            <CalendarOutlined /> {new Date(result.createdAt).toLocaleDateString()}
                          </Text>
                          {result.rating && (
                            <Text type="secondary">
                              <StarOutlined style={{ color: '#faad14' }} /> {result.rating}
                            </Text>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default AdvancedSearch;
