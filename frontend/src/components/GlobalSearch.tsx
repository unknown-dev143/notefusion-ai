import React, { useState, useEffect } from 'react';
import { Input, Card, List, Typography, Tag, Button, Space } from 'antd';
import { SearchOutlined, FileTextOutlined, BookOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Text, Title } = Typography;

interface SearchResult {
  id: string;
  type: 'note' | 'flashcard' | 'task';
  title: string;
  content: string;
  url: string;
  tags?: string[];
  createdAt: string;
}

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate search API call
    const timer = setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'note',
          title: 'Physics Lecture Notes',
          content: 'Quantum mechanics principles and wave functions...',
          url: '/notes',
          tags: ['physics', 'quantum'],
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          type: 'flashcard',
          title: 'Biology Chapter 5',
          content: 'Cell division and mitosis process...',
          url: '/flashcards',
          tags: ['biology', 'cells'],
          createdAt: '2024-01-14'
        },
        {
          id: '3',
          type: 'task',
          title: 'Review lecture notes',
          content: 'Go through today\'s physics lecture and summarize...',
          url: '/tasks',
          tags: ['study', 'urgent'],
          createdAt: '2024-01-13'
        }
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.content.toLowerCase().includes(query.toLowerCase()) ||
        result.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      
      setResults(mockResults);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'note': return <FileTextOutlined />;
      case 'flashcard': return <BookOutlined />;
      case 'task': return <CheckSquareOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'note': return 'blue';
      case 'flashcard': return 'green';
      case 'task': return 'orange';
      default: return 'default';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <Search
        placeholder="Search notes, flashcards, tasks..."
        allowClear
        enterButton={<SearchOutlined />}
        size="large"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        loading={loading}
        style={{ marginBottom: '1rem' }}
      />

      {results.length > 0 && (
        <Card title={`Found ${results.length} results`} size="small">
          <List
            dataSource={results}
            renderItem={(result) => (
              <List.Item
                style={{ cursor: 'pointer', padding: '0.75rem' }}
                onClick={() => handleResultClick(result)}
              >
                <List.Item.Meta
                  avatar={getIcon(result.type)}
                  title={
                    <Space>
                      <Text strong>{result.title}</Text>
                      <Tag color={getTypeColor(result.type)} size="small">
                        {result.type}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">{result.content}</Text>
                      <br />
                      <Space style={{ marginTop: '0.5rem' }}>
                        {result.tags?.map(tag => (
                          <Tag key={tag} size="small">{tag}</Tag>
                        ))}
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {result.createdAt}
                        </Text>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {query.length >= 2 && results.length === 0 && !loading && (
        <Card size="small">
          <Text type="secondary">No results found for "{query}"</Text>
        </Card>
      )}
    </div>
  );
};
