import React, { useState, useEffect } from 'react';
import { Input, List, Typography, Card, Space, Button, DatePicker, Select, Empty } from 'antd';
import { SearchOutlined, AudioOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { audioService, AudioNote } from '../services/audioService';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import styles from './AudioNoteSearch.module.css';

const { Search } = Input;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface SearchResult {
  note: AudioNote;
  highlights: string[];
  score: number;
}

const AudioNoteSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    language: '',
    limit: 10,
    offset: 0,
  });

  // Debounced search function
  const debouncedSearch = React.useMemo(
    () =>
      debounce(async (searchQuery: string, params: any) => {
        if (!searchQuery.trim()) {
          setResults([]);
          setTotal(0);
          return;
        }

        try {
          setIsSearching(true);
          const { results: searchResults, total } = await audioService.searchNotes(searchQuery, params);
          setResults(searchResults);
          setTotal(total);
        } catch (error) {
          console.error('Error searching notes:', error);
        } finally {
          setIsSearching(false);
        }
      }, 500),
    []
  );

  // Handle search when query or params change
  useEffect(() => {
    debouncedSearch(query, searchParams);
    
    // Cleanup debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, searchParams, debouncedSearch]);

  const handleDateRangeChange = (dates: any) => {
    setSearchParams(prev => ({
      ...prev,
      startDate: dates?.[0] ? dates[0].format('YYYY-MM-DD') : '',
      endDate: dates?.[1] ? dates[1].format('YYYY-MM-DD') : '',
    }));
  };

  const handleLanguageChange = (language: string) => {
    setSearchParams(prev => ({
      ...prev,
      language,
    }));
  };

  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights || highlights.length === 0) return text;
    
    let highlighted = text;
    const highlightMap = new Map();
    
    // Create a map of positions to highlight
    highlights.forEach(hl => {
      const match = hl.match(/<em>(.*?)<\/em>/);
      if (match) {
        const original = match[1];
        const highlightedText = `<mark>${original}</mark>`;
        highlightMap.set(original, highlightedText);
      }
    });
    
    // Replace all occurrences
    highlightMap.forEach((value, key) => {
      const regex = new RegExp(key, 'gi');
      highlighted = highlighted.replace(regex, value);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="audio-note-search">
      <Card 
        title={
          <Title level={4} style={{ margin: 0 }}>
            <AudioOutlined /> Search Audio Notes
          </Title>
        }
        bordered={false}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Search
            placeholder="Search in transcriptions..."
            allowClear
            enterButton={
              <Button type="primary" icon={<SearchOutlined />} loading={isSearching}>
                Search
              </Button>
            }
            size="large"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            loading={isSearching}
          />
          
          <Space size="middle">
            <RangePicker 
              onChange={handleDateRangeChange} 
              style={{ width: 300 }}
              placeholder={['Start Date', 'End Date']}
            />
            
            <Select
              placeholder="Filter by language"
              style={{ width: 200 }}
              allowClear
              onChange={handleLanguageChange}
            >
              <Option value="en">English</Option>
              <Option value="es">Spanish</Option>
              <Option value="fr">French</Option>
              <Option value="de">German</Option>
              <Option value="it">Italian</Option>
              <Option value="zh">Chinese</Option>
              <Option value="ja">Japanese</Option>
              <Option value="ko">Korean</Option>
            </Select>
          </Space>
          
          <div className="search-results">
            {query && (
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Found {total} {total === 1 ? 'result' : 'results'} for "{query}"
              </Text>
            )}
            
            <List
              itemLayout="horizontal"
              dataSource={results}
              locale={{
                emptyText: query ? (
                  <Empty description="No matching notes found" />
                ) : (
                  <Empty description="Enter a search term to find audio notes" />
                ),
              }}
              renderItem={(result) => (
                <List.Item
                  key={result.note.id}
                  actions={[
                    <Button 
                      type="text" 
                      icon={<PlayCircleOutlined />} 
                      onClick={() => {
                        const audio = new Audio(result.note.url);
                        audio.play();
                      }}
                    >
                      Play
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Text strong>{result.note.title}</Text>
                    }
                    description={
                      <div>
                        <Text type="secondary" className={styles['dateText'] || ''}>
                          {dayjs(result.note.createdAt).format('MMM D, YYYY')}
                        </Text>
                        <Text type="secondary" className={styles['durationText'] || ''}>
                          {Math.round(result.note.duration / 60)} min
                        </Text>
                        <div className={styles['highlightContainer']}>
                          {highlightText(result.note.transcription || '', result.highlights)}
                        </div>
                        {result.score && (
                          <div className={styles['relevanceContainer']}>
                            <Text type="secondary" className={styles['relevanceText'] || ''}>
                              Relevance: {Math.round(result.score * 100)}%
                            </Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AudioNoteSearch;
