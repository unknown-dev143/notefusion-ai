import React, { useState, useCallback } from 'react';
import { Card, Select, Button, Space, Typography, Alert, Spin } from 'antd';
import { BulbOutlined, CheckOutlined } from '@ant-design/icons';
import { AISummary } from '../../services/ai/AIService';
// Define the expected CSS module types
type AIAssistantStyles = {
  // Existing styles
  aiFeatureContainer: string;
  controls: string;
  resultContainer: string;
  loadingOverlay: string;
  resultCard: string;
  bulletList: string;
  metaInfo: string;
  metaText: string;
  placeholderCard: string;
  placeholderContent: string;
  placeholderIcon: string;
  
  // New styles for AISummarizer
  controlsContainer: string;
  selectGroup: string;
  selectLabel: string;
  summarySelect: string;
  generateButton: string;
  bulletListItem: string;
};

const styles: AIAssistantStyles = require('./AIAssistant.module.css');

const { Text, Paragraph } = Typography;
const { Option } = Select;

interface AISummarizerProps {
  content: string;
  onSummarize: (action: string, options?: any) => Promise<AISummary | null>;
  onApplySummary?: (summary: string) => void;
  isLoading?: boolean;
}

const AISummarizer: React.FC<AISummarizerProps> = ({
  content,
  onSummarize,
  onApplySummary,
  isLoading = false,
}) => {
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [format, setFormat] = useState<'bullets' | 'paragraph' | 'headings'>('bullets');
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = useCallback(async () => {
    if (!content) {
      setError('No content available to summarize');
      return;
    }

    setError(null);
    try {
      const result = await onSummarize('summarize', {
        length,
        format,
        focus: 'key-points',
      });
      
      if (result) {
        setSummary(result);
      }
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error('Summarization error:', err);
    }
  }, [content, length, format, onSummarize]);

  // Removed unused handleApply and formatLabel functions

  return (
    <div className={styles.aiFeatureContainer}>
      <div className={styles.controls}>
        <Space size="middle" className={styles.controlsContainer}>
          <div className={styles.selectGroup}>
            <Text strong className={styles.selectLabel}>Summary Length</Text>
            <Select
              value={length}
              onChange={(value) => setLength(value as 'short' | 'medium' | 'long')}
              className={styles.summarySelect}
              disabled={isLoading}
            >
              <Option value="short">Short</Option>
              <Option value="medium">Medium</Option>
              <Option value="long">Long</Option>
            </Select>
          </div>
          <div className={styles.selectGroup}>
            <Text strong className={styles.selectLabel}>Format</Text>
            <Select
              value={format}
              onChange={(value) => setFormat(value as 'bullets' | 'paragraph' | 'headings')}
              className={styles.summarySelect}
              disabled={isLoading}
            >
              <Option value="bullets">Bullet Points</Option>
              <Option value="paragraph">Paragraph</Option>
              <Option value="headings">With Headings</Option>
            </Select>
          </div>
          <Button
            type="primary"
            onClick={handleSummarize}
            loading={isLoading}
            icon={<BulbOutlined />}
            className={styles.generateButton}
          >
            Generate Summary
          </Button>
        </Space>
      </div>

      <div className={styles.resultContainer}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <Spin size="large" tip="Generating summary..." />
          </div>
        )}

        {error && <Alert message="Error" description={error} type="error" showIcon />}

        {summary ? (
          <Card
            className={styles.resultCard}
            title={
              <Space>
                <Text strong>AI-Generated Summary</Text>
                {onApplySummary && (
                  <Button
                    type="link"
                    icon={<CheckOutlined />}
                    onClick={() => onApplySummary(summary.content)}
                    size="small"
                  >
                    Apply to Note
                  </Button>
                )}
              </Space>
            }
          >
            {format === 'bullets' ? (
              <ul className={styles.bulletList}>
                {summary.content.split('\n').map((point, index) => (
                  <li key={index} className={styles.bulletListItem}>
                    <Paragraph>{point}</Paragraph>
                  </li>
                ))}
              </ul>
            ) : (
              <Paragraph>{summary.content}</Paragraph>
            )}
            
            <div className={styles.metaInfo}>
              <Text type="secondary" className={styles.metaText}>
                Generated on {new Date(summary.createdAt).toLocaleString()}
              </Text>
            </div>
          </Card>
        ) : (
          <Card className={styles.placeholderCard}>
            <div className={styles.placeholderContent}>
              <BulbOutlined className={styles.placeholderIcon} />
              <Text type="secondary">
                {content
                  ? 'Click "Generate Summary" to create a summary of your content.'
                  : 'No content available to summarize.'}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AISummarizer;
