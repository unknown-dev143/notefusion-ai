import React, { useState } from 'react';
import { Button, Popover, Select, Space, Typography, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { generateSummary, SummaryOptions } from '../services/aiApiService';
import styles from './SummaryButton.module.css'

const { Text } = Typography;
const { Option } = Select;

interface SummaryButtonProps {
  content: string;
  onSummaryGenerated?: (summary: string) => void;
  buttonText?: string;
  buttonType?: 'text' | 'link' | 'default' | 'primary' | 'dashed';
}

const SummaryButton: React.FC<SummaryButtonProps> = ({
  content,
  onSummaryGenerated,
  buttonText = 'Generate Summary',
  buttonType = 'default',
}) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [options, setOptions] = useState<SummaryOptions>({
    length: 'medium',
    format: 'paragraph',
  });

  const handleGenerateSummary = async () => {
    if (!content.trim()) {
      message.warning('No content to summarize');
      return;
    }

    setLoading(true);
    try {
      const generatedSummary = await generateSummary(content, options);
      setSummary(generatedSummary);
      onSummaryGenerated?.(generatedSummary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      message.error('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contentNode = (
    <div className={styles['summary-container']}>
      <Space direction="vertical" className={styles['space-container']}>
        <div className={styles['option-group']}>
          <Text className={styles['summary-title']}>Summary Length</Text>
          <Select
            value={options.length}
            onChange={(value) => setOptions({ ...options, length: value })}
            className={styles['select']}
          >
            <Option value="short">Short</Option>
            <Option value="medium">Medium</Option>
            <Option value="long">Long</Option>
          </Select>
        </div>
        
        <div className={styles['option-group']}>
          <Text className={styles['summary-title']}>Format</Text>
          <Select
            value={options.format}
            onChange={(value) => setOptions({ ...options, format: value })}
            className={styles['select']}
          >
            <Option value="paragraph">Paragraph</Option>
            <Option value="bullet-points">Bullet Points</Option>
            <Option value="key-points">Key Points</Option>
          </Select>
        </div>

        <Button
          type="primary"
          onClick={handleGenerateSummary}
          loading={loading}
          block
          icon={<FileTextOutlined />}
          className={styles['generate-button']}
        >
          Generate Summary
        </Button>

        {summary && (
          <div className={styles['summary-group']}>
            <Text className={styles['summary-title']}>Summary</Text>
            <div className={styles['summary-content']}>
              {summary}
            </div>
          </div>
        )}
      </Space>
    </div>
  );

  return (
    <Popover 
      content={contentNode} 
      title="Generate Summary" 
      trigger="click"
      placement="bottomRight"
    >
      <Button type={buttonType} icon={<FileTextOutlined />}>
        {buttonText}
      </Button>
    </Popover>
  );
};

export default SummaryButton;
