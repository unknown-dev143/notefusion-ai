import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Space, Typography, Spin, message } from 'antd';
import { 
  BulbOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  ReloadOutlined,
  TagsOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { noteAIService, AISuggestion } from '../services/noteAIService';
import styles from './AISuggestions.module.css';

const { Text } = Typography;

interface AISuggestionsProps {
  noteId: string;
  content: string;
  currentTags: string[];
  onApplySuggestion: (type: string, content: any) => void;
}

const SuggestionIcons: Record<string, React.ReactNode> = {
  summary: <BulbOutlined />,
  tags: <TagsOutlined />,
  action_items: <QuestionCircleOutlined />,
  related_notes: <LinkOutlined />
};

const SuggestionTitles: Record<string, string> = {
  summary: 'Summary',
  tags: 'Suggested Tags',
  action_items: 'Study Questions',
  related_notes: 'Related Notes'
};

const AISuggestions: React.FC<AISuggestionsProps> = ({
  noteId,
  content,
  onApplySuggestion
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  const fetchSuggestions = async () => {
    if (!content.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const aiSuggestions = await noteAIService.getSuggestions(noteId, content);
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      message.error('Failed to load AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, noteId]);

  const handleApply = (suggestion: AISuggestion, index: number) => {
    onApplySuggestion(suggestion.type, suggestion.content);
    setApplied(prev => ({
      ...prev,
      [`${suggestion.type}-${index}`]: true
    }));
    message.success(`Applied ${SuggestionTitles[suggestion.type] || 'suggestion'}`);
  };

  const renderSuggestionContent = (suggestion: AISuggestion) => {
    switch (suggestion.type) {
      case 'tags':
        const tags = Array.isArray(suggestion.content) ? suggestion.content : [];
        return (
          <div className={styles.suggestionContent}>
            {tags.map((tag, i) => (
              <Tag 
                key={i} 
                color="blue"
                className={styles['tag']}
                onClick={() => onApplySuggestion('add-tag', tag)}
              >
                {tag}
              </Tag>
            ))}
          </div>
        );
      
      case 'action_items':
        const items = Array.isArray(suggestion.content) ? suggestion.content : [];
        return (
          <List
            size="small"
            dataSource={items}
            renderItem={(item: string) => (
              <List.Item>
                <Text className={styles['actionItemText']}>{item}</Text>
              </List.Item>
            )}
          />
        );
      
      case 'related_notes':
        const notes = Array.isArray(suggestion.content) ? suggestion.content : [];
        return (
          <List
            size="small"
            dataSource={notes}
            renderItem={(note: string) => (
              <List.Item>
                <Text 
                  ellipsis={{ tooltip: note }}
                  style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                  onClick={() => onApplySuggestion('related-note', note)}
                >
                  {note}
                </Text>
              </List.Item>
            )}
          />
        );
      
      default:
        return (
          <Text style={{ fontSize: '0.9rem' }}>
            {typeof suggestion.content === 'string' 
              ? suggestion.content 
              : JSON.stringify(suggestion.content)}
          </Text>
        );
    }
  };

  if (loading) {
    return (
      <Card size="small" style={{ marginTop: 16 }}>
        <div className={styles['loadingContainer']}>
          <Spin size="small" />
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card 
      size="small" 
      title={
        <Space>
          <BulbOutlined />
          <span>AI Suggestions</span>
          <Button 
            type="text" 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={fetchSuggestions}
            loading={loading}
          />
        </Space>
      }
      style={{ marginTop: 16 }}
    >
      <List
        size="small"
        dataSource={suggestions}
        renderItem={(suggestion, index) => {
          const key = `${suggestion.type}-${index}`;
          const isApplied = applied[key];
          
          return (
            <List.Item
              key={key}
              style={{
                padding: '8px 0',
                opacity: isApplied ? 0.6 : 1,
                backgroundColor: isApplied ? '#f9f9f9' : 'transparent',
                borderRadius: 4,
                marginBottom: 4
              }}
            >
              <List.Item.Meta
                avatar={SuggestionIcons[suggestion.type] || <BulbOutlined />}
                title={
                  <div className={styles['suggestionHeader']}>
                    <div className={styles['suggestionActions']}>
                      {SuggestionIcons[suggestion.type]}
                      <Text strong>{SuggestionTitles[suggestion.type] || 'Suggestion'}</Text>
                    </div>
                    {suggestion.confidence && (
                      <Tag color={suggestion.confidence > 0.7 ? 'green' : 'orange'}>
                        {Math.round(suggestion.confidence * 100)}% confident
                      </Tag>
                    )}
                  </div>
                }
                description={renderSuggestionContent(suggestion)}
              />
              {!isApplied && (
                <Space>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CheckOutlined />} 
                    onClick={() => handleApply(suggestion, index)}
                  >
                    Apply
                  </Button>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CloseOutlined />} 
                    onClick={() => {
                      setApplied(prev => ({ ...prev, [key]: true }));
                    }}
                  />
                </Space>
              )}
              {isApplied && (
                <Space>
                  <Text type="success">
                    <CheckCircleOutlined /> Applied
                  </Text>
                </Space>
              )}
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default AISuggestions;
