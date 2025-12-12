import React, { useState } from 'react';
import { Card, Typography, Button, Space, Select, Checkbox, message, List, Tag, Progress } from 'antd';
import { 
  DownloadOutlined, 
  FilePdfOutlined, 
  FileMarkdownOutlined, 
  FileTextOutlined, 
  FileExcelOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface ExportItem {
  id: string;
  type: 'note' | 'transcript' | 'flashcard' | 'session' | 'pdf';
  title: string;
  date: string;
  moduleCode?: string;
  selected: boolean;
  content?: string;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'pdf' | 'markdown' | 'json' | 'csv';
  options: {
    includeContent: boolean;
    includeMetadata: boolean;
    includeTimestamps: boolean;
    includeTags: boolean;
    includeImages: boolean;
    customFormatting: boolean;
  };
}

const ExportSystem: React.FC = () => {
  const [exportItems, setExportItems] = useState<ExportItem[]>([
    {
      id: '1',
      type: 'note',
      title: 'Machine Learning Fundamentals',
      date: new Date().toISOString(),
      moduleCode: 'CS301',
      selected: false,
      content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.'
    },
    {
      id: '2',
      type: 'transcript',
      title: 'Lecture 1 - Introduction to AI',
      date: new Date(Date.now() - 86400000).toISOString(),
      moduleCode: 'CS301',
      selected: false,
      content: 'Today we will discuss the fundamentals of artificial intelligence and its applications in modern technology.'
    },
    {
      id: '3',
      type: 'flashcard',
      title: 'Machine Learning Basics',
      date: new Date().toISOString(),
      moduleCode: 'CS301',
      selected: false,
      content: 'What is machine learning? A method of data analysis that automates analytical model building.'
    },
    {
      id: '4',
      type: 'session',
      title: 'Machine Learning Study Session',
      date: new Date(Date.now() + 86400000).toISOString(),
      moduleCode: 'CS301',
      selected: false
    }
  ]);

  const [exportFormat, setExportFormat] = useState<'pdf' | 'markdown' | 'json' | 'csv'>('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeContent: true,
    includeMetadata: true,
    includeTimestamps: true,
    includeTags: true,
    includeImages: false,
    customFormatting: false
  });

  const exportTemplates: ExportTemplate[] = [
    {
      id: '1',
      name: 'Study Notes PDF',
      description: 'Clean PDF format for study notes',
      format: 'pdf',
      options: {
        includeContent: true,
        includeMetadata: true,
        includeTimestamps: false,
        includeTags: true,
        includeImages: false,
        customFormatting: true
      }
    },
    {
      id: '2',
      name: 'Transcript Markdown',
      description: 'Markdown format for transcripts',
      format: 'markdown',
      options: {
        includeContent: true,
        includeMetadata: false,
        includeTimestamps: true,
        includeTags: false,
        includeImages: false,
        customFormatting: false
      }
    },
    {
      id: '3',
      name: 'Flashcard CSV',
      description: 'CSV format for flashcard import/export',
      format: 'csv',
      options: {
        includeContent: true,
        includeMetadata: true,
        includeTimestamps: false,
        includeTags: true,
        includeImages: false,
        customFormatting: false
      }
    }
  ];

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
    
  const formatIcons = {
    pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
    markdown: <FileMarkdownOutlined style={{ color: '#52c41a' }} />,
    json: <FileTextOutlined style={{ color: '#1890ff' }} />,
    csv: <FileExcelOutlined style={{ color: '#52c41a' }} />
  };

  const typeColors = {
    note: 'blue',
    transcript: 'green',
    flashcard: 'orange',
    session: 'purple',
    pdf: 'red'
  };

  const selectAllItems = () => {
    setExportItems(prev => prev.map(item => ({ ...item, selected: true })));
  };

  const deselectAllItems = () => {
    setExportItems(prev => prev.map(item => ({ ...item, selected: false })));
  };

  const toggleItemSelection = (itemId: string) => {
    setExportItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const applyTemplate = (template: ExportTemplate) => {
    setExportFormat(template.format);
    setExportOptions(template.options);
    message.success(`Template "${template.name}" applied`);
  };

  const performExport = async () => {
    const selectedItems = exportItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      message.warning('Please select at least one item to export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Simulate export process
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      setExportProgress(100);
      
      // Generate export file based on format
      const exportData = generateExportData(selectedItems, exportFormat);
      downloadFile(exportData);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        message.success(`Successfully exported ${selectedItems.length} items as ${exportFormat.toUpperCase()}`);
      }, 1000);
    }, 2000);
  };

  const generateExportData = (items: ExportItem[], format: string) => {
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const filename = `notefusion_export_${timestamp}`;
    
    switch (format) {
      case 'pdf':
        // Generate HTML content for PDF conversion
        return {
          filename: `${filename}.pdf`,
          content: generatePDFContent(items),
          mimeType: 'application/pdf'
        };
      
      case 'markdown':
        return {
          filename: `${filename}.md`,
          content: generateMarkdownContent(items),
          mimeType: 'text/markdown'
        };
      
      case 'json':
        return {
          filename: `${filename}.json`,
          content: JSON.stringify({
            exportDate: new Date().toISOString(),
            items: items.map(item => ({
              ...item,
              ...(exportOptions.includeMetadata && { metadata: { moduleCode: item.moduleCode } }),
              ...(exportOptions.includeTimestamps && { timestamp: item.date })
            }))
          }, null, 2),
          mimeType: 'application/json'
        };
      
      case 'csv':
        return {
          filename: `${filename}.csv`,
          content: generateCSVContent(items),
          mimeType: 'text/csv'
        };
      
      default:
        return {
          filename: `${filename}.txt`,
          content: items.map(item => item.title).join('\n'),
          mimeType: 'text/plain'
        };
    }
  };

  const generatePDFContent = (items: ExportItem[]) => {
    // Generate HTML content for PDF conversion
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>NoteFusion Export</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #1890ff; }
        .item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .item-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
        .item-meta { color: #666; font-size: 12px; margin-bottom: 10px; }
        .item-content { line-height: 1.5; }
        .export-info { background: #f0f2f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>NoteFusion Export</h1>
      <div class="export-info">
        <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Total Items:</strong> ${items.length}</p>
        <p><strong>Export Options:</strong> ${exportOptions.includeContent ? 'Content' : ''} ${exportOptions.includeMetadata ? 'Metadata' : ''} ${exportOptions.includeTimestamps ? 'Timestamps' : ''}</p>
      </div>
    `;
    
    items.forEach((item, index) => {
      htmlContent += `
      <div class="item">
        <div class="item-title">${index + 1}. ${item.title}</div>
        <div class="item-meta">
          Type: ${item.type}
          ${exportOptions.includeMetadata && item.moduleCode ? `| Module: ${item.moduleCode}` : ''}
          ${exportOptions.includeTimestamps ? `| Date: ${new Date(item.date).toLocaleString()}` : ''}
        </div>
        ${exportOptions.includeContent ? `<div class="item-content">${item.content}</div>` : ''}
      </div>
      `;
    });
    
    htmlContent += `
    </body>
    </html>
    `;
    
    return htmlContent;
  };

  const generateMarkdownContent = (items: ExportItem[]) => {
    let content = `# NoteFusion Export\n\n`;
    content += `**Export Date:** ${new Date().toLocaleString()}\n`;
    content += `**Total Items:** ${items.length}\n\n`;
    
    items.forEach((item, index) => {
      content += `## ${index + 1}. ${item.title}\n\n`;
      content += `- **Type:** ${item.type}\n`;
      if (exportOptions.includeMetadata && item.moduleCode) {
        content += `- **Module:** ${item.moduleCode}\n`;
      }
      if (exportOptions.includeTimestamps) {
        content += `- **Date:** ${new Date(item.date).toLocaleString()}\n`;
      }
      content += '\n';
    });
    
    return content;
  };

  const generateCSVContent = (items: ExportItem[]) => {
    let content = 'Title,Type,Module,Date,Selected\n';
    items.forEach(item => {
      content += `"${item.title}","${item.type}","${item.moduleCode || ''}","${new Date(item.date).toLocaleString()}","${item.selected}"\n`;
    });
    return content;
  };

  const downloadFile = (exportData: any) => {
    // Create download link (mock implementation)
    const blob = new Blob([exportData.content], { type: exportData.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedCount = exportItems.filter(item => item.selected).length;

  return (
    <Card title="Export System" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Export Selection */}
        <div>
          <Title level={4}>Select Items to Export</Title>
          <Space style={{ marginBottom: 16 }}>
            <Button onClick={selectAllItems}>Select All</Button>
            <Button onClick={deselectAllItems}>Deselect All</Button>
            <Text type="secondary">
              {selectedCount} of {exportItems.length} items selected
            </Text>
          </Space>
          
          <List
            dataSource={exportItems}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Checkbox
                      checked={item.selected}
                      onChange={() => toggleItemSelection(item.id)}
                    />
                  }
                  title={
                    <Space>
                      {item.title}
                      <Tag color={typeColors[item.type]}>{item.type}</Tag>
                      {item.moduleCode && <Tag color="blue">{item.moduleCode}</Tag>}
                    </Space>
                  }
                  description={
                    <Text type="secondary">
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </div>

        {/* Export Configuration */}
        <div>
          <Title level={4}>Export Configuration</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Format Selection */}
            <div>
              <Text strong>Export Format:</Text>
              <Select
                value={exportFormat}
                onChange={setExportFormat}
                style={{ width: '100%', marginTop: 8 }}
              >
                <Option value="pdf">
                  <Space>
                    {formatIcons.pdf}
                    PDF Document
                  </Space>
                </Option>
                <Option value="markdown">
                  <Space>
                    {formatIcons.markdown}
                    Markdown File
                  </Space>
                </Option>
                <Option value="json">
                  <Space>
                    {formatIcons.json}
                    JSON Data
                  </Space>
                </Option>
                <Option value="csv">
                  <Space>
                    {formatIcons.csv}
                    CSV Spreadsheet
                  </Space>
                </Option>
              </Select>
            </div>

            {/* Export Options */}
            <div>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text strong>Export Options:</Text>
                <Button 
                  icon={<SettingOutlined />}
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {showSettings ? 'Hide' : 'Show'} Settings
                </Button>
              </Space>
              
              {showSettings && (
                <div style={{ marginTop: 8 }}>
                  <Space direction="vertical">
                    <Checkbox
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                    >
                      Include Metadata (module codes, authors, etc.)
                    </Checkbox>
                    <Checkbox
                      checked={exportOptions.includeTimestamps}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                    >
                      Include Timestamps
                    </Checkbox>
                    <Checkbox
                      checked={exportOptions.includeTags}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeTags: e.target.checked }))}
                    >
                      Include Tags
                    </Checkbox>
                    <Checkbox
                      checked={exportOptions.includeImages}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                    >
                      Include Images (if available)
                    </Checkbox>
                    <Checkbox
                      checked={exportOptions.customFormatting}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, customFormatting: e.target.checked }))}
                    >
                      Apply Custom Formatting
                    </Checkbox>
                  </Space>
                </div>
              )}
            </div>
          </Space>
        </div>

        {/* Export Templates */}
        <div>
          <Title level={4}>Export Templates</Title>
          <List
            dataSource={exportTemplates}
            renderItem={(template) => (
              <List.Item
                actions={[
                  <Button 
                    type="primary"
                    onClick={() => applyTemplate(template)}
                  >
                    Apply Template
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={formatIcons[template.format]}
                  title={template.name}
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">{template.description}</Text>
                      <Space>
                        <Tag color="blue">{template.format.toUpperCase()}</Tag>
                        <InfoCircleOutlined />
                        <Text type="secondary">
                          {Object.values(template.options).filter(Boolean).length} options enabled
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>

        {/* Export Action */}
        <div>
          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={performExport}
            loading={isExporting}
            disabled={selectedCount === 0}
            style={{ width: '100%' }}
          >
            {isExporting ? 'Exporting...' : `Export ${selectedCount} Items`}
          </Button>
          
          {isExporting && (
            <Progress 
              percent={exportProgress}
              style={{ marginTop: 16 }}
              format={() => `${exportProgress}%`}
            />
          )}
        </div>

        {/* Recent Exports Info */}
        <Card size="small" title="Export Information">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>
              <InfoCircleOutlined /> Export formats available:
            </Text>
            <Space wrap>
              <Tag icon={<FilePdfOutlined />}>PDF - Best for printing and sharing</Tag>
              <Tag icon={<FileMarkdownOutlined />}>Markdown - For documentation</Tag>
              <Tag icon={<FileTextOutlined />}>JSON - For data backup</Tag>
              <Tag icon={<FileExcelOutlined />}>CSV - For spreadsheets</Tag>
            </Space>
            <Text type="secondary">
              Exports include all selected content with your chosen formatting options.
              Large exports may take additional time to process.
            </Text>
          </Space>
        </Card>
      </Space>
    </Card>
  );
};

export default ExportSystem;
