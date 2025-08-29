import React, { useState } from 'react';
import { Button, Space, Modal } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import AIToolbar from './AIToolbar';
import AIDemo from './AIDemo';
import styles from './AIIntegration.module.css';

interface AIIntegrationProps {
  noteId: string;
  content: string;
  onContentUpdate: (newContent: string) => void;
  disabled?: boolean;
  className?: string;
}

const AIIntegration: React.FC<AIIntegrationProps> = ({
  noteId,
  content,
  onContentUpdate,
  disabled = false,
  className = ''
}) => {
  const [isDemoVisible, setIsDemoVisible] = useState(false);

  const handleAIAction = async (action: string, data?: any) => {
    try {
      // You can add any custom logic here before passing to AIDemo
      return `Processed action: ${action} with data: ${JSON.stringify(data || '')}`;
    } catch (error) {
      console.error('AI action failed:', error);
      throw error;
    }
  };

  const availableActions = [
    {
      key: 'summarize',
      label: 'Summarize',
      description: 'Generate a summary of the content'
    },
    {
      key: 'improve',
      label: 'Improve Writing',
      description: 'Enhance the writing quality'
    },
    {
      key: 'expand',
      label: 'Expand Content',
      description: 'Add more details and examples'
    },
    {
      key: 'simplify',
      label: 'Simplify',
      description: 'Make the content more concise'
    }
  ];

  return (
    <div className={`${styles['ai-integration']} ${className}`}>
      <Space>
        <AIToolbar
          noteId={noteId}
          content={content}
          onContentUpdate={onContentUpdate}
          disabled={disabled}
        />
        
        <Button 
          type="default"
          icon={<RobotOutlined />}
          onClick={() => setIsDemoVisible(true)}
          disabled={disabled}
          aria-label="Open AI Demo"
        >
          AI Assistant
        </Button>
      </Space>

      <Modal
        title="AI Assistant"
        open={isDemoVisible}
        onCancel={() => setIsDemoVisible(false)}
        footer={null}
        width={800}
        className={styles['ai-demo-modal']}
        aria-modal="true"
        aria-labelledby="ai-demo-title"
      >
        <AIDemo
          onAction={handleAIAction}
          availableActions={availableActions}
          className={styles['ai-demo-container']}
        />
      </Modal>
    </div>
  );
};

export default AIIntegration;
