import React, { useState } from 'react';
import { Button, Dropdown, Menu, Space, Tooltip, message, Modal, Input, Select } from 'antd';
import { 
  RobotOutlined, 
  BulbOutlined, 
  FileTextOutlined, 
  MagicIcon, 
  ThunderboltOutlined, 
  PlusOutlined,
  SaveOutlined
} from '@ant-design/icons';
import AIService from '../../services/ai/AIService';

interface AIToolbarProps {
  noteId: string;
  content: string;
  onContentUpdate: (newContent: string) => void;
  onSaveTemplate?: (template: { name: string; content: string }) => void;
  disabled?: boolean;
}

const AIToolbar: React.FC<AIToolbarProps> = ({
  noteId,
  content,
  onContentUpdate,
  onSaveTemplate,
  disabled = false
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('custom');

  const handleAIAction = async (action: string) => {
    if (!content.trim()) {
      message.warning('Please add some content first');
      return;
    }

    setLoading(action);
    try {
      let result;
      
      switch (action) {
        case 'summarize':
          result = await AIService.generateContent(
            'Summarize the following text concisely',
            content
          );
          break;
          
        case 'improve':
          result = await AIService.generateContent(
            'Improve the writing of the following text while keeping the original meaning',
            content
          );
          break;
          
        case 'expand':
          result = await AIService.generateContent(
            'Expand on the following content with more details and examples',
            content
          );
          break;
          
        case 'simplify':
          result = await AIService.generateContent(
            'Simplify the following text to be more concise and easier to understand',
            content
          );
          break;
          
        default:
          break;
      }
      
      if (result) {
        onContentUpdate(result.content);
        message.success('Content updated with AI suggestions');
      }
    } catch (error) {
      console.error('AI action failed:', error);
      message.error('Failed to process AI action');
    } finally {
      setLoading(null);
    }
  };

  const handleSaveAsTemplate = () => {
    if (!content.trim()) {
      message.warning('No content to save as template');
      return;
    }
    setIsModalVisible(true);
  };

  const handleTemplateSave = () => {
    if (!templateName.trim()) {
      message.warning('Please enter a template name');
      return;
    }
    
    if (onSaveTemplate) {
      onSaveTemplate({
        name: templateName,
        content: `Template for: ${templateName}\n\n${content}`
      });
    }
    
    setIsModalVisible(false);
    setTemplateName('');
    message.success('Template saved successfully');
  };

  const menu = (
    <Menu
      items={[
        {
          key: 'summarize',
          label: 'Summarize',
          icon: <FileTextOutlined />,
          onClick: () => handleAIAction('summarize'),
          disabled: loading !== null
        },
        {
          key: 'improve',
          label: 'Improve Writing',
          icon: <MagicIcon />,
          onClick: () => handleAIAction('improve'),
          disabled: loading !== null
        },
        {
          key: 'expand',
          label: 'Expand Content',
          icon: <PlusOutlined />,
          onClick: () => handleAIAction('expand'),
          disabled: loading !== null
        },
        {
          key: 'simplify',
          label: 'Simplify',
          icon: <ThunderboltOutlined />,
          onClick: () => handleAIAction('simplify'),
          disabled: loading !== null
        },
        {
          type: 'divider',
        },
        {
          key: 'saveTemplate',
          label: 'Save as Template',
          icon: <SaveOutlined />,
          onClick: handleSaveAsTemplate,
          disabled: loading !== null
        }
      ]}
    />
  );

  return (
    <>
      <Dropdown overlay={menu} trigger={['click']} disabled={disabled}>
        <Button 
          type="primary" 
          icon={<RobotOutlined />} 
          loading={loading !== null}
        >
          AI Tools
        </Button>
      </Dropdown>

      <Modal
        title="Save as Template"
        open={isModalVisible}
        onOk={handleTemplateSave}
        onCancel={() => {
          setIsModalVisible(false);
          setTemplateName('');
        }}
        okText="Save Template"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Select
            style={{ width: '100%' }}
            placeholder="Select Category"
            value={templateCategory}
            onChange={setTemplateCategory}
            options={[
              { value: 'productivity', label: 'Productivity' },
              { value: 'creative', label: 'Creative' },
              { value: 'academic', label: 'Academic' },
              { value: 'business', label: 'Business' },
              { value: 'custom', label: 'Custom' },
            ]}
          />
        </div>
      </Modal>
    </>
  );
};

export default AIToolbar;
