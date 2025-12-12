import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Upload, 
  message, 
  Progress, 
  List, 
  Modal, 
  Select, 
  Row, 
  Col,
  Alert,
  Tag
} from 'antd';
import { 
  FilePdfOutlined, 
  FileWordOutlined,
  FileTextOutlined,
  FileImageOutlined,
  SwapOutlined,
  UploadOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  LoadingOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface ConversionJob {
  id: string;
  fileName: string;
  sourceFormat: string;
  targetFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileSize: number;
  downloadUrl?: string;
  error?: string;
}

const DocumentConverter: React.FC = () => {
  const [conversions, setConversions] = useState<ConversionJob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('pdf');
  const [convertModalVisible, setConvertModalVisible] = useState(false);

  const supportedFormats = {
    pdf: {
      name: 'PDF Document',
      icon: <FilePdfOutlined />,
      description: 'Portable Document Format',
      canConvertTo: ['docx', 'txt', 'html', 'jpg', 'png']
    },
    docx: {
      name: 'Word Document',
      icon: <FileWordOutlined />,
      description: 'Microsoft Word Document',
      canConvertTo: ['pdf', 'txt', 'html', 'rtf']
    },
    txt: {
      name: 'Text File',
      icon: <FileTextOutlined />,
      description: 'Plain Text Document',
      canConvertTo: ['pdf', 'docx', 'html', 'rtf']
    },
    html: {
      name: 'HTML Document',
      icon: <FileTextOutlined />,
      description: 'HyperText Markup Language',
      canConvertTo: ['pdf', 'docx', 'txt']
    },
    rtf: {
      name: 'Rich Text Format',
      icon: <FileTextOutlined />,
      description: 'Rich Text Document',
      canConvertTo: ['pdf', 'docx', 'txt', 'html']
    },
    jpg: {
      name: 'JPEG Image',
      icon: <FileImageOutlined />,
      description: 'JPEG Image File',
      canConvertTo: ['pdf', 'png', 'txt']
    },
    png: {
      name: 'PNG Image',
      icon: <FileImageOutlined />,
      description: 'PNG Image File',
      canConvertTo: ['pdf', 'jpg', 'txt']
    }
  };

  const getFileFormat = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension || '';
  };

  const handleFileSelect = (file: File) => {
    const format = getFileFormat(file.name);
    if (!supportedFormats[format as keyof typeof supportedFormats]) {
      message.error('Unsupported file format. Please upload PDF, Word, Text, HTML, RTF, or image files.');
      return false;
    }
    
    setSelectedFile(file);
    setConvertModalVisible(true);
    return false; // Prevent default upload
  };

  const startConversion = () => {
    if (!selectedFile) {
      message.error('Please select a file to convert');
      return;
    }

    const sourceFormat = getFileFormat(selectedFile.name);
    const conversionJob: ConversionJob = {
      id: Date.now().toString(),
      fileName: selectedFile.name,
      sourceFormat,
      targetFormat,
      status: 'processing',
      progress: 0,
      fileSize: selectedFile.size
    };

    setConversions(prev => [conversionJob, ...prev]);
    setConvertModalVisible(false);
    setSelectedFile(null);

    // Simulate conversion process
    simulateConversion(conversionJob);
  };

  const simulateConversion = (job: ConversionJob) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Create download URL (simulated)
        const downloadUrl = URL.createObjectURL(new Blob(['Converted content'], { type: 'application/octet-stream' }));
        
        setConversions(prev => prev.map(j => 
          j.id === job.id 
            ? { 
                ...j, 
                status: 'completed',
                progress: 100,
                downloadUrl
              }
            : j
        ));
        
        message.success(`Successfully converted ${job.fileName} to ${job.targetFormat.toUpperCase()}!`);
      } else {
        setConversions(prev => prev.map(j => 
          j.id === job.id 
            ? { ...j, progress }
            : j
        ));
      }
    }, 300);
  };

  const downloadConvertedFile = (job: ConversionJob) => {
    if (job.downloadUrl) {
      const link = document.createElement('a');
      link.href = job.downloadUrl;
      link.download = `${job.fileName.replace(/\.[^/.]+$/, '')}.${job.targetFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Download started!');
    }
  };

  const deleteConversion = (jobId: string) => {
    setConversions(prev => prev.filter(job => job.id !== jobId));
    message.success('Conversion removed from history');
  };

  const retryConversion = (job: ConversionJob) => {
    setConversions(prev => prev.map(j => 
      j.id === job.id 
        ? { ...j, status: 'processing', progress: 0, error: undefined }
        : j
    ));
    simulateConversion(job);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'processing':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'failed':
        return <DeleteOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <SwapOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'processing';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Document Converter</Title>
      
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Upload Section */}
          <div>
            <Title level={4}>Convert Documents</Title>
            <Paragraph>
              Convert your documents between different formats. Supports PDF, Word, Text, HTML, RTF, and image files.
            </Paragraph>
            
            <Upload
              beforeUpload={handleFileSelect}
              showUploadList={false}
              multiple={false}
              accept=".pdf,.docx,.txt,.html,.rtf,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />} size="large">
                Select File to Convert
              </Button>
            </Upload>
          </div>

          {/* Supported Formats */}
          <div>
            <Title level={4}>Supported Formats</Title>
            <Row gutter={[16, 16]}>
              {Object.entries(supportedFormats).map(([format, info]) => (
                <Col span={6} key={format}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>
                      {info.icon}
                    </div>
                    <Title level={5} style={{ margin: 0 }}>
                      {format.toUpperCase()}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {info.name}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ fontSize: 11 }}>Converts to:</Text>
                      <div>
                        {info.canConvertTo.slice(0, 3).map(target => (
                          <Tag key={target} style={{ margin: '2px', fontSize: '12px' }}>
                            {target}
                          </Tag>
                        ))}
                        {info.canConvertTo.length > 3 && (
                          <Tag style={{ margin: '2px', fontSize: '12px' }}>+{info.canConvertTo.length - 3}</Tag>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Conversion History */}
          <div>
            <Title level={4}>Conversion History</Title>
            {conversions.length === 0 ? (
              <Alert
                message="No conversions yet"
                description="Upload a file and start converting to see your conversion history."
                type="info"
                showIcon
              />
            ) : (
              <List
                dataSource={conversions}
                renderItem={(job) => (
                  <List.Item
                    actions={[
                      job.status === 'completed' && (
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={() => downloadConvertedFile(job)}
                        >
                          Download
                        </Button>
                      ),
                      job.status === 'failed' && (
                        <Button
                          type="primary"
                          onClick={() => retryConversion(job)}
                        >
                          Retry
                        </Button>
                      ),
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteConversion(job.id)}
                      >
                        Delete
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={getStatusIcon(job.status)}
                      title={
                        <Space>
                          <Text strong>{job.fileName}</Text>
                          <Tag color={getStatusColor(job.status)}>
                            {job.status.toUpperCase()}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text type="secondary">
                            {job.sourceFormat.toUpperCase()} → {job.targetFormat.toUpperCase()} • {formatFileSize(job.fileSize)}
                          </Text>
                          {job.status === 'processing' && (
                            <Progress percent={Math.round(job.progress)} status="active" size="small" />
                          )}
                          {job.status === 'completed' && (
                            <Progress percent={100} status="success" size="small" />
                          )}
                          {job.status === 'failed' && (
                            <Progress percent={job.progress} status="exception" size="small" />
                          )}
                          {job.error && (
                            <Text type="danger" style={{ fontSize: 12 }}>
                              Error: {job.error}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </Space>
      </Card>

      {/* Conversion Modal */}
      <Modal
        title="Convert Document"
        visible={convertModalVisible}
        onOk={startConversion}
        onCancel={() => {
          setConvertModalVisible(false);
          setSelectedFile(null);
        }}
        okText="Start Conversion"
        cancelText="Cancel"
      >
        {selectedFile && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Selected File:</Text>
              <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                <Space>
                  {(supportedFormats[getFileFormat(selectedFile.name) as keyof typeof supportedFormats]?.icon) || <FileTextOutlined />}
                  <Text>{selectedFile.name}</Text>
                  <Text type="secondary">({formatFileSize(selectedFile.size)})</Text>
                </Space>
              </div>
            </div>

            <div>
              <Text strong>Convert to:</Text>
              <Select
                value={targetFormat}
                onChange={setTargetFormat}
                style={{ width: '100%', marginTop: 8 }}
              >
                {supportedFormats[getFileFormat(selectedFile.name) as keyof typeof supportedFormats]?.canConvertTo.map(format => (
                  <Option key={format} value={format}>
                    <Space>
                      {(supportedFormats[format as keyof typeof supportedFormats]?.icon) || <FileTextOutlined />}
                      {format.toUpperCase()}
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>

            <Alert
              message="Conversion Process"
              description="The conversion will take a few moments depending on the file size and format. You'll be notified when it's complete."
              type="info"
              showIcon
            />
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default DocumentConverter;
