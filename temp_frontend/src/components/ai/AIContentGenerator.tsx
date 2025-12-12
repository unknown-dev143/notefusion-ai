import React, { useState, useCallback } from 'react';
import { Button, Input, Select, Space, Typography, Card, Alert, Spin, Switch } from 'antd';
import { FileTextOutlined, MagicWand, CheckOutlined } from '@ant-design/icons';
import styles from './AIAssistant.module.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface AIContentGeneratorProps {
  content: string;
  onGenerate: (action: string, options: any) => Promise<{ content: string }>;
  onApplyContent?: (content: string) => void;
  isLoading?: boolean;
}

const contentTypes = [
  { value: 'summary', label: 'Summary' },
  { value: 'outline', label: 'Outline' },
  { value: 'blog-post', label: 'Blog Post' },
  { value: 'email', label: 'Email' },
  { value: 'tweet', label: 'Social Media Post' },
  { value: 'code', label: 'Code Snippet' },
  { value: 'custom', label: 'Custom Prompt' },
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'academic', label: 'Academic' },
];

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  content,
  onGenerate,
  onApplyContent,
  isLoading = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentType, setContentType] = useState('summary');
  const [tone, setTone] = useState('professional');
  const [useContext, setUseContext] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const generatePrompt = useCallback(() => {
    if (contentType === 'custom') {
      return customPrompt;
    }

    const prompts = {
      summary: `Create a concise summary of the following content. Focus on the main points and key information.\n\nContent: """${content}"""`,
      outline: `Create a detailed outline for the following content. Include main sections and subsections.\n\nContent: """${content}"""`,
      'blog-post': `Write a blog post based on the following content. Make it engaging and informative.\n\nContent: """${content}"""`,
      email: `Write a professional email based on the following content.\n\nContent: """${content}"""`,
      tweet: `Create a social media post (280 characters or less) based on the following content.\n\nContent: """${content}"""`,
      code: `Generate a code snippet based on the following requirements. Include comments for clarity.\n\nRequirements: """${content}"""`,
    };

    return prompts[contentType as keyof typeof prompts] || '';
  }, [content, contentType, customPrompt]);

  const handleGenerate = useCallback(async () => {
    if (!content && useContext) {
      setError('No content available to use as context');
      return;
    }

    if (contentType === 'custom' && !customPrompt) {
      setError('Please enter a custom prompt');
      return;
    }

    setError(null);
    setGeneratedContent('');

    try {
      const promptToUse = generatePrompt();
      const result = await onGenerate('generateContent', {
        prompt: promptToUse,
        options: {
          tone,
          format: 'markdown',
          maxLength: 1000,
        },
      });
      
      setGeneratedContent(result.content);
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error('Content generation error:', err);
    }
  }, [content, contentType, tone, useContext, customPrompt, generatePrompt, onGenerate]);

  const handleApply = () => {
    if (generatedContent && onApplyContent) {
      onApplyContent(generatedContent);
    }
  };

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    setGeneratedContent('');
  };

  const renderPromptInput = () => {
    if (contentType === 'custom') {
      return (
        <div className={styles.promptInput}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Enter your custom prompt:
          </Text>
          <TextArea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="E.g., Write a haiku about..."
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </div>
      );
    }

    return (
      <div className={styles.promptPreview}>
        <Text strong>Prompt:</Text>
        <div className={styles.promptText}>
          {generatePrompt().split('\n').map((line, i) => (
            <div key={i}>{line || <br />}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.aiFeatureContainer}>
      <div className={styles.controls}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div className={styles.controlGroup}>
            <div className={styles.controlItem}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Content Type</Text>
              <Select
                value={contentType}
                onChange={handleContentTypeChange}
                style={{ width: '100%' }}
                disabled={isLoading}
              >
                {contentTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </div>

            <div className={styles.controlItem}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Tone</Text>
              <Select
                value={tone}
                onChange={setTone}
                style={{ width: '100%' }}
                disabled={isLoading}
              >
                {tones.map((t) => (
                  <Option key={t.value} value={t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </div>

            <div className={styles.controlItem}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>Options</Text>
              <div className={styles.switchContainer}>
                <Switch
                  checked={useContext}
                  onChange={setUseContext}
                  size="small"
                  disabled={!content}
                />
                <Text style={{ marginLeft: 8 }}>
                  Use current content as context
                </Text>
              </div>
            </div>
          </div>

          {renderPromptInput()}

          <Button
            type="primary"
            icon={<MagicWand />}
            onClick={handleGenerate}
            loading={isLoading}
            disabled={(contentType === 'custom' && !customPrompt) || (useContext && !content)}
            block
          >
            Generate Content
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ margin: '16px 0' }}
        />
      )}

      <div className={styles.resultContainer}>
        {isLoading ? (
          <div className={styles.loadingOverlay}>
            <Spin size="large" tip="Generating content..." />
          </div>
        ) : generatedContent ? (
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <Text strong>Generated Content</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({contentTypes.find(t => t.value === contentType)?.label || 'Custom'} - {tones.find(t => t.value === tone)?.label || 'Professional'} tone)
                </Text>
              </Space>
            }
            extra={
              onApplyContent && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleApply}
                  size="small"
                >
                  Apply to Note
                </Button>
              )
            }
            className={styles.resultCard}
          >
            <div 
              className={styles.generatedContent}
              dangerouslySetInnerHTML={{ __html: generatedContent }}
            />
          </Card>
        ) : (
          <Card className={styles.placeholderCard}>
            <div className={styles.placeholder}>
              <FileTextOutlined style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 16 }} />
              <Text type="secondary">
                {useContext && !content
                  ? 'No content available to use as context.'
                  : 'Select a content type and click "Generate Content" to get started.'}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIContentGenerator;
