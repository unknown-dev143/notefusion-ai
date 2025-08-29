import { Button, Space, Tooltip, Popconfirm, message } from 'antd';
import { 
  RobotOutlined, 
  BulbOutlined, 
  TagsOutlined, 
  QuestionCircleOutlined,
  LoadingOutlined 
} from '@ant-design/icons';
import { useAI } from '../contexts/AIContext';

interface AIToolbarProps {
  content: string;
  onSummaryGenerated: (summary: string) => void;
  onTextImproved: (improvedText: string) => void;
  onTagsGenerated: (tags: string[]) => void;
  className?: string;
}

const AIToolbar = ({
  content,
  onSummaryGenerated,
  onTextImproved,
  onTagsGenerated,
  className = '',
}: AIToolbarProps) => {
  const { 
    isProcessing, 
    generateSummary, 
    improveText, 
    generateTags,
    answerQuestion
  } = useAI();

  const handleGenerateSummary = async () => {
    if (!content.trim()) {
      message.warning('Please add some content first');
      return;
    }
    try {
      const summary = await generateSummary(content);
      onSummaryGenerated(summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
  };

  const handleImproveText = async () => {
    if (!content.trim()) {
      message.warning('Please add some content first');
      return;
    }
    try {
      const improved = await improveText(content);
      onTextImproved(improved);
    } catch (error) {
      console.error('Failed to improve text:', error);
    }
  };

  const handleGenerateTags = async () => {
    if (!content.trim()) {
      message.warning('Please add some content first');
      return;
    }
    try {
      const tags = await generateTags(content);
      onTagsGenerated(tags);
    } catch (error) {
      console.error('Failed to generate tags:', error);
    }
  };

  return (
    <div className={`ai-toolbar ${className}`} style={{ marginBottom: '16px' }}>
      <Space wrap>
        <Tooltip title="Generate Summary">
          <Button 
            icon={isProcessing ? <LoadingOutlined /> : <BulbOutlined />} 
            onClick={handleGenerateSummary}
            disabled={isProcessing}
          >
            Summarize
          </Button>
        </Tooltip>
        
        <Tooltip title="Improve Writing">
          <Button 
            icon={isProcessing ? <LoadingOutlined /> : <RobotOutlined />} 
            onClick={handleImproveText}
            disabled={isProcessing}
          >
            Improve
          </Button>
        </Tooltip>
        
        <Tooltip title="Generate Tags">
          <Button 
            icon={isProcessing ? <LoadingOutlined /> : <TagsOutlined />}
            onClick={handleGenerateTags}
            disabled={isProcessing}
          >
            Generate Tags
          </Button>
        </Tooltip>
        
        <Popconfirm
          title="AI Assistant"
          description="What would you like to know about this note?"
          icon={<QuestionCircleOutlined style={{ color: '#1890ff' }} />}
          onConfirm={async () => {
            const question = prompt('Ask a question about the note:');
            if (question) {
              try {
                const answer = await answerQuestion(content, question);
                message.info(`AI: ${answer}`);
              } catch (error) {
                console.error('Failed to get answer:', error);
              }
            }
          }}
          okText="Ask"
          cancelText="Cancel"
        >
          <Tooltip title="Ask AI">
            <Button 
              icon={<QuestionCircleOutlined />}
              disabled={isProcessing || !content.trim()}
            >
              Ask AI
            </Button>
          </Tooltip>
        </Popconfirm>
      </Space>
    </div>
  );
};

export default AIToolbar;
