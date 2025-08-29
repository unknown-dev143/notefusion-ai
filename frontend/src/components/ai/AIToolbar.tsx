import React, { useState } from 'react';
import { Button, Dropdown, Menu, message, Modal, Input, Select } from 'antd';
import type { MenuProps } from 'antd';
import styles from './AIToolbar.module.css';
import { 
  RobotOutlined,
  FileTextOutlined, 
  ThunderboltOutlined, 
  PlusOutlined,
  SaveOutlined,
  StarOutlined
} from '@ant-design/icons';
import AIService from '../../services/ai/AIService';

type AIToolbarAction = 'summarize' | 'improve' | 'expand' | 'simplify';

type TemplateCategory = 'productivity' | 'creative' | 'academic' | 'business' | 'custom';

interface AIToolbarProps {
  /** The note content to be processed */
  content: string;
  /** Callback when content is updated */
  onContentUpdate: (newContent: string) => void;
  /** Optional callback when saving as template */
  onSaveTemplate?: (template: { name: string; content: string; category: TemplateCategory }) => void;
  /** Disable the toolbar */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
}

const AIToolbar: React.FC<AIToolbarProps> = ({
  content,
  onContentUpdate,
  onSaveTemplate,
  disabled = false,
  className = ''
}) => {
  const [loading, setLoading] = useState<AIToolbarAction | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>('');
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('custom');

  const handleAIAction = async (action: AIToolbarAction) => {
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
    
    try {
      if (onSaveTemplate) {
        onSaveTemplate({
          name: templateName.trim(),
          content: `Template for: ${templateName}\n\n${content}`,
          category: templateCategory
        });
      }
      
      setIsModalVisible(false);
      setTemplateName('');
      message.success('Template saved successfully');
    } catch (error) {
      console.error('Failed to save template:', error);
      message.error('Failed to save template. Please try again.');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'summarize',
      label: 'Summarize',
      icon: <FileTextOutlined aria-hidden="true" />,
      onClick: () => handleAIAction('summarize'),
      disabled: loading !== null,
    },
    {
      key: 'improve',
      label: 'Improve Writing',
      icon: <StarOutlined aria-hidden="true" />,
      onClick: () => handleAIAction('improve'),
      disabled: loading !== null,
    },
    {
      key: 'expand',
      label: 'Expand Content',
      icon: <PlusOutlined aria-hidden="true" />,
      onClick: () => handleAIAction('expand'),
      disabled: loading !== null,
    },
    {
      key: 'simplify',
      label: 'Simplify',
      icon: <ThunderboltOutlined aria-hidden="true" />,
      onClick: () => handleAIAction('simplify'),
      disabled: loading !== null,
    },
    {
      type: 'divider',
      key: 'divider-1'
    },
    {
      key: 'saveTemplate',
      label: 'Save as Template',
      icon: <SaveOutlined aria-hidden="true" />,
      onClick: handleSaveAsTemplate,
      disabled: loading !== null,
    }
  ];

  const menu = <Menu items={menuItems} />;

  return (
    <div className={`${styles['toolbar-container']} ${className}`}>
      <Dropdown 
        overlay={menu} 
        trigger={['click']} 
        disabled={disabled}
        placement="bottomLeft"
      >
        <Button 
          type="primary" 
          icon={<RobotOutlined aria-hidden="true" />} 
          loading={loading !== null}
          aria-haspopup="menu"
          aria-expanded={isModalVisible}
          aria-label="AI Tools"
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
        aria-modal={true}
        aria-labelledby="template-modal-title"
      >
        <div className={styles['modal-content']}>
          <Input
            placeholder="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className={styles['input-field']}
            aria-label="Template name"
            onKeyDown={(e) => e.key === 'Enter' && handleTemplateSave()}
          />
          <Select<TemplateCategory>
            className={styles['select-field'] || ''}
            placeholder="Select Category"
            value={templateCategory}
            onChange={(value) => setTemplateCategory(value)}
            options={[
              { value: 'productivity', label: 'Productivity' },
              { value: 'creative', label: 'Creative' },
              { value: 'academic', label: 'Academic' },
              { value: 'business', label: 'Business' },
              { value: 'custom', label: 'Custom' },
            ]}
            aria-label="Template category"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AIToolbar;
