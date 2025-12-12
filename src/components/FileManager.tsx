import React, { useState } from 'react';
import { Card, Typography, Button, Space, Upload, Table, Tag, Modal, Input, Select, message, Row, Col } from 'antd';
import { UploadOutlined, FolderOutlined, FileOutlined, DeleteOutlined, DownloadOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: string;
  tags: string[];
  category: string;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Study Notes',
      type: 'folder',
      modified: '2024-01-15',
      tags: ['important', 'semester-1'],
      category: 'Academic'
    },
    {
      id: '2',
      name: 'Math Notes.pdf',
      type: 'file',
      size: 2048576,
      modified: '2024-01-14',
      tags: ['math', 'calculus'],
      category: 'Academic'
    },
    {
      id: '3',
      name: 'Project Ideas',
      type: 'folder',
      modified: '2024-01-13',
      tags: ['projects', 'ideas'],
      category: 'Personal'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const categories = ['all', 'Academic', 'Personal', 'Work', 'Projects'];

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = (file: File) => {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: file.name,
      type: 'file',
      size: file.size,
      modified: new Date().toISOString().split('T')[0],
      tags: [],
      category: 'Personal'
    };
    setFiles(prev => [newFile, ...prev]);
    message.success(`${file.name} uploaded successfully!`);
    return false; // Prevent default upload behavior
  };

  const createFolder = () => {
    if (!newFolderName.trim()) {
      message.error('Please enter a folder name');
      return;
    }

    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: newFolderName,
      type: 'folder',
      modified: new Date().toISOString().split('T')[0],
      tags: [],
      category: 'Personal'
    };

    setFiles(prev => [newFolder, ...prev]);
    message.success('Folder created successfully!');
    setNewFolderModalVisible(false);
    setNewFolderName('');
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    message.success('File deleted successfully!');
  };

  const downloadFile = (file: FileItem) => {
    message.success(`Downloading ${file.name}...`);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: FileItem) => (
        <Space>
          {record.type === 'folder' ? <FolderOutlined /> : <FileOutlined />}
          <span>{name}</span>
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size?: number) => formatFileSize(size)
    },
    {
      title: 'Modified',
      dataIndex: 'modified',
      key: 'modified'
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>
          ))}
        </>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: FileItem) => (
        <Space>
          <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadFile(record)}>
            Download
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteFile(record.id)}>
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>File Manager</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search files..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
            >
              {categories.map(category => (
                <Option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space>
              <Button icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
                Upload
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => setNewFolderModalVisible(true)}>
                New Folder
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredFiles}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Upload Files"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Upload.Dragger
          multiple
          beforeUpload={handleUpload}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48 }} />
          </p>
          <p className="ant-upload-text">Click or drag files to this area to upload</p>
          <p className="ant-upload-hint">Support for single or bulk upload</p>
        </Upload.Dragger>
      </Modal>

      <Modal
        title="Create New Folder"
        open={newFolderModalVisible}
        onOk={createFolder}
        onCancel={() => setNewFolderModalVisible(false)}
      >
        <Input
          placeholder="Enter folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onPressEnter={createFolder}
        />
      </Modal>
    </div>
  );
};

export default FileManager;
