import React, { useState } from 'react';
import { Card, Button, Input, Select, Space, Typography, List, Divider, message, Spin } from 'antd';
import { 
  BulbOutlined, 
  TranslationOutlined, 
  FileTextOutlined, 
  TagsOutlined,
  CheckOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useAI } from '../contexts/AIContext';
import styles from './AIDemo.module.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const languages = [
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
];

const AIDemo: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('spanish');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('summary');
  
  const { 
    generateSummary, 
    improveText, 
    generateTags, 
    answerQuestion,
    translateText: translateTextAI
  } = useAI();

  const handleAction = async (action: string) => {
    if (!inputText.trim()) {
      message.warning('Please enter some text first');
      return;
    }

    setLoading(true);
    setOutput('');
    setIdeas([]);
    
    // Show loading message with a small delay to prevent flickering
    const loadingMessage = message.loading({
      content: 'Processing your request...',
      key: 'ai-loading',
      duration: 0, // Don't auto-dismiss
    });
    
    try {
      let result;
      
      switch (action) {
        case 'summary':
          result = await generateSummary(inputText);
          setOutput(`Summary:\n${result}`);
          break;
          
        case 'improve':
          result = await improveText(inputText);
          setOutput(`Improved Text:\n${result}`);
          break;
          
        case 'tags':
          const tags = await generateTags(inputText);
          setOutput(`Generated Tags:\n${tags.map(tag => `• ${tag}`).join('\n')}`);
          break;
          
        case 'translate':
          result = await translateTextAI(inputText, selectedLanguage);
          setOutput(`Translation (${selectedLanguage}):\n${result}`);
          break;
          
        case 'ideas':
          const generatedIdeas = await generateIdeas(inputText);
          setIdeas(generatedIdeas);
          setOutput('');
          break;
          
        default:
          setOutput('Please select a valid action');
      }
    } catch (error: any) {
      console.error('AI action failed:', error);
      
      // Dismiss loading message
      message.destroy('ai-loading');
      
      // Show appropriate error message
      if (error.message.includes('API key')) {
        message.error({
          content: (
            <div>
              <p>OpenAI API key not configured</p>
              <p>Please set VITE_OPENAI_API_KEY in your .env file</p>
            </div>
          ),
          duration: 5,
        });
      } else if (error.message.includes('Rate limit')) {
        message.error({
          content: 'Rate limit exceeded. Please try again in a moment.',
          duration: 5,
        });
      } else {
        message.error({
          content: `Error: ${error.message || 'Failed to process request'}`,
          duration: 5,
        });
      }
      
      setOutput('');
    } finally {
      setLoading(false);
      // Ensure loading message is dismissed
      message.destroy('ai-loading');
    }
  };

  const generateIdeas = async (topic: string): Promise<string[]> => {
    try {
      const ideas = [];
      for (let i = 0; i < 3; i++) {
        const idea = await answerQuestion(inputText, `Generate a creative idea about ${topic}`);
        ideas.push(idea);
      }
      return ideas;
    } catch (error) {
      console.error('Failed to generate ideas:', error);
      return ['Failed to generate ideas. Please try again.'];
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setOutput('');
    setIdeas([]);
  };

  const renderActionButtons = () => (
    <Space wrap className={styles.actionButtons}>
      <Button 
        type={activeTab === 'summary' ? 'primary' : 'default'}
        icon={<FileTextOutlined />}
        onClick={() => handleTabChange('summary')}
      >
        Summarize
      </Button>
      <Button 
        type={activeTab === 'improve' ? 'primary' : 'default'}
        icon={<CheckOutlined />}
        onClick={() => handleTabChange('improve')}
      >
        Improve Text
      </Button>
      <Button 
        type={activeTab === 'tags' ? 'primary' : 'default'}
        icon={<TagsOutlined />}
        onClick={() => handleTabChange('tags')}
      >
        Generate Tags
      </Button>
      <Button 
        type={activeTab === 'translate' ? 'primary' : 'default'}
        icon={<TranslationOutlined />}
        onClick={() => handleTabChange('translate')}
      >
        Translate
      </Button>
      <Button 
        type={activeTab === 'ideas' ? 'primary' : 'default'}
        icon={<BulbOutlined />}
        onClick={() => handleTabChange('ideas')}
      >
        Generate Ideas
      </Button>
      {activeTab === 'translate' && (
        <Select
          defaultValue="spanish"
          className={styles.languageSelect}
          onChange={(value) => setSelectedLanguage(value)}
          options={languages}
        />
      )}
    </Space>
  );

  return (
    <Card 
      className={styles.container}
      title={
        <Space>
          <BulbOutlined />
          <span>AI Assistant</span>
        </Space>
      }
    >
      <TextArea
        rows={4}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter your text here to see AI in action..."
        className={styles.textArea}
      />
      
      {renderActionButtons()}
      
      <Button 
        type="primary" 
        onClick={() => handleAction(activeTab)}
        loading={loading}
        disabled={!inputText.trim()}
        style={{ marginBottom: 16 }}
      >
        {loading ? 'Processing...' : 'Generate'}
      </Button>
      
      <Divider>Result</Divider>
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <div className={styles.loadingText}>Generating {activeTab}...</div>
          <div className={styles.loadingSubtext}>
            This may take a few moments
          </div>
        </div>
      ) : output ? (
        <div className={styles.outputContainer}>
          {output}
        </div>
      ) : ideas.length > 0 ? (
        <List
          dataSource={ideas}
          renderItem={(idea, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Text strong>{index + 1}.</Text>}
                title={idea}
              />
            </List.Item>
          )}
        />
      ) : (
        <div className={styles.emptyState}>
          <BulbOutlined className={styles.emptyStateIcon} />
          <div>Select an action and click "Generate" to see results</div>
          <div className={styles.emptyStateSubtext}>
            Try entering some text and clicking one of the buttons above
          </div>
        </div>
      )}
    </Card>
  );
};

export default AIDemo;
