import React, { useState, useEffect } from 'react';
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

const AITemplateManager: React.FC<AITemplateManagerProps> = ({
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
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [newTemplate, setNewTemplate] = useState<Omit<AITemplate, 'id'>>({ 
    name: '',
    description: '',
    prompt: '',
    category: 'custom',
    isPremium: false
  });

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
    setSearchQuery(value.toLowerCase());
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

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery) ||
                         template.description.toLowerCase().includes(searchQuery);
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
