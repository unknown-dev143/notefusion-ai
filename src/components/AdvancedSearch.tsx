import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Input, Button, Space, Select, DatePicker, Tag, List, Modal, Checkbox, Rate } from 'antd';
import { 
  BookOutlined, 
  FileTextOutlined, 
  AudioOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  SearchOutlined,
  BulbOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import './AdvancedSearch.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

interface SearchResult {
  id: string;
  type: 'note' | 'transcript' | 'flashcard' | 'pdf' | 'session';
  title: string;
  content: string;
  relevance: number;
  highlights: string[];
  metadata: {
    moduleCode?: string;
    date?: string;
    author?: string;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    rating?: number;
    duration?: number;
    pageCount?: number;
  };
}

interface SearchFilters {
  types: string[];
  modules: string[];
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | undefined;
  tags: string[];
  difficulty: string[];
  rating?: number;
  hasTranscript?: boolean;
  hasFlashcards?: boolean;
}

const AdvancedSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    modules: [],
    tags: [],
    difficulty: [],
    hasTranscript: false,
    hasFlashcards: false
  });

  const [searchHistory, setSearchHistory] = useState<string[]>([
    'machine learning',
    'neural networks',
    'study notes',
    'exam preparation'
  ]);

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // AI-powered search suggestions
  const generateAISuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setAiSuggestions([]);
      setShowAiSuggestions(false);
      return;
    }

    setAiLoading(true);
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockSuggestions = [
        `${query} fundamentals`,
        `advanced ${query} techniques`,
        `${query} best practices`,
        `${query} tutorial`,
        `${query} examples`
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase()) &&
        !searchHistory.includes(suggestion)
      );

      setAiSuggestions(mockSuggestions.slice(0, 5));
      setShowAiSuggestions(mockSuggestions.length > 0);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setAiLoading(false);
    }
  }, [searchHistory]);

  // Debounced AI suggestions
  const debouncedAISuggestions = useMemo(
    () => debounce(generateAISuggestions, 500),
    [generateAISuggestions]
  );

  // Real search implementation
  const calculateRelevance = (query: string, title: string, content: string): number => {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    const queryWords = query.split(' ').filter(word => word.length > 2);
    
    let relevance = 0;
    queryWords.forEach(word => {
      if (titleLower.includes(word)) relevance += 0.3;
      if (contentLower.includes(word)) relevance += 0.1;
    });
    
    // Boost exact matches
    if (titleLower === query) relevance += 0.5;
    if (contentLower.includes(query)) relevance += 0.2;
    
    return Math.min(relevance, 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedAISuggestions(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowAiSuggestions(false);
    performSearch();
  };

  const extractHighlights = (query: string, text: string): string[] => {
    const words = query.toLowerCase().split(' ').filter(word => word.length > 2);
    const highlights: string[] = [];
    
    words.forEach(word => {
      if (text.toLowerCase().includes(word) && !highlights.includes(word)) {
        highlights.push(word);
      }
    });
    
    return highlights.slice(0, 5); // Limit to 5 highlights
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    // Add to search history
    if (!searchHistory.includes(searchQuery)) {
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
    }
    
    // Hide AI suggestions when searching
    setShowAiSuggestions(false);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results: SearchResult[] = [];
      const query = searchQuery.toLowerCase();
      
      // Search through notes from localStorage
      const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      savedNotes.forEach((note: any, index: number) => {
        const relevance = calculateRelevance(query, note.title, note.content);
        if (relevance > 0.3) {
          results.push({
            id: note.id || `note-${index}`,
            type: 'note',
            title: note.title,
            content: note.content,
            relevance,
            highlights: extractHighlights(query, note.title + ' ' + note.content),
            metadata: {
              moduleCode: note.moduleCode || '',
              date: note.createdAt || new Date().toISOString(),
              author: note.author || 'User',
              tags: note.tags || [],
              rating: note.rating || 0
            }
          });
        }
      });
      
      // Search through bookmarks
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      bookmarks.forEach((bookmark: any, index: number) => {
        const relevance = calculateRelevance(query, bookmark.title, bookmark.description);
        if (relevance > 0.3) {
          results.push({
            id: bookmark.id || `bookmark-${index}`,
            type: 'note', // Map bookmark to note type for compatibility
            title: bookmark.title,
            content: bookmark.description,
            relevance,
            highlights: extractHighlights(query, bookmark.title + ' ' + bookmark.description),
            metadata: {
              moduleCode: '',
              date: bookmark.createdAt || new Date().toISOString(),
              author: 'User',
              tags: bookmark.tags || [],
              rating: bookmark.rating || 0
            }
          });
        }
      });
      
      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);
      setSearchResults(results.slice(0, 20)); // Limit to 20 results
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Add to search history
      setSearchHistory(prev => {
        const updated = [searchQuery, ...prev.filter(q => q !== searchQuery)];
        return updated.slice(0, 10); // Keep only last 10 searches
      });
    }
    performSearch();
  };

  const typeIcons = {
    note: <FileTextOutlined />,
    transcript: <AudioOutlined />,
    flashcard: <QuestionCircleOutlined />,
    pdf: <BookOutlined />,
    session: <CalendarOutlined />
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      modules: [],
      tags: [],
      difficulty: [],
      hasTranscript: false,
      hasFlashcards: false
    });
  };

  const viewResultDetail = (result: SearchResult) => {
    setSelectedResult(result);
    setDetailModalVisible(true);
  };

  const highlightText = (text: string, highlights: string[]) => {
    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Advanced Search</Title>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            placeholder="Search notes, transcripts, flashcards, PDFs, and sessions..."
            value={searchQuery}
            onChange={handleInputChange}
            onSearch={handleSearch}
            loading={loading}
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                Search
              </Button>
            }
            size="large"
            suffix={
              aiLoading && <ThunderboltOutlined spin style={{ color: '#1890ff' }} />
            }
          />
          
          {/* AI Suggestions Dropdown */}
          {showAiSuggestions && aiSuggestions.length > 0 && (
            <div className="ai-suggestions-dropdown">
              <div className="ai-suggestions-header">
                <BulbOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                <Text strong>AI Suggestions</Text>
              </div>
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="ai-suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <ThunderboltOutlined style={{ color: '#faad14', marginRight: 8 }} />
                  <Text>{suggestion}</Text>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div>
            <Text strong>Recent Searches:</Text>
            <Space wrap style={{ marginTop: 8 }}>
              {searchHistory.map((query, index) => (
                <Tag 
                  key={index} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSearchQuery(query);
                    performSearch();
                  }}
                >
                  {query}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Filters Toggle */}
        <Button 
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          {filtersVisible ? 'Hide Filters' : 'Show Filters'}
        </Button>

        {/* Filters Panel */}
        {filtersVisible && (
          <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Content Type Filter */}
              <div>
                <Text strong>Content Type:</Text>
                <Checkbox.Group
                  value={filters.types}
                  onChange={(values) => setFilters(prev => ({ ...prev, types: values as string[] }))}
                  style={{ marginTop: 8 }}
                >
                  <Space direction="vertical">
                    <Checkbox value="note">Notes</Checkbox>
                    <Checkbox value="transcript">Transcripts</Checkbox>
                    <Checkbox value="flashcard">Flashcards</Checkbox>
                    <Checkbox value="pdf">PDF Documents</Checkbox>
                    <Checkbox value="session">Study Sessions</Checkbox>
                  </Space>
                </Checkbox.Group>
              </div>

              {/* Module Filter */}
              <div>
                <Text strong>Module:</Text>
                <Select
                  placeholder="Select module"
                  value={filters.modules[0]}
                  onChange={(value) => setFilters(prev => ({ ...prev, modules: value ? [value] : [] }))}
                  style={{ width: '100%', marginTop: 8 }}
                  allowClear
                >
                  <Option value="CS301">CS301 - Machine Learning</Option>
                  <Option value="CS302">CS302 - AI Ethics</Option>
                  <Option value="CS303">CS303 - Deep Learning</Option>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <Text strong>Date Range:</Text>
                <DatePicker.RangePicker
                  value={filters.dateRange}
                  onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates && dates.length === 2 && dates[0] && dates[1] ? [dates[0], dates[1]] : undefined }))}
                  style={{ width: '100%', marginTop: 8 }}
                />
              </div>

              {/* Additional Filters */}
              <div>
                <Checkbox
                  checked={filters.hasTranscript}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasTranscript: e.target.checked }))}
                >
                  Has Transcript
                </Checkbox>
                <Checkbox
                  checked={filters.hasFlashcards}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasFlashcards: e.target.checked }))}
                >
                  Has Flashcards
                </Checkbox>
              </div>

              <Button onClick={clearFilters}>Clear Filters</Button>
            </Space>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <Title level={4}>Search Results ({searchResults.length})</Title>
            <List
              dataSource={searchResults}
              renderItem={(result) => (
                <List.Item
                  actions={[
                    <Button 
                      type="link"
                      onClick={() => viewResultDetail(result)}
                    >
                      View Details
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={typeIcons[result.type]}
                    title={
                      <Space>
                        {result.title}
                        <Tag color="blue">{result.type}</Tag>
                        <Tag color="green">{Math.round(result.relevance * 100)}% match</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Text ellipsis>
                          {highlightText(result.content, result.highlights)}
                        </Text>
                        <Space wrap>
                          {result.metadata.moduleCode && (
                            <Tag color="blue">{result.metadata.moduleCode}</Tag>
                          )}
                          {result.metadata.date && (
                            <Tag color="default">
                              {new Date(result.metadata.date).toLocaleDateString()}
                            </Tag>
                          )}
                          {result.metadata.tags?.map((tag, index) => (
                            <Tag key={index}>{tag}</Tag>
                          ))}
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {/* Result Detail Modal */}
        <Modal
          title={selectedResult?.title}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedResult && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Content:</Text>
                <Paragraph style={{ marginTop: 8 }}>
                  {highlightText(selectedResult.content, selectedResult.highlights)}
                </Paragraph>
              </div>
              
              <div>
                <Text strong>Metadata:</Text>
                <Space direction="vertical" style={{ marginTop: 8 }}>
                  {selectedResult.metadata.moduleCode && (
                    <Text>Module: {selectedResult.metadata.moduleCode}</Text>
                  )}
                  {selectedResult.metadata.date && (
                    <Text>Date: {new Date(selectedResult.metadata.date).toLocaleString()}</Text>
                  )}
                  {selectedResult.metadata.author && (
                    <Text>Author: {selectedResult.metadata.author}</Text>
                  )}
                  {selectedResult.metadata.difficulty && (
                    <Text>Difficulty: {selectedResult.metadata.difficulty}</Text>
                  )}
                  {selectedResult.metadata.rating && (
                    <Space>
                      <Text>Rating:</Text>
                      <Rate disabled value={selectedResult.metadata.rating} />
                    </Space>
                  )}
                  {selectedResult.metadata.duration && (
                    <Text>Duration: {selectedResult.metadata.duration} minutes</Text>
                  )}
                  {selectedResult.metadata.pageCount && (
                    <Text>Pages: {selectedResult.metadata.pageCount}</Text>
                  )}
                </Space>
              </div>
              
              {selectedResult.metadata.tags && (
                <div>
                  <Text strong>Tags:</Text>
                  <Space wrap style={{ marginTop: 8 }}>
                    {selectedResult.metadata.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </Space>
                </div>
              )}
            </Space>
          )}
        </Modal>
      </Space>
    </div>
  );
};

export default AdvancedSearch;
