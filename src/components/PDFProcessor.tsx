import React, { useState } from 'react';
import { Card, Typography, Button, Space, Upload, message, List, Tag, Progress, Modal, Input } from 'antd';
import { 
  FilePdfOutlined, 
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  BookOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface PDFDocument {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  pageCount: number;
  extractedText: string;
  chapters: string[];
  moduleCode?: string;
}

const PDFProcessor: React.FC = () => {
  const [documents, setDocuments] = useState<PDFDocument[]>([
    {
      id: '1',
      name: 'AI_Fundamentals_Textbook.pdf',
      size: 5242880,
      uploadDate: new Date().toISOString(),
      pageCount: 156,
      extractedText: 'This is a comprehensive introduction to artificial intelligence...',
      chapters: ['Chapter 1: Introduction', 'Chapter 2: Machine Learning Basics', 'Chapter 3: Neural Networks'],
      moduleCode: 'CS301'
    }
  ]);
  
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<PDFDocument | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [moduleCode, setModuleCode] = useState('');
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [newChapter, setNewChapter] = useState('');

  
  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      message.error('Please upload a PDF file');
      return false;
    }

    setProcessing(true);
    setUploadProgress(0);

    // Simulate upload and processing
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const newDocument: PDFDocument = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        pageCount: Math.floor(Math.random() * 200) + 50,
        extractedText: `Extracted text from ${file.name}. This contains the full content of the PDF document including all chapters, sections, and important information about the subject matter.`,
        chapters: ['Chapter 1: Introduction', 'Chapter 2: Basic Concepts', 'Chapter 3: Advanced Topics'],
        moduleCode: moduleCode || undefined
      };

      setDocuments(prev => [newDocument, ...prev]);
      setProcessing(false);
      setUploadProgress(0);
      message.success(`PDF "${file.name}" processed successfully!`);
    }, 3000);

    return false; // Prevent default upload behavior
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
    message.success('Document deleted');
  };

  const viewDocument = (document: PDFDocument) => {
    setSelectedDocument(document);
    setPreviewVisible(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addChapter = () => {
    if (selectedDocument && newChapter.trim()) {
      const updatedDocument = {
        ...selectedDocument,
        chapters: [...selectedDocument.chapters, newChapter.trim()]
      };
      
      setSelectedDocument(updatedDocument);
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDocument.id ? updatedDocument : doc
      ));
      
      setNewChapter('');
      setChapterModalVisible(false);
      message.success('Chapter added');
    }
  };

  const removeChapter = (chapterIndex: number) => {
    if (selectedDocument) {
      const updatedDocument = {
        ...selectedDocument,
        chapters: selectedDocument.chapters.filter((_, index) => index !== chapterIndex)
      };
      
      setSelectedDocument(updatedDocument);
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDocument.id ? updatedDocument : doc
      ));
      
      message.success('Chapter removed');
    }
  };

  return (
    <Card title="PDF Upload & Processing" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Upload Section */}
        <div>
          <Title level={4}>Upload PDF Documents</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="Module Code (e.g., CS301)"
              value={moduleCode}
              onChange={(e) => setModuleCode(e.target.value)}
              style={{ maxWidth: 300 }}
            />
            
            <Upload
              accept=".pdf"
              beforeUpload={handleFileUpload}
              showUploadList={false}
              disabled={processing}
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={processing}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Upload PDF'}
              </Button>
            </Upload>

            {processing && (
              <div>
                <Text>Processing PDF...</Text>
                <Progress percent={uploadProgress} size="small" />
              </div>
            )}
          </Space>
        </div>

        {/* Documents List */}
        <div>
          <Title level={4}>Uploaded Documents</Title>
          <List
            dataSource={documents}
            renderItem={(document) => (
              <List.Item
                actions={[
                  <Button 
                    type="text" 
                    icon={<EyeOutlined />}
                    onClick={() => viewDocument(document)}
                  >
                    View
                  </Button>,
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteDocument(document.id)}
                  >
                    Delete
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />}
                  title={
                    <Space>
                      {document.name}
                      {document.moduleCode && <Tag color="blue">{document.moduleCode}</Tag>}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">
                        {formatFileSize(document.size)} • {document.pageCount} pages
                      </Text>
                      <Text type="secondary">
                        Uploaded {new Date(document.uploadDate).toLocaleDateString()}
                      </Text>
                      <Space wrap>
                        {document.chapters.slice(0, 2).map((chapter, index) => (
                          <Tag key={index} color="default" style={{ fontSize: '11px' }}>
                            {chapter}
                          </Tag>
                        ))}
                        {document.chapters.length > 2 && (
                          <Tag color="default" style={{ fontSize: '11px' }}>
                            +{document.chapters.length - 2} more
                          </Tag>
                        )}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>

        {/* Document Preview Modal */}
        <Modal
          title={
            <Space>
              <FileTextOutlined />
              {selectedDocument?.name}
              {selectedDocument?.moduleCode && <Tag color="blue">{selectedDocument.moduleCode}</Tag>}
            </Space>
          }
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={[
            <Button key="add-chapter" onClick={() => setChapterModalVisible(true)}>
              Add Chapter
            </Button>,
            <Button key="close" onClick={() => setPreviewVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedDocument && (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={5}>Document Information</Title>
                <Space direction="vertical" size="small">
                  <Text><strong>Size:</strong> {formatFileSize(selectedDocument.size)}</Text>
                  <Text><strong>Pages:</strong> {selectedDocument.pageCount}</Text>
                  <Text><strong>Uploaded:</strong> {new Date(selectedDocument.uploadDate).toLocaleString()}</Text>
                </Space>
              </div>

              <div>
                <Title level={5}>Chapters</Title>
                <List
                  size="small"
                  dataSource={selectedDocument.chapters}
                  renderItem={(chapter, index) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="text" 
                          danger
                          size="small"
                          onClick={() => removeChapter(index)}
                        >
                          Remove
                        </Button>
                      ]}
                    >
                      <Space>
                        <BookOutlined />
                        <Text>{chapter}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </div>

              <div>
                <Title level={5}>Extracted Text Preview</Title>
                <Paragraph
                  ellipsis={{ rows: 6, expandable: true }}
                  style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}
                >
                  {selectedDocument.extractedText}
                </Paragraph>
              </div>
            </Space>
          )}
        </Modal>

        {/* Add Chapter Modal */}
        <Modal
          title="Add Chapter"
          open={chapterModalVisible}
          onOk={addChapter}
          onCancel={() => {
            setChapterModalVisible(false);
            setNewChapter('');
          }}
        >
          <Input
            placeholder="Chapter name (e.g., Chapter 4: Advanced Algorithms)"
            value={newChapter}
            onChange={(e) => setNewChapter(e.target.value)}
            onPressEnter={addChapter}
          />
        </Modal>
      </Space>
    </Card>
  );
};

export default PDFProcessor;
