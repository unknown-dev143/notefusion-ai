import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Input, 
  Select, 
  Switch,
  Divider,
  Row,
  Col,
  Alert,
  message,
  Modal,
  Tabs,
  Tag,
  List
} from 'antd';
import { 
  EditOutlined,
  EyeOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UnorderedListOutlined,
  PictureOutlined,
  TableOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  icon: React.ReactNode;
}

interface DocumentSection {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'image' | 'code';
  content: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    alignment?: 'left' | 'center' | 'right';
  };
}

const DocumentCreator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [documentTitle, setDocumentTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [documentCategory, setDocumentCategory] = useState('study');
  const [documentTags, setDocumentTags] = useState<string[]>([]);
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [currentSection, setCurrentSection] = useState<DocumentSection>({
    id: Date.now().toString(),
    type: 'paragraph',
    content: '',
    styles: {}
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [newTag, setNewTag] = useState('');

  const templates: DocumentTemplate[] = [
    {
      id: 'blank',
      name: 'Blank Document',
      description: 'Start with a clean slate',
      category: 'general',
      content: '',
      icon: <FileTextOutlined />
    },
    {
      id: 'essay',
      name: 'Essay Template',
      description: 'Standard essay format with title and sections',
      category: 'academic',
      content: '# Essay Title\n\n## Introduction\n\nWrite your introduction here...\n\n## Body Paragraphs\n\nWrite your main points here...\n\n## Conclusion\n\nWrite your conclusion here...',
      icon: <FileTextOutlined />
    },
    {
      id: 'report',
      name: 'Report Template',
      description: 'Professional report format',
      category: 'professional',
      content: '# Report Title\n\n**Author:** Your Name\n**Date:** {current_date}\n\n## Executive Summary\n\n## Introduction\n\n## Methodology\n\n## Findings\n\n## Conclusion\n\n## Recommendations',
      icon: <FileTextOutlined />
    },
    {
      id: 'notes',
      name: 'Study Notes',
      description: 'Organized study notes format',
      category: 'study',
      content: '# {course_name} - Study Notes\n\n## {topic}\n\n### Key Concepts\n\n- Point 1\n- Point 2\n- Point 3\n\n### Important Formulas\n\n### Examples\n\n### Practice Questions',
      icon: <FileTextOutlined />
    },
    {
      id: 'assignment',
      name: 'Assignment Template',
      description: 'Assignment submission format',
      category: 'academic',
      content: '# Assignment Title\n\n**Student Name:** Your Name\n**Student ID:** Your ID\n**Course:** Course Name\n**Due Date:** Due Date\n\n## Question 1\n\nYour answer...\n\n## Question 2\n\nYour answer...',
      icon: <FileTextOutlined />
    },
    {
      id: 'meeting',
      name: 'Meeting Notes',
      description: 'Structured meeting notes template',
      category: 'professional',
      content: '# Meeting Notes\n\n**Date:** {date}\n**Time:** {time}\n**Location:** {location}\n\n## Attendees\n\n## Agenda\n\n## Discussion Points\n\n## Action Items\n\n## Next Steps',
      icon: <FileTextOutlined />
    },
    {
      id: 'research',
      name: 'Research Paper',
      description: 'Academic research paper structure',
      category: 'academic',
      content: '# Research Paper Title\n\n## Abstract\n\n## Introduction\n\n## Literature Review\n\n## Methodology\n\n## Results\n\n## Discussion\n\n## Conclusion\n\n## References',
      icon: <FileTextOutlined />
    },
    {
      id: 'project',
      name: 'Project Plan',
      description: 'Project planning template',
      category: 'professional',
      content: '# Project Plan\n\n## Project Overview\n\n## Objectives\n\n## Timeline\n\n## Resources\n\n## Budget\n\n## Risk Assessment\n\n## Deliverables',
      icon: <FileTextOutlined />
    }
  ];

  const categories = [
    { id: 'study', name: 'Study', color: 'blue' },
    { id: 'academic', name: 'Academic', color: 'green' },
    { id: 'professional', name: 'Professional', color: 'orange' },
    { id: 'personal', name: 'Personal', color: 'purple' },
    { id: 'general', name: 'General', color: 'gray' }
  ];

  const applyTemplate = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      const templateSections: DocumentSection[] = [];
      const lines = template.content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.trim()) {
          let type: DocumentSection['type'] = 'paragraph';
          if (line.startsWith('# ')) type = 'heading';
          else if (line.startsWith('## ')) type = 'heading';
          else if (line.startsWith('### ')) type = 'heading';
          else if (line.startsWith('- ')) type = 'list';
          else if (line.startsWith('**') && line.endsWith('**')) type = 'paragraph';
          
          templateSections.push({
            id: `template-${index}`,
            type,
            content: line,
            styles: type === 'heading' ? { bold: true } : {}
          });
        }
      });
      
      setSections(templateSections);
      message.success(`Template "${template.name}" applied successfully!`);
    }
  };

  const addSection = (type: DocumentSection['type']) => {
    const newSection: DocumentSection = {
      id: Date.now().toString(),
      type,
      content: '',
      styles: {}
    };
    
    if (type === 'heading') {
      newSection.content = 'New Heading';
      newSection.styles = { bold: true };
    } else if (type === 'list') {
      newSection.content = '• First item\n• Second item\n• Third item';
    } else if (type === 'code') {
      newSection.content = '// Your code here\nconsole.log("Hello World!");';
    }
    
    setSections(prev => [...prev, newSection]);
    setCurrentSection(newSection);
  };

  const updateSection = (sectionId: string, updates: Partial<DocumentSection>) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, ...updates }
        : section
    ));
    
    if (currentSection.id === sectionId) {
      setCurrentSection(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
    message.success('Section deleted');
  };

  const applyStyle = (style: 'bold' | 'italic' | 'underline') => {
    const currentStyles = currentSection.styles || {};
    const newStyles = { ...currentStyles, [style]: !currentStyles[style] };
    
    updateSection(currentSection.id, { styles: newStyles });
  };

  const generateDocument = () => {
    if (!documentTitle.trim()) {
      message.error('Please enter a document title');
      return;
    }

    let docContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${documentTitle}</title>
  <style>
    body { 
      font-family: 'Calibri', sans-serif; 
      line-height: 1.5; 
      margin: 40px; 
      max-width: 800px;
    }
    h1 { color: #2c3e50; font-size: 24px; margin-bottom: 20px; }
    h2 { color: #34495e; font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
    h3 { color: #7f8c8d; font-size: 16px; margin-top: 15px; margin-bottom: 8px; }
    p { margin-bottom: 12px; text-align: left; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .italic { font-style: italic; }
    .underline { text-decoration: underline; }
    ul, ol { margin-left: 20px; margin-bottom: 12px; }
    li { margin-bottom: 4px; }
    pre { 
      background: #f8f9fa; 
      padding: 12px; 
      border-radius: 4px; 
      font-family: 'Courier New', monospace;
      overflow-x: auto;
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
      margin-bottom: 12px; 
    }
    th, td { 
      border: 1px solid #ddd; 
      padding: 8px; 
      text-align: left; 
    }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>${documentTitle}</h1>
`;

    sections.forEach(section => {
      let content = section.content;
      let className = '';
      
      if (section.styles) {
        if (section.styles.bold) className += ' bold';
        if (section.styles.italic) className += ' italic';
        if (section.styles.underline) className += ' underline';
        if (section.styles.alignment === 'center') className += ' center';
        if (section.styles.alignment === 'right') className += ' right';
      }
      
      switch (section.type) {
        case 'heading':
          const headingLevel = content.startsWith('# ') ? 1 : content.startsWith('## ') ? 2 : 3;
          const headingText = content.replace(/^#+\s/, '');
          docContent += `  <h${headingLevel} class="${className.trim()}">${headingText}</h${headingLevel}>\n`;
          break;
        case 'paragraph':
          docContent += `  <p class="${className.trim()}">${content}</p>\n`;
          break;
        case 'list':
          const isOrdered = content.trim().startsWith('1.') || /^\d+\./.test(content.trim());
          const listItems = content.split('\n').map(item => item.replace(/^[\d\.\-\*\s]+/, '').trim()).filter(Boolean);
          const listTag = isOrdered ? 'ol' : 'ul';
          docContent += `  <${listTag} class="${className.trim()}">\n`;
          listItems.forEach(item => {
            docContent += `    <li>${item}</li>\n`;
          });
          docContent += `  </${listTag}>\n`;
          break;
        case 'code':
          docContent += `  <pre class="${className.trim()}">${content}</pre>\n`;
          break;
        case 'table':
          docContent += `  <table border="1" class="${className.trim()}">\n`;
          docContent += `    <tr><th>Column 1</th><th>Column 2</th></tr>\n`;
          docContent += `    <tr><td>Cell 1</td><td>Cell 2</td></tr>\n`;
          docContent += `  </table>\n`;
          break;
        case 'image':
          docContent += `  <img src="${content}" alt="Image" style="max-width: 100%; height: auto;" />\n`;
          break;
      }
    });

    docContent += `
</body>
</html>`;

    return docContent;
  };

  const saveDocument = (format: 'word' | 'pdf' | 'html') => {
    const docContent = generateDocument();
    let mimeType = 'text/html';
    let fileName = `${documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}`;

    switch (format) {
      case 'word':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileName += '.docx';
        break;
      case 'pdf':
        mimeType = 'application/pdf';
        fileName += '.pdf';
        break;
      case 'html':
        mimeType = 'text/html';
        fileName += '.html';
        break;
    }

    const blob = new Blob([docContent || ''], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success(`Document saved as ${format.toUpperCase()} successfully!`);
  };

  const previewDocument = () => {
    const docContent = generateDocument();
    if (docContent) {
      setPreviewContent(docContent);
      setPreviewVisible(true);
    }
  };

  const saveToNotes = () => {
    // Save to localStorage as a note
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const newNote = {
      id: Date.now().toString(),
      title: documentTitle || 'Untitled Document',
      content: sections.map(s => s.content).join('\n'),
      category: documentCategory,
      tags: documentTags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      format: 'rich'
    };
    
    notes.unshift(newNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    
    message.success('Document saved to notes successfully!');
  };

  const addTag = () => {
    if (newTag.trim() && !documentTags.includes(newTag.trim())) {
      setDocumentTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setDocumentTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Document Creator</Title>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Create Document" key="create">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Document Settings */}
              <Row gutter={16}>
                <Col span={8}>
                  <div>
                    <Text strong>Document Title</Text>
                    <Input
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="Enter document title..."
                      style={{ marginTop: 8 }}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <div>
                    <Text strong>Category</Text>
                    <Select
                      value={documentCategory}
                      onChange={setDocumentCategory}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      {categories.map(category => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col span={6}>
                  <div>
                    <Text strong>Template</Text>
                    <Select
                      value={selectedTemplate}
                      onChange={setSelectedTemplate}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      {templates.map(template => (
                        <Option key={template.id} value={template.id}>
                          <Space>
                            {template.icon}
                            {template.name}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col span={4}>
                  <div>
                    <Text strong>Auto-save</Text>
                    <div style={{ marginTop: 8 }}>
                      <Switch checked={autoSave} onChange={setAutoSave} />
                    </div>
                  </div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Button onClick={applyTemplate} block>
                    Apply Template
                  </Button>
                </Col>
                <Col span={12}>
                  <Button type="primary" onClick={saveToNotes} block>
                    Save to Notes
                  </Button>
                </Col>
              </Row>

              {/* Tags */}
              <div>
                <Text strong>Tags</Text>
                <div style={{ marginTop: 8 }}>
                  <Space wrap>
                    {documentTags.map(tag => (
                      <Tag
                        key={tag}
                        closable
                        onClose={() => removeTag(tag)}
                      >
                        {tag}
                      </Tag>
                    ))}
                    <Input
                      size="small"
                      style={{ width: 120 }}
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onPressEnter={addTag}
                      onBlur={addTag}
                    />
                  </Space>
                </div>
              </div>

              {/* Document Editor */}
              <Divider />
              
              <div>
                <Title level={4}>Document Content</Title>
                
                {/* Toolbar */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space wrap>
                    <Button 
                      icon={<BoldOutlined />} 
                      onClick={() => applyStyle('bold')}
                      type={currentSection.styles?.bold ? 'primary' : 'default'}
                    >
                      Bold
                    </Button>
                    <Button 
                      icon={<ItalicOutlined />} 
                      onClick={() => applyStyle('italic')}
                      type={currentSection.styles?.italic ? 'primary' : 'default'}
                    >
                      Italic
                    </Button>
                    <Button 
                      icon={<UnderlineOutlined />} 
                      onClick={() => applyStyle('underline')}
                      type={currentSection.styles?.underline ? 'primary' : 'default'}
                    >
                      Underline
                    </Button>
                    <Button 
                      icon={<AlignLeftOutlined />} 
                      onClick={() => updateSection(currentSection.id, { styles: { ...currentSection.styles, alignment: 'left' } })}
                      type={currentSection.styles?.alignment === 'left' ? 'primary' : 'default'}
                    >
                      Left
                    </Button>
                    <Button 
                      icon={<AlignCenterOutlined />} 
                      onClick={() => updateSection(currentSection.id, { styles: { ...currentSection.styles, alignment: 'center' } })}
                      type={currentSection.styles?.alignment === 'center' ? 'primary' : 'default'}
                    >
                      Center
                    </Button>
                    <Button 
                      icon={<AlignRightOutlined />} 
                      onClick={() => updateSection(currentSection.id, { styles: { ...currentSection.styles, alignment: 'right' } })}
                      type={currentSection.styles?.alignment === 'right' ? 'primary' : 'default'}
                    >
                      Right
                    </Button>
                  </Space>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <Space wrap>
                    <Button icon={<EditOutlined />} onClick={() => addSection('heading')}>
                      Add Heading
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => addSection('paragraph')}>
                      Add Paragraph
                    </Button>
                    <Button icon={<UnorderedListOutlined />} onClick={() => addSection('list')}>
                      Add List
                    </Button>
                    <Button icon={<TableOutlined />} onClick={() => addSection('table')}>
                      Add Table
                    </Button>
                    <Button icon={<PictureOutlined />} onClick={() => addSection('image')}>
                      Add Image
                    </Button>
                    <Button icon={<FileTextOutlined />} onClick={() => addSection('code')}>
                      Add Code
                    </Button>
                  </Space>
                </Card>

                {/* Sections */}
                <div>
                  {sections.length === 0 ? (
                    <Alert
                      message="No content yet"
                      description="Start by adding sections or applying a template."
                      type="info"
                      showIcon
                    />
                  ) : (
                    <div>
                      {sections.map((section, index) => (
                        <Card 
                          key={section.id} 
                          size="small" 
                          style={{ marginBottom: 8 }}
                          title={
                            <Space>
                              <Tag color={section.type === 'heading' ? 'blue' : 'green'}>
                                {section.type}
                              </Tag>
                              <Text>Section {index + 1}</Text>
                            </Space>
                          }
                          extra={
                            <Button 
                              size="small" 
                              danger 
                              onClick={() => deleteSection(section.id)}
                            >
                              Delete
                            </Button>
                          }
                        >
                          <TextArea
                            value={section.content}
                            onChange={(e) => updateSection(section.id, { content: e.target.value })}
                            placeholder={`Enter ${section.type} content...`}
                            rows={section.type === 'heading' ? 1 : section.type === 'code' ? 4 : 3}
                            style={{ 
                              fontWeight: section.styles?.bold ? 'bold' : 'normal',
                              fontStyle: section.styles?.italic ? 'italic' : 'normal',
                              textDecoration: section.styles?.underline ? 'underline' : 'none',
                              textAlign: section.styles?.alignment || 'left',
                              fontFamily: section.type === 'code' ? 'monospace' : 'inherit'
                            }}
                          />
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <Divider />
              
              <Row gutter={16}>
                <Col span={6}>
                  <Button icon={<EyeOutlined />} onClick={previewDocument} block>
                    Preview
                  </Button>
                </Col>
                <Col span={6}>
                  <Button icon={<FileWordOutlined />} onClick={() => saveDocument('word')} block>
                    Save as Word
                  </Button>
                </Col>
                <Col span={6}>
                  <Button icon={<FilePdfOutlined />} onClick={() => saveDocument('pdf')} block>
                    Save as PDF
                  </Button>
                </Col>
                <Col span={6}>
                  <Button icon={<FileTextOutlined />} onClick={() => saveDocument('html')} block>
                    Save as HTML
                  </Button>
                </Col>
              </Row>
            </Space>
          </TabPane>

          <TabPane tab="Templates" key="templates">
            <div>
              <Title level={4}>Document Templates</Title>
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={templates}
                renderItem={(template) => (
                  <List.Item>
                    <Card
                      hoverable
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setActiveTab('create');
                      }}
                    >
                      <Card.Meta
                        avatar={template.icon}
                        title={template.name}
                        description={
                          <Space direction="vertical" size="small">
                            <Text type="secondary">{template.description}</Text>
                            <Tag color="blue">{template.category}</Tag>
                          </Space>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Preview Modal */}
      <Modal
        title="Document Preview"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="word" icon={<FileWordOutlined />} onClick={() => saveDocument('word')}>
            Save as Word
          </Button>,
          <Button key="pdf" icon={<FilePdfOutlined />} onClick={() => saveDocument('pdf')}>
            Save as PDF
          </Button>,
          <Button key="html" icon={<FileTextOutlined />} onClick={() => saveDocument('html')}>
            Save as HTML
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <div 
          style={{ 
            maxHeight: 600, 
            overflow: 'auto', 
            padding: 20, 
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 6
          }}
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      </Modal>
    </div>
  );
};

export default DocumentCreator;
