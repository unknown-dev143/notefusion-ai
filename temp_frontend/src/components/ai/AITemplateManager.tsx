import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { List, Button, Modal, Input, Select, Space, Typography, message, Form } from 'antd';
import type { FC, ReactNode } from 'react';
import styles from './AITemplateManager.module.css';
import { PlusOutlined, StarFilled, StarOutlined, DeleteOutlined } from '@ant-design/icons';
=======
import { Card, List, Button, Modal, Input, Select, Space, Typography, message, Tag } from 'antd';
import { 
  FileTextOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  StarFilled, 
  StarOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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

<<<<<<< HEAD
const AITemplateManager: FC<AITemplateManagerProps> = ({
=======
const AITemplateManager: React.FC<AITemplateManagerProps> = ({
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
=======
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  const [newTemplate, setNewTemplate] = useState<Omit<AITemplate, 'id'>>({ 
    name: '',
    description: '',
    prompt: '',
    category: 'custom',
    isPremium: false
  });
<<<<<<< HEAD
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
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

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
<<<<<<< HEAD
    setSearchQuery(value);
=======
    setSearchQuery(value.toLowerCase());
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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

<<<<<<< HEAD
  const handleSelect = (template: AITemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const filteredTemplates = templates.filter(template => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = template.name.toLowerCase().includes(searchLower) ||
                         template.description.toLowerCase().includes(searchLower);
=======
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery) ||
                         template.description.toLowerCase().includes(searchQuery);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
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
=======
      <div style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', marginBottom: 16 }}>
          <Search
            placeholder="Search templates..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            defaultValue={category}
            style={{ width: 200 }}
            onChange={handleCategoryChange}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD

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
=======
      </div>

      <List
        loading={loading}
        dataSource={filteredTemplates}
        renderItem={(template) => (
          <List.Item
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            style={{ cursor: 'pointer', padding: '12px 0' }}
            className="template-item"
            actions={[
              <Button 
                key="select" 
                type="link"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template);
                }}
              >
                Use Template
              </Button>,
              onTemplateDelete && (
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => handleDeleteTemplate(template.id, e)}
                />
              )
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{template.name}</Text>
                  {template.isPremium && <Tag color="gold">Premium</Tag>}
                  <Tag color={getCategoryColor(template.category)}>
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                  </Tag>
                </Space>
              }
              description={
                <Text 
                  ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                  type="secondary"
                >
                  {template.description}
                </Text>
              }
            />
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
        <div style={{ marginBottom: 16 }}>
          <Text strong>Template Name</Text>
          <Input
            placeholder="Enter template name"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
            style={{ marginTop: 8 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Description</Text>
          <Input.TextArea
            placeholder="Describe what this template does"
            value={newTemplate.description}
            onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
            style={{ marginTop: 8 }}
            rows={2}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Prompt</Text>
          <Input.TextArea
            placeholder="Enter the AI prompt for this template"
            value={newTemplate.prompt}
            onChange={(e) => setNewTemplate({...newTemplate, prompt: e.target.value})}
            style={{ marginTop: 8 }}
            rows={4}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Use {`{variable}`} placeholders for dynamic content
          </Text>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Category</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={newTemplate.category}
            onChange={(value) => setNewTemplate({...newTemplate, category: value as any})}
            options={categories.filter(cat => cat.value !== 'all')}
          />
        </div>
        <div>
          <Text strong>Access Level</Text>
          <div style={{ marginTop: 8 }}>
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
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
