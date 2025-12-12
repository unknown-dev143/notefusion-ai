import React, { useState } from 'react';
import { Button, Tooltip, Space, Popconfirm, message, Spin } from 'antd';
import { 
  RobotOutlined, 
  BulbOutlined, 
  FileTextOutlined, 
  QuestionCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { AIService } from '../services/aiService';

interface AIToolbarProps {
  content: string;
  onContentUpdate: (newContent: string) => void;
  disabled?: boolean;
}

const AIToolbar: React.FC<AIToolbarProps> = ({ content, onContentUpdate, disabled = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAIAction = async (action: 'summarize' | 'improve' | 'expand') => {
    if (!content.trim()) {
      message.warning('Please add some content first');
      return;
    }

    setIsProcessing(true);
    setActiveAction(action);

    try {
      let result: string;
      
      switch (action) {
        case 'summarize':
          result = await AIService.summarize(content);
          break;
        case 'improve':
          result = await AIService.improve(content);
          break;
        case 'expand':
          result = await AIService.expand(content);
          break;
        default:
          throw new Error('Invalid AI action');
      }

      onContentUpdate(result);
      message.success(`Content ${action === 'summarize' ? 'summarized' : action + 'd'} successfully`);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      message.error(`Failed to ${action} content. Please try again.`);
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  const getButtonProps = (action: 'summarize' | 'improve' | 'expand', tooltip: string, icon: React.ReactNode) => {
    const buttonProps = {
      icon: isProcessing && activeAction === action ? <LoadingOutlined /> : icon,
      onClick: () => handleAIAction(action),
      disabled: disabled || isProcessing,
      loading: isProcessing && activeAction === action,
      type: (activeAction === action ? 'primary' : 'default') as 'primary' | 'default',
      children: action.charAt(0).toUpperCase() + action.slice(1),
      title: tooltip,
    };
    
    return buttonProps;
  };

  return (
    <div className="ai-toolbar py-2 px-4 border-b flex items-center justify-between bg-gray-50">
      <Space>
        <span className="text-sm font-medium text-gray-600 flex items-center">
          <RobotOutlined className="mr-1" /> AI Assistant
        </span>
      </Space>
      
      <Space size="middle">
        <Tooltip title="Summarize the content">
          <Button size="small" {...getButtonProps('summarize', 'Summarize', <FileTextOutlined />)} />
        </Tooltip>
        
        <Tooltip title="Improve writing style and grammar">
          <Button size="small" {...getButtonProps('improve', 'Improve', <BulbOutlined />)} />
        </Tooltip>
        
        <Tooltip title="Expand with more details">
          <Button size="small" {...getButtonProps('expand', 'Expand', <QuestionCircleOutlined />)} />
        </Tooltip>
      </Space>
    </div>
  );
};

export default AIToolbar;
