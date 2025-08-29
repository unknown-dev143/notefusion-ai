import React, { useState, useEffect } from 'react';
import { List, Button, Modal, Input, Select, Space, Typography, message, Form } from 'antd';
import type { FC, ReactNode } from 'react';
import styles from './AITemplateManager.module.css';
import { PlusOutlined, StarFilled, StarOutlined, DeleteOutlined } from '@ant-design/icons';
import AIService, { AITemplate } from '../../services/ai/AIService';

const { Search } = Input;
const { Text } = Typography;

interface AITemplateManagerProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: AITemplate) => void;
  onTemplateSave?: (template: Omit<AITemplate, 'id'>) => Promise<void>;
  onTemplateDelete?: (templateId: string) => Promise<void>;
  initialCategory?: string;
}

const AITemplateManager: FC<AITemplateManagerProps> = ({
  visible,
  onClose,
  onSelectTemplate,
  onTemplateSave,
  onTemplateDelete,
  initialCategory = 'all'
}) => {
  const [templates, setTemplates] = useState<AITemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [category, setCategory] = useState<string>(initialCategory);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Omit<AITemplate, 'id'>>({ 
    name: '',
    description: '',
    prompt: '',
    category: 'custom',
    isPremium: false
  });
  // Define styles as constants with proper typing
  const searchContainerStyle: CSSProperties & { width: string } = {
    marginBottom: 16,
    width: '100%',
  };
  
  const searchInputStyle: CSSProperties & { width: number } = {
    width: 300,
  };
  
  const categorySelectStyle: CSSProperties & { width: number } = {
    width: 200,
  };
  
  const templateListStyle: CSSProperties & { maxHeight: string; overflowY: 'auto' } = {
    maxHeight: '60vh',
    overflowY: 'auto',
  };
  
  const templateItemStyle: CSSProperties & { cursor: string; padding: string } = {
    cursor: 'pointer',
    padding: '12px 0',
  };
  
  // Fix for List.Item actions type
  const getItemActions = (template: AITemplate): ReactNode[] => {
    const actions: ReactNode[] = [
      <Button 
        key="select" 
        type="link"
        onClick={(e) => {
          e.stopPropagation();
          handleSelect(template);
        }}
      >
        Use Template
      </Button>
    ];
    
    if (onTemplateDelete) {
      actions.push(
        <Button
          key="delete"
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteTemplate(template.id, e);
          }}
        />
      );
    }
    
    return actions;
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const allTemplates = await AIService.getTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      message.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchTemplates();
    }
  }, [visible]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleCreateTemplate = () => {
    setIsCreateModalVisible(true);
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.prompt.trim()) {
      message.warning('Please fill in all required fields');
      return;
    }

    try {
      if (onTemplateSave) {
        await onTemplateSave(newTemplate);
        message.success('Template saved successfully');
        setIsCreateModalVisible(false);
        setNewTemplate({ 
          name: '',
          description: '',
          prompt: '',
          category: 'custom',
          isPremium: false
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      message.error('Failed to save template');
    }
  };

  const handleDeleteTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (onTemplateDelete) {
        await onTemplateDelete(templateId);
        message.success('Template deleted successfully');
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      message.error('Failed to delete template');
    }
  };

  const handleSelect = (template: AITemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const filteredTemplates = templates.filter(template => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = template.name.toLowerCase().includes(searchLower) ||
                         template.description.toLowerCase().includes(searchLower);
    const matchesCategory = category === 'all' || template.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'creative', label: 'Creative' },
    { value: 'academic', label: 'Academic' },
    { value: 'business', label: 'Business' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <Modal
      title="AI Templates"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div className={styles['templateManager']}>
        <Space style={searchContainerStyle}>
          <Search
            placeholder="Search templates..."
            allowClear
            enterButton="Search"
            onSearch={handleSearch}
            style={searchInputStyle}
          />
          <Select<string>
            value={category}
            onChange={handleCategoryChange}
            style={categorySelectStyle}
            options={categories}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateTemplate}
          >
            New Template
          </Button>
        </Space>

        <List<AITemplate>
          style={templateListStyle}
          loading={loading}
          dataSource={filteredTemplates}
          rowKey="id"
          renderItem={(template) => (
            <List.Item
              key={template.id}
              onClick={() => handleSelect(template)}
              style={templateItemStyle}
              actions={getItemActions(template)}
            >
              <Text ellipsis={{ tooltip: template.description }}>
                {template.description}
              </Text>
            </List.Item>
          )}
        />

        <Modal
          title="Create New Template"
          open={isCreateModalVisible}
          onOk={handleSaveTemplate}
          onCancel={() => setIsCreateModalVisible(false)}
          okText="Save Template"
          cancelText="Cancel"
          width={600}
        >
          <div className={styles.modalFormItem}>
            <Text strong>Template Name</Text>
            <Input
              placeholder="Enter template name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
              className={styles.modalInput}
            />
          </div>
          <div className={styles.modalFormItem}>
            <Text strong>Description</Text>
            <Input.TextArea
              placeholder="Describe what this template does"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
              className={styles.modalInput}
              rows={2}
            />
          </div>
          <div className={styles.modalFormItem}>
            <Text strong>Prompt</Text>
            <Input.TextArea
              placeholder="Enter the AI prompt for this template"
              value={newTemplate.prompt}
              onChange={(e) => setNewTemplate({...newTemplate, prompt: e.target.value})}
              className={styles.modalTextArea}
              rows={4}
            />
            <Text type="secondary" className={styles.secondaryText}>
              Use {`{variable}`} placeholders for dynamic content
            </Text>
          </div>
          <div className={styles.modalFormItem}>
            <Text strong>Category</Text>
            <Select
              className={styles.modalSelect}
              value={newTemplate.category}
              onChange={(value) => setNewTemplate({...newTemplate, category: value as any})}
              options={categories.filter(cat => cat.value !== 'all')}
            />
          </div>
          <div className={styles.modalFormItem}>
            <Text strong>Access Level</Text>
            <div className={styles.accessLevelContainer}>
              <Button
                type={newTemplate.isPremium ? 'primary' : 'default'}
                icon={newTemplate.isPremium ? <StarFilled /> : <StarOutlined />}
                onClick={() => setNewTemplate({...newTemplate, isPremium: !newTemplate.isPremium})}
              >
                {newTemplate.isPremium ? 'Premium Template' : 'Make Premium'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Modal>
  );
};

// Helper function to get category color
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    productivity: 'blue',
    creative: 'purple',
    academic: 'green',
    business: 'cyan',
    custom: 'orange'
  };
  return colors[category] || 'default';
};

export default AITemplateManager;
