import React, { useState, useEffect } from 'react';
import { Card, List, Button, Space, Typography, Tooltip, message } from 'antd';
import { BulbOutlined, CheckOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import AIService, { AISuggestion } from '../../services/ai/AIService';

const { Text } = Typography;

interface AISuggestionsProps {
  noteId: string;
  content: string;
  onApplySuggestion: (suggestion: string) => void;
  disabled?: boolean;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  noteId,
  content,
  onApplySuggestion,
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    if (!content.trim() || disabled) return;
    
    setLoading(true);
    try {
      const aiSuggestions = await AIService.getSuggestions(noteId, content);
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
      message.error('Failed to load AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce the API call
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, noteId]);

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    setSelectedSuggestion(suggestion.id);
    onApplySuggestion(suggestion.content);
    
    // Remove the applied suggestion from the list after a delay
    setTimeout(() => {
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      setSelectedSuggestion(null);
    }, 1000);
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  if (loading) {
    return (
      <Card size="small" style={{ marginTop: 16 }}>
        <Space>
          <LoadingOutlined />
          <Text type="secondary">Analyzing content for suggestions...</Text>
        </Space>
      </Card>
    );
  }

  if (suggestions.length === 0 || !content.trim()) {
    return null;
  }

  return (
    <Card 
      size="small" 
      title={
        <Space>
          <BulbOutlined />
          <span>AI Suggestions</span>
        </Space>
      }
      style={{ marginTop: 16 }}
    >
      <List
        dataSource={suggestions}
        renderItem={(suggestion) => (
          <List.Item
            key={suggestion.id}
            actions={[
              <Tooltip key="apply" title="Apply suggestion">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleApplySuggestion(suggestion)}
                  loading={selectedSuggestion === suggestion.id}
                  disabled={disabled}
                />
              </Tooltip>,
              <Tooltip key="dismiss" title="Dismiss">
                <Button
                  type="text"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleDismissSuggestion(suggestion.id)}
                  disabled={disabled}
                />
              </Tooltip>,
            ]}
          >
            <List.Item.Meta
              title={suggestion.type.replace(/^\w/, c => c.toUpperCase())}
              description={
                <Text 
                  ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                  style={{ fontSize: '0.85em' }}
                >
                  {suggestion.content}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default AISuggestions;
