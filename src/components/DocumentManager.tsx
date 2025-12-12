import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Upload, 
  message, 
  List, 
  Tag, 
  Progress, 
  Modal, 
  Input, 
  Select, 
  Row, 
  Col,
  Divider,
  Tabs,
  Table
} from 'antd';
import { 
  FilePdfOutlined, 
  FileWordOutlined,
  FileTextOutlined,
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  SwapOutlined,
  FileAddOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'rtf';
  size: number;
  uploadDate: string;
  content?: string;
  pageCount?: number;
  wordCount?: number;
  moduleCode?: string;
  tags: string[];
  lastModified: string;
}

interface ConversionJob {
  id: string;
  sourceFile: string;
  sourceType: string;
  targetType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: string;
}

const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'AI_Fundamentals_Textbook.pdf',
      type: 'pdf',
      size: 5242880,
      uploadDate: new Date().toISOString(),
      content: 'This is a comprehensive introduction to artificial intelligence...',
      pageCount: 156,
      moduleCode: 'CS301',
      tags: ['AI', 'Machine Learning', 'Textbook'],
      lastModified: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Study_Notes.docx',
      type: 'docx',
      size: 1048576,
      uploadDate: new Date(Date.now() - 86400000).toISOString(),
      content: 'Machine Learning Study Notes\n\nChapter 1: Introduction...',
      wordCount: 2500,
      moduleCode: 'CS301',
      tags: ['Notes', 'Study Guide'],
      lastModified: new Date(Date.now() - 86400000).toISOString()
    }
  ]);
  
  const [conversions, setConversions] = useState<ConversionJob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  
  // Word Document Creation State
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docTemplate, setDocTemplate] = useState<string>('blank');
  
  // Conversion State
  const [selectedConversionDoc, setSelectedConversionDoc] = useState<Document | null>(null);
  const [conversionTarget, setConversionTarget] = useState<string>('pdf');

  const handleFileUpload = async (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'];
    
    if (!validTypes.includes(file.type)) {
      message.error('Please upload a PDF, Word document, text file, or RTF file');
      return false;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    // Simulate file processing
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 
              file.type.includes('word') ? 'docx' : 
              file.type.includes('text') ? 'txt' : 'rtf',
        size: file.size,
        uploadDate: new Date().toISOString(),
        content: `Extracted content from ${file.name}...`,
        pageCount: file.type.includes('pdf') ? Math.floor(Math.random() * 50) + 10 : undefined,
        wordCount: !file.type.includes('pdf') ? Math.floor(Math.random() * 5000) + 500 : undefined,
        tags: ['Uploaded'],
        lastModified: new Date().toISOString()
      };

      setDocuments(prev => [newDoc, ...prev]);
      setUploading(false);
      setUploadProgress(0);
      message.success(`${file.name} uploaded successfully!`);
    }, 2000);

    return false; // Prevent default upload behavior
  };

  const createWordDocument = () => {
    if (!docTitle.trim() || !docContent.trim()) {
      message.error('Please enter both title and content');
      return;
    }

    // Create Word document content (simplified HTML that can be converted to DOCX)
    const docContentHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docTitle}</title>
        <style>
          body { font-family: 'Calibri', sans-serif; margin: 40px; }
          h1 { color: #2c3e50; }
          p { line-height: 1.6; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <h1>${docTitle}</h1>
        ${docContent.split('\n').map(p => `<p>${p}</p>`).join('')}
      </body>
      </html>
    `;

    const blob = new Blob([docContentHTML], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docTitle.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Add to documents list
    const newDoc: Document = {
      id: Date.now().toString(),
      name: `${docTitle}.docx`,
      type: 'docx',
      size: blob.size,
      uploadDate: new Date().toISOString(),
      content: docContent,
      wordCount: docContent.split(' ').length,
      tags: ['Created', 'Word Document'],
      lastModified: new Date().toISOString()
    };

    setDocuments(prev => [newDoc, ...prev]);
    setCreateModalVisible(false);
    setDocTitle('');
    setDocContent('');
    message.success('Word document created successfully!');
  };

  const convertDocument = () => {
    if (!selectedConversionDoc) {
      message.error('Please select a document to convert');
      return;
    }

    const conversionJob: ConversionJob = {
      id: Date.now().toString(),
      sourceFile: selectedConversionDoc.name,
      sourceType: selectedConversionDoc.type,
      targetType: conversionTarget,
      status: 'processing',
      progress: 0
    };

    setConversions(prev => [...prev, conversionJob]);

    // Simulate conversion process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setConversions(prev => prev.map(job => 
        job.id === conversionJob.id 
          ? { ...job, progress }
          : job
      ));

      if (progress >= 100) {
        clearInterval(interval);
        setConversions(prev => prev.map(job => 
          job.id === conversionJob.id 
            ? { 
                ...job, 
                status: 'completed',
                result: `${selectedConversionDoc.name.replace(/\.[^/.]+$/, "")}.${conversionTarget}`
              }
            : job
        ));
        message.success(`Document converted to ${conversionTarget.toUpperCase()} successfully!`);
      }
    }, 500);

    setConvertModalVisible(false);
    setSelectedConversionDoc(null);
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    message.success('Document deleted successfully!');
  };

  const downloadDocument = (doc: Document) => {
    // Create a simple download for demonstration
    const content = doc.content || `Content of ${doc.name}`;
    const blob = new Blob([content], { 
      type: doc.type === 'pdf' ? 'application/pdf' : 
            doc.type === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 
            'text/plain' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success(`${doc.name} downloaded!`);
  };

  const previewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setPreviewVisible(true);
  };

  // Filter and search documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.content && doc.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'size': return b.size - a.size;
      case 'date': return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      default: return 0;
    }
  });

  const documentTemplates = [
    { value: 'blank', label: 'Blank Document' },
    { value: 'essay', label: 'Essay Template' },
    { value: 'report', label: 'Report Template' },
    { value: 'notes', label: 'Study Notes Template' },
    { value: 'assignment', label: 'Assignment Template' }
  ];

  const conversionTargets = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'docx', label: 'Word Document' },
    { value: 'txt', label: 'Text File' },
    { value: 'rtf', label: 'Rich Text Format' }
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Document) => (
        <Space>
          {record.type === 'pdf' && <FilePdfOutlined />}
          {record.type === 'docx' && <FileWordOutlined />}
          {record.type === 'txt' && <FileTextOutlined />}
          {record.type === 'rtf' && <FileTextOutlined />}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'pdf' ? 'red' : type === 'docx' ? 'blue' : 'green'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`
    },
    {
      title: 'Pages/Words',
      key: 'metrics',
      render: (record: Document) => (
        <Space>
          {record.pageCount && <Tag>{record.pageCount} pages</Tag>}
          {record.wordCount && <Tag>{record.wordCount} words</Tag>}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Document) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => previewDocument(record)}>
            Preview
          </Button>
          <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadDocument(record)}>
            Download
          </Button>
          <Button size="small" icon={<SwapOutlined />} onClick={() => {
            setSelectedConversionDoc(record);
            setConvertModalVisible(true);
          }}>
            Convert
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteDocument(record.id)}>
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Document Manager</Title>
      
      <Tabs defaultActiveKey="documents">
        <TabPane tab="Documents" key="documents">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Search and Filter Bar */}
              <Row gutter={16} align="middle">
                <Col flex={1}>
                  <Input
                    placeholder="Search documents..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col>
                  <Select
                    value={filterType}
                    onChange={setFilterType}
                    style={{ width: 120 }}
                  >
                    <Select.Option value="all">All Types</Select.Option>
                    <Select.Option value="pdf">PDF</Select.Option>
                    <Select.Option value="docx">Word</Select.Option>
                    <Select.Option value="txt">Text</Select.Option>
                    <Select.Option value="rtf">RTF</Select.Option>
                  </Select>
                </Col>
                <Col>
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: 120 }}
                  >
                    <Select.Option value="date">Date</Select.Option>
                    <Select.Option value="name">Name</Select.Option>
                    <Select.Option value="size">Size</Select.Option>
                  </Select>
                </Col>
              </Row>

              {/* Action Buttons */}
              <Row gutter={16}>
                <Col>
                  <Upload
                    beforeUpload={handleFileUpload}
                    showUploadList={false}
                    multiple
                  >
                    <Button icon={<UploadOutlined />} loading={uploading}>
                      Upload Documents
                    </Button>
                  </Upload>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    icon={<FileAddOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                  >
                    Create Word Document
                  </Button>
                </Col>
              </Row>

              {/* Upload Progress */}
              {uploading && (
                <div>
                  <Text>Uploading documents...</Text>
                  <Progress percent={uploadProgress} status="active" />
                </div>
              )}

              {/* Documents Table */}
              <Table
                columns={columns}
                dataSource={filteredDocuments}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Space>
          </Card>
        </TabPane>

        <TabPane tab="Conversions" key="conversions">
          <Card>
            <Title level={4}>Document Conversions</Title>
            <List
              dataSource={conversions}
              renderItem={(job) => (
                <List.Item>
                  <List.Item.Meta
                    title={`Convert ${job.sourceFile} to ${job.targetType.toUpperCase()}`}
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">Source: {job.sourceType}</Text>
                        <Progress 
                          percent={job.progress} 
                          status={job.status === 'failed' ? 'exception' : job.status === 'completed' ? 'success' : 'active'}
                        />
                        {job.result && <Text strong>Result: {job.result}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Create Word Document Modal */}
      <Modal
        title="Create Word Document"
        visible={createModalVisible}
        onOk={createWordDocument}
        onCancel={() => setCreateModalVisible(false)}
        width={800}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Document Title</Text>
            <Input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Enter document title..."
              style={{ marginTop: 8 }}
            />
          </div>
          
          <div>
            <Text strong>Template</Text>
            <Select
              value={docTemplate}
              onChange={setDocTemplate}
              style={{ width: '100%', marginTop: 8 }}
              options={documentTemplates}
            />
          </div>
          
          <div>
            <Text strong>Content</Text>
            <TextArea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Enter document content..."
              rows={10}
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      </Modal>

      {/* Convert Document Modal */}
      <Modal
        title="Convert Document"
        visible={convertModalVisible}
        onOk={convertDocument}
        onCancel={() => setConvertModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Selected Document</Text>
            <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              {selectedConversionDoc && (
                <Space>
                  {selectedConversionDoc.type === 'pdf' && <FilePdfOutlined />}
                  {selectedConversionDoc.type === 'docx' && <FileWordOutlined />}
                  {selectedConversionDoc.type === 'txt' && <FileTextOutlined />}
                  <Text>{selectedConversionDoc.name}</Text>
                </Space>
              )}
            </div>
          </div>
          
          <div>
            <Text strong>Convert To</Text>
            <Select
              value={conversionTarget}
              onChange={setConversionTarget}
              style={{ width: '100%', marginTop: 8 }}
              options={conversionTargets}
            />
          </div>
        </Space>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        title={selectedDocument?.name}
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => selectedDocument && downloadDocument(selectedDocument)}>
            Download
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedDocument && (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Tag color="blue">{selectedDocument.type.toUpperCase()}</Tag>
              <Text type="secondary">Size: {(selectedDocument.size / 1024 / 1024).toFixed(2)} MB</Text>
              {selectedDocument.pageCount && <Text>Pages: {selectedDocument.pageCount}</Text>}
              {selectedDocument.wordCount && <Text>Words: {selectedDocument.wordCount}</Text>}
            </Space>
            <Divider />
            <div style={{ maxHeight: 400, overflow: 'auto', padding: 16, backgroundColor: '#fafafa' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {selectedDocument.content || 'No content available for preview'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentManager;
