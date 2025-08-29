import React, { useState, useCallback } from 'react';
import { Tag, Button, Space, Typography, Card, Spin, Alert, Input, Tooltip } from 'antd';
import { TagsOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { AITagSuggestion } from '../../services/ai/AIService';
import styles from './AIAssistant.module.css';

const { Text, Title } = Typography;
const { CheckableTag } = Tag;

interface AITaggerProps {
  content: string;
  onGenerateTags: (action: string, options?: any) => Promise<AITagSuggestion[]>;
  onApplyTags?: (tags: string[]) => void;
  isLoading?: boolean;
  initialTags?: string[];
}

const AITagger: React.FC<AITaggerProps> = ({
  content,
  onGenerateTags,
  onApplyTags,
  isLoading = false,
  initialTags = [],
}) => {
  const [suggestedTags, setSuggestedTags] = useState<AITagSuggestion[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleGenerateTags = useCallback(async () => {
    if (!content) {
      setError('No content available to analyze for tags');
      return;
    }

    setError(null);
    try {
      const tags = await onGenerateTags('generateTags', {
        maxTags: 10,
        minConfidence: 0.6,
      });
      
      setSuggestedTags(tags);
      
      // Auto-select high confidence tags
      const highConfidenceTags = tags
        .filter(tag => tag.confidence >= 0.8)
        .map(tag => tag.tag);
      
      setSelectedTags(prev => {
        const newTags = [...new Set([...prev, ...highConfidenceTags])];
        return newTags;
      });
    } catch (err) {
      setError('Failed to generate tags. Please try again.');
      console.error('Tag generation error:', err);
    }
  }, [content, onGenerateTags]);

  const handleTagSelect = (tag: string, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter(t => t !== tag);
    setSelectedTags(nextSelectedTags);
  };

  const handleAddCustomTag = () => {
    if (customTag && !selectedTags.includes(customTag)) {
      setSelectedTags([...selectedTags, customTag]);
    }
    setCustomTag('');
    setIsAddingTag(false);
  };

  const handleApplyTags = () => {
    if (onApplyTags) {
      onApplyTags(selectedTags);
    }
  };

  const getTagColor = (tag: string): string => {
    // Generate a consistent color based on the tag name
    const colors = [
      'magenta', 'red', 'volcano', 'orange', 'gold',
      'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'
    ] as const;
    const index = Math.abs(tag.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % colors.length;
    // Ensure we return a valid color string
    return colors[Math.min(index, colors.length - 1)] || 'blue';
  };

  return (
    <div className={styles['aiFeatureContainer']}>
      <div className={styles['controls']}>
        <Button
          type="primary"
          icon={<TagsOutlined />}
          onClick={handleGenerateTags}
          loading={isLoading}
          disabled={!content}
        >
          Suggest Tags
        </Button>
        
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setIsAddingTag(true)}
          style={{ marginLeft: 8 }}
        >
          Add Custom Tag
        </Button>
        
        {onApplyTags && (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleApplyTags}
            disabled={selectedTags.length === 0}
            style={{ marginLeft: 'auto' }}
          >
            Apply {selectedTags.length} Tag{selectedTags.length !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {isAddingTag && (
        <div className={styles['customTagInput']}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Enter a new tag"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onPressEnter={handleAddCustomTag}
              autoFocus
            />
            <Button type="primary" onClick={handleAddCustomTag}>
              <CheckOutlined />
            </Button>
            <Button onClick={() => setIsAddingTag(false)}>
              <CloseOutlined />
            </Button>
          </Space.Compact>
        </div>
      )}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="mt-3"
        />
      )}

      <div className={styles['resultContainer']}>
        {isLoading ? (
          <div className={styles['loadingOverlay']}>
            <Spin tip="Analyzing content..." />
          </div>
        ) : suggestedTags.length > 0 ? (
          <Card
            title="Suggested Tags"
            className={styles['resultCard']}
            actions={[
              <Button
                key="apply"
                type="primary"
                onClick={handleApplyTags}
                disabled={selectedTags.length === 0}
              >
                Apply {selectedTags.length} Selected
              </Button>
            ]}
          >
            <div className={styles['tagContainer']}>
              <div className={styles['tagSection']}>
                <Title level={5} className="mb-3">Suggested Tags</Title>
                <div className={styles['tagsList']}>
                  {suggestedTags.map((tag, i) => (
                    <CheckableTag
                      key={i}
                      checked={selectedTags.includes(tag.tag)}
                      onChange={(checked) => handleTagSelect(tag.tag, checked)}
                      className={styles['tagItem']}
                    >
                      <Tooltip
                        title={`Confidence: ${Math.round(tag.confidence * 100)}%`}
                        placement="top"
                      >
                        {tag.tag}
                        {tag.category && ` (${tag.category})`}
                      </Tooltip>
                    </CheckableTag>
                  ))}
                </div>
              </div>

              {selectedTags.length > 0 && (
                <div className={styles['tagSection']}>
                  <Title level={5} className="mb-3">Selected Tags</Title>
                  <div className={styles['tagsList']}>
                    {selectedTags.map((tag, i) => (
                      <Tag
                        key={i}
                        color={getTagColor(tag)}
                        className={styles['tagItem']}
                        closable
                        onClose={() => handleTagSelect(tag, false)}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className={styles['placeholder']}>
            <TagsOutlined style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 16 }} />
            <Text type="secondary">
              {content
                ? 'Click "Suggest Tags" to generate relevant tags for your content.'
                : 'No content available for tag suggestions.'}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITagger;
