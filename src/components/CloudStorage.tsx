import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, Space, Modal, Input, Select, message, Progress, Upload, Row, Col, Tabs, Badge, Tooltip, Tag, Divider, Dropdown, Switch, Statistic, Checkbox, Image, Spin, Alert, List, Avatar } from 'antd';
import { 
  CloudOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FolderOutlined,
  FileOutlined,
  ShareAltOutlined,
  SyncOutlined,
  SettingOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  LinkOutlined,
  TeamOutlined,
  DatabaseOutlined,
  HddOutlined,
  SearchOutlined,
  HistoryOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  ClearOutlined,
  CompressOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;

interface CloudFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  mime: string;
  createdAt: string;
  modifiedAt: string;
  shared: boolean;
  public: boolean;
  encrypted: boolean;
  path: string;
  parentId?: string;
  permissions: {
    canEdit: boolean;
    canShare: boolean;
    canDelete: boolean;
  };
  version: number;
  checksum: string;
}

interface SharedLink {
  id: string;
  fileId: string;
  fileName: string;
  url: string;
  password?: string;
  expiresAt?: string;
  downloadLimit?: number;
  downloadCount: number;
  permissions: 'view' | 'edit' | 'comment';
  createdAt: string;
}

interface SyncStatus {
  lastSync: string;
  status: 'synced' | 'syncing' | 'error';
  filesToSync: number;
  totalFiles: number;
  uploadSpeed: number;
  downloadSpeed: number;
}

interface StorageQuota {
  used: number;
  total: number;
  files: number;
  folders: number;
  shared: number;
}

interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  size: number;
  createdAt: string;
  modifiedAt: string;
  checksum: string;
  changelog: string;
}

interface SearchFilters {
  query: string;
  fileType: string;
  dateRange: [string, string] | null;
  sizeRange: [number, number] | null;
  tags: string[];
  sharedOnly: boolean;
  encryptedOnly: boolean;
}

interface DuplicateGroup {
  id: string;
  files: CloudFile[];
  totalSize: number;
  recommendedAction: 'keep_all' | 'keep_newest' | 'keep_largest' | 'merge';
}

const CloudStorage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('files');
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [storageQuota] = useState<StorageQuota>({
    used: 15.6,
    total: 100,
    files: 1234,
    folders: 89,
    shared: 23
  });
  const [syncStatus] = useState<SyncStatus>({
    lastSync: '2024-01-15 10:30:00',
    status: 'synced',
    filesToSync: 0,
    totalFiles: 1323,
    uploadSpeed: 0,
    downloadSpeed: 0
  });

  // New enhanced features state
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<CloudFile | null>(null);
  const [fileVersions, setFileVersions] = useState<FileVersion[]>([]);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    fileType: 'all',
    dateRange: null,
    sizeRange: null,
    tags: [],
    sharedOnly: false,
    encryptedOnly: false
  });
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [compressionModalVisible, setCompressionModalVisible] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [realtimeSyncEnabled, setRealtimeSyncEnabled] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Mock file data
    setFiles([
      {
        id: '1',
        name: 'Study Notes.pdf',
        type: 'file',
        size: 2048576,
        mime: 'application/pdf',
        createdAt: '2024-01-10 09:15:00',
        modifiedAt: '2024-01-14 16:30:00',
        shared: true,
        public: false,
        encrypted: true,
        path: '/documents/study/',
        permissions: { canEdit: true, canShare: true, canDelete: true },
        version: 3,
        checksum: 'sha256:abc123...'
      },
      {
        id: '2',
        name: 'Project Files',
        type: 'folder',
        size: 10485760,
        mime: 'folder',
        createdAt: '2024-01-08 14:20:00',
        modifiedAt: '2024-01-15 08:45:00',
        shared: false,
        public: false,
        encrypted: false,
        path: '/projects/',
        permissions: { canEdit: true, canShare: true, canDelete: true },
        version: 1,
        checksum: 'sha256:def456...'
      },
      {
        id: '3',
        name: 'Presentation.pptx',
        type: 'file',
        size: 5242880,
        mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        createdAt: '2024-01-12 11:00:00',
        modifiedAt: '2024-01-13 15:20:00',
        shared: true,
        public: true,
        encrypted: true,
        path: '/presentations/',
        permissions: { canEdit: true, canShare: true, canDelete: false },
        version: 2,
        checksum: 'sha256:ghi789...'
      }
    ]);

    // Mock shared links
    setSharedLinks([
      {
        id: '1',
        fileId: '1',
        fileName: 'Study Notes.pdf',
        url: 'https://cloud.notefusion.ai/share/abc123',
        password: 'study2024',
        expiresAt: '2024-02-15 23:59:59',
        downloadLimit: 10,
        downloadCount: 3,
        permissions: 'view',
        createdAt: '2024-01-14 10:00:00'
      },
      {
        id: '2',
        fileId: '3',
        fileName: 'Presentation.pptx',
        url: 'https://cloud.notefusion.ai/public/def456',
        permissions: 'view',
        downloadCount: 0,
        createdAt: '2024-01-13 16:30:00'
      }
    ]);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mime: string, type: string) => {
    if (type === 'folder') return <FolderOutlined />;
    
    if (mime.startsWith('image/')) return <FileOutlined style={{ color: '#52c41a' }} />;
    if (mime.startsWith('video/')) return <FileOutlined style={{ color: '#722ed1' }} />;
    if (mime.startsWith('audio/')) return <FileOutlined style={{ color: '#faad14' }} />;
    if (mime.includes('pdf')) return <FileOutlined style={{ color: '#ff4d4f' }} />;
    if (mime.includes('document') || mime.includes('spreadsheet') || mime.includes('presentation')) {
      return <FileOutlined style={{ color: '#1890ff' }} />;
    }
    
    return <FileOutlined />;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      synced: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      syncing: <SyncOutlined spin style={{ color: '#1890ff' }} />,
      error: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
    };
    return icons[status as keyof typeof icons] || <CheckCircleOutlined />;
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    action: '/api/upload',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  // Enhanced Features Functions
  
  // Batch Operations
  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedFiles.length === 0) {
      message.warning('Please select files to delete');
      return;
    }
    
    Modal.confirm({
      title: `Delete ${selectedFiles.length} files?`,
      content: 'This action cannot be undone.',
      onOk: () => {
        setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
        setSelectedFiles([]);
        message.success('Files deleted successfully');
      }
    });
  };

  const handleBatchShare = () => {
    if (selectedFiles.length === 0) {
      message.warning('Please select files to share');
      return;
    }
    setShareModalVisible(true);
  };

  // File Preview
  const handlePreview = (file: CloudFile) => {
    setPreviewFile(file);
    setPreviewModalVisible(true);
  };

  const getFilePreviewComponent = (file: CloudFile) => {
    if (file.mime.startsWith('image/')) {
      return (
        <Image
          src={`https://via.placeholder.com/600x400?text=${file.name}`}
          alt={file.name}
          style={{ maxWidth: '100%', maxHeight: '400px' }}
        />
      );
    }
    
    if (file.mime === 'application/pdf') {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FilePdfOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
          <div style={{ marginTop: '16px' }}>
            <Text>PDF Preview: {file.name}</Text>
            <br />
            <Button type="primary" style={{ marginTop: '8px' }}>
              Open PDF Viewer
            </Button>
          </div>
        </div>
      );
    }
    
    if (file.mime.startsWith('video/')) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FileOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
          <div style={{ marginTop: '16px' }}>
            <Text>Video Preview: {file.name}</Text>
            <br />
            <Button type="primary" icon={<PlayCircleOutlined />} style={{ marginTop: '8px' }}>
              Play Video
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <FileOutlined style={{ fontSize: '64px' }} />
        <div style={{ marginTop: '16px' }}>
          <Text>No preview available for {file.name}</Text>
        </div>
      </div>
    );
  };

  // File Versioning
  const handleShowVersions = (file: CloudFile) => {
    setSelectedFile(file);
    setFileVersions([
      {
        id: 'v1',
        fileId: file.id,
        version: 1,
        size: file.size * 0.8,
        createdAt: '2024-01-10 09:15:00',
        modifiedAt: '2024-01-10 09:15:00',
        checksum: 'sha256:old123...',
        changelog: 'Initial version'
      },
      {
        id: 'v2',
        fileId: file.id,
        version: 2,
        size: file.size * 0.9,
        createdAt: '2024-01-12 14:30:00',
        modifiedAt: '2024-01-12 14:30:00',
        checksum: 'sha256:mid456...',
        changelog: 'Added new content'
      },
      {
        id: 'v3',
        fileId: file.id,
        version: 3,
        size: file.size,
        createdAt: file.modifiedAt,
        modifiedAt: file.modifiedAt,
        checksum: file.checksum,
        changelog: 'Final updates'
      }
    ]);
    setVersionModalVisible(true);
  };

  const handleRestoreVersion = (version: FileVersion) => {
    Modal.confirm({
      title: 'Restore Version',
      content: `Restore to version ${version.version} from ${version.createdAt}?`,
      onOk: () => {
        message.success('File restored successfully');
        setVersionModalVisible(false);
      }
    });
  };

  // Advanced Search
  const handleSearch = () => {
    let filteredFiles = files;
    
    if (searchFilters.query) {
      filteredFiles = filteredFiles.filter(file => 
        file.name.toLowerCase().includes(searchFilters.query.toLowerCase())
      );
    }
    
    if (searchFilters.fileType !== 'all') {
      filteredFiles = filteredFiles.filter(file => 
        file.mime.startsWith(searchFilters.fileType)
      );
    }
    
    if (searchFilters.sharedOnly) {
      filteredFiles = filteredFiles.filter(file => file.shared);
    }
    
    if (searchFilters.encryptedOnly) {
      filteredFiles = filteredFiles.filter(file => file.encrypted);
    }
    
    setFiles(filteredFiles);
    setSearchModalVisible(false);
    message.success(`Found ${filteredFiles.length} files`);
  };

  // Real-time Sync
  const handleToggleSync = () => {
    if (realtimeSyncEnabled) {
      setIsSyncing(false);
      setRealtimeSyncEnabled(false);
      message.info('Real-time sync disabled');
    } else {
      setIsSyncing(true);
      setRealtimeSyncEnabled(true);
      message.info('Real-time sync enabled');
      
      // Simulate sync progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setSyncProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          message.success('Sync completed successfully');
        }
      }, 500);
    }
  };

  // Smart Compression
  const handleCompressFiles = () => {
    if (selectedFiles.length === 0) {
      message.warning('Please select files to compress');
      return;
    }
    
    setIsCompressing(true);
    setCompressionModalVisible(true);
    
    // Simulate compression
    setTimeout(() => {
      setIsCompressing(false);
      setCompressionModalVisible(false);
      message.success('Files compressed successfully');
      setSelectedFiles([]);
    }, 3000);
  };

  // Duplicate Detection
  const handleFindDuplicates = () => {
    const duplicates: DuplicateGroup[] = [
      {
        id: 'dup1',
        files: files.slice(0, 2),
        totalSize: files[0].size + files[1].size,
        recommendedAction: 'keep_newest'
      }
    ];
    setDuplicateGroups(duplicates);
    message.success(`Found ${duplicates.length} duplicate groups`);
  };

  const fileColumns = [
    {
      title: (
        <Checkbox
          checked={selectedFiles.length === files.length && files.length > 0}
          indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
          onChange={handleSelectAll}
        />
      ),
      key: 'select',
      render: (record: CloudFile) => (
        <Checkbox
          checked={selectedFiles.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedFiles(prev => [...prev, record.id]);
            } else {
              setSelectedFiles(prev => prev.filter(id => id !== record.id));
            }
          }}
        />
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: CloudFile) => (
        <Space>
          {getFileIcon(record.mime, record.type)}
          <div>
            <Text strong style={{ cursor: 'pointer' }} onClick={() => handlePreview(record)}>
              {name}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.path}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size)
    },
    {
      title: 'Modified',
      dataIndex: 'modifiedAt',
      key: 'modifiedAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: number, record: CloudFile) => (
        <Button type="link" size="small" onClick={() => handleShowVersions(record)}>
          v{version}
        </Button>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: CloudFile) => (
        <Space>
          {record.encrypted && <Tooltip title="Encrypted"><SafetyOutlined style={{ color: '#52c41a' }} /></Tooltip>}
          {record.shared && <Tooltip title="Shared"><TeamOutlined style={{ color: '#1890ff' }} /></Tooltip>}
          {record.public && <Tooltip title="Public"><TeamOutlined style={{ color: '#722ed1' }} /></Tooltip>}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: CloudFile) => (
        <Space>
          <Tooltip title="Preview">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handlePreview(record)} />
          </Tooltip>
          <Tooltip title="Download">
            <Button type="text" icon={<DownloadOutlined />} onClick={() => {
              message.info(`Downloading ${record.name}`);
            }} />
          </Tooltip>
          <Tooltip title="Share">
            <Button type="text" icon={<ShareAltOutlined />} onClick={() => {
              setSelectedFile(record);
              setShareModalVisible(true);
            }} />
          </Tooltip>
          <Tooltip title="View">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'rename', label: 'Rename', icon: <EditOutlined /> },
                { key: 'copy', label: 'Copy', icon: <CopyOutlined /> },
                { key: 'move', label: 'Move', icon: <FolderOutlined /> },
                { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true }
              ]
            }}
          >
            <Button type="text" icon={<SettingOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  const sharedLinksColumns = [
    {
      title: 'File',
      dataIndex: 'fileName',
      key: 'fileName'
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => (
        <Space>
          <Text code style={{ fontSize: '12px' }}>{url}</Text>
          <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => {
            navigator.clipboard.writeText(url);
            message.success('Link copied to clipboard');
          }} />
        </Space>
      )
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string) => (
        <Tag color={permissions === 'edit' ? 'green' : permissions === 'comment' ? 'orange' : 'blue'}>
          {permissions.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Downloads',
      key: 'downloads',
      render: (record: SharedLink) => (
        <Text>
          {record.downloadCount}
          {record.downloadLimit && ` / ${record.downloadLimit}`}
        </Text>
      )
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: SharedLink) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => {
            window.open(record.url, '_blank');
          }} />
          <Button type="text" icon={<DeleteOutlined />} danger onClick={() => {
            setSharedLinks(prev => prev.filter(link => link.id !== record.id));
            message.success('Link removed');
          }} />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <Space>
            <CloudOutlined />
            Cloud Storage
          </Space>
        </Title>
        <Space>
          <Badge count={syncStatus.filesToSync} offset={[10, 0]}>
            <Button 
              icon={isSyncing ? <SyncOutlined spin /> : <SyncOutlined />}
              onClick={handleToggleSync}
              type={realtimeSyncEnabled ? 'primary' : 'default'}
            >
              {isSyncing ? 'Syncing...' : realtimeSyncEnabled ? 'Sync On' : 'Sync Off'}
            </Button>
          </Badge>
          <Button icon={<SearchOutlined />} onClick={() => setSearchModalVisible(true)}>
            Search
          </Button>
          <Button icon={<CompressOutlined />} onClick={handleCompressFiles} disabled={selectedFiles.length === 0}>
            Compress
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleFindDuplicates}>
            Find Duplicates
          </Button>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalVisible(true)}>
            Upload Files
          </Button>
        </Space>
      </div>

      {/* Enhanced Toolbar */}
      {selectedFiles.length > 0 && (
        <Alert
          message={`${selectedFiles.length} files selected`}
          description={
            <Space>
              <Button size="small" onClick={handleBatchShare}>
                <ShareAltOutlined /> Share
              </Button>
              <Button size="small" onClick={handleBatchDelete} danger>
                <DeleteOutlined /> Delete
              </Button>
              <Button size="small" onClick={() => setSelectedFiles([])}>
                <ClearOutlined /> Clear Selection
              </Button>
            </Space>
          }
          type="info"
          style={{ marginBottom: '16px' }}
          closable
          onClose={() => setSelectedFiles([])}
        />
      )}

      {/* Sync Progress */}
      {isSyncing && (
        <Alert
          message="Syncing files..."
          description={
            <Progress percent={syncProgress} size="small" />
          }
          type="info"
          style={{ marginBottom: '16px' }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Storage Used"
              value={storageQuota.used}
              suffix={`/ ${storageQuota.total} GB`}
              prefix={<HddOutlined />}
              valueStyle={{ color: storageQuota.used > 80 ? '#ff4d4f' : '#1890ff' }}
            />
            <Progress 
              percent={(storageQuota.used / storageQuota.total) * 100} 
              size="small" 
              style={{ marginTop: '8px' }}
              strokeColor={storageQuota.used > 80 ? '#ff4d4f' : '#1890ff'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Files"
              value={storageQuota.files}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Folders"
              value={storageQuota.folders}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Shared"
              value={storageQuota.shared}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="My Files" key="files">
          <Card title="Files and Folders" extra={
            <Space>
              <Select defaultValue="all" style={{ width: 120 }}>
                <Option value="all">All Files</Option>
                <Option value="documents">Documents</Option>
                <Option value="images">Images</Option>
                <Option value="videos">Videos</Option>
                <Option value="folders">Folders</Option>
              </Select>
              <Button icon={<DatabaseOutlined />}>Backup</Button>
            </Space>
          }>
            <Table
              dataSource={files}
              columns={fileColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Shared Links" key="shared">
          <Card title="Shared Links" extra={
            <Button type="primary" icon={<LinkOutlined />}>
              Create Link
            </Button>
          }>
            <Table
              dataSource={sharedLinks}
              columns={sharedLinksColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Sync Status" key="sync">
          <Card title="Sync Information">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={5}>Last Sync</Title>
                <Space>
                  {getStatusIcon(syncStatus.status)}
                  <Text>{new Date(syncStatus.lastSync).toLocaleString()}</Text>
                </Space>
              </div>

              <div>
                <Title level={5}>Progress</Title>
                <Progress 
                  percent={((syncStatus.totalFiles - syncStatus.filesToSync) / syncStatus.totalFiles) * 100}
                  format={() => `${syncStatus.totalFiles - syncStatus.filesToSync} / ${syncStatus.totalFiles} files`}
                />
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Upload Speed"
                    value={syncStatus.uploadSpeed}
                    suffix="MB/s"
                    prefix={<UploadOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Download Speed"
                    value={syncStatus.downloadSpeed}
                    suffix="MB/s"
                    prefix={<DownloadOutlined />}
                  />
                </Col>
              </Row>

              {syncStatus.status === 'error' && (
                <Alert
                  message="Sync Error"
                  description="There was an error syncing your files. Please check your connection."
                  type="error"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </TabPane>

        <TabPane tab="Settings" key="settings">
          <Card title="Cloud Settings">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={5}>Sync Preferences</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Auto Sync</Text>
                      <br />
                      <Text type="secondary">Automatically sync files when changes are detected</Text>
                    </div>
                    <Select defaultValue="realtime" style={{ width: 120 }}>
                      <Option value="realtime">Real-time</Option>
                      <Option value="hourly">Hourly</Option>
                      <Option value="daily">Daily</Option>
                      <Option value="manual">Manual</Option>
                    </Select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Sync Large Files</Text>
                      <br />
                      <Text type="secondary">Include files larger than 100MB</Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </Space>
              </div>

              <Divider />

              <div>
                <Title level={5}>Security</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>End-to-End Encryption</Text>
                      <br />
                      <Text type="secondary">Encrypt files before uploading</Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Two-Factor Authentication</Text>
                      <br />
                      <Text type="secondary">Require 2FA for sensitive operations</Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </Space>
              </div>

              <Divider />

              <div>
                <Title level={5}>Storage Management</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Auto Cleanup</Text>
                      <br />
                      <Text type="secondary">Remove deleted files after 30 days</Text>
                    </div>
                    <Switch />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Compression</Text>
                      <br />
                      <Text type="secondary">Compress files to save space</Text>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </Space>
              </div>
            </Space>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="Share File"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setShareModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="create" type="primary" onClick={() => {
            message.success('Share link created successfully');
            setShareModalVisible(false);
          }}>
            Create Link
          </Button>
        ]}
      >
        {selectedFile && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>File:</Text> {selectedFile.name}
            </div>
            
            <div>
              <Text strong>Link Type:</Text>
              <Select defaultValue="private" style={{ width: '100%', marginTop: '8px' }}>
                <Option value="private">Private (Password Protected)</Option>
                <Option value="public">Public (Anyone with link)</Option>
                <Option value="team">Team Members Only</Option>
              </Select>
            </div>

            <div>
              <Text strong>Permissions:</Text>
              <Select defaultValue="view" style={{ width: '100%', marginTop: '8px' }}>
                <Option value="view">Can View</Option>
                <Option value="comment">Can Comment</Option>
                <Option value="edit">Can Edit</Option>
              </Select>
            </div>

            <div>
              <Text strong>Expiration:</Text>
              <Select defaultValue="7days" style={{ width: '100%', marginTop: '8px' }}>
                <Option value="1day">1 Day</Option>
                <Option value="7days">7 Days</Option>
                <Option value="30days">30 Days</Option>
                <Option value="never">Never</Option>
              </Select>
            </div>

            <div>
              <Text strong>Download Limit:</Text>
              <Input placeholder="Unlimited" style={{ marginTop: '8px' }} />
            </div>
          </Space>
        )}
      </Modal>

      <Modal
        title="Upload Files"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setUploadModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="upload" type="primary" onClick={() => {
            message.success('Files uploaded successfully');
            setUploadModalVisible(false);
          }}>
            Upload
          </Button>
        ]}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <CloudOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">Click or drag files to this area to upload</p>
          <p className="ant-upload-hint">Support for single or bulk upload. Strictly prohibit from uploading company data or other banned files.</p>
        </Dragger>
      </Modal>

      {/* File Preview Modal */}
      <Modal
        title={previewFile?.name}
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />}>
            Download
          </Button>,
          <Button key="share" icon={<ShareAltOutlined />}>
            Share
          </Button>,
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {previewFile && getFilePreviewComponent(previewFile)}
      </Modal>

      {/* File Versions Modal */}
      <Modal
        title={`File Versions - ${selectedFile?.name}`}
        open={versionModalVisible}
        onCancel={() => setVersionModalVisible(false)}
        footer={null}
        width={800}
      >
        <List
          dataSource={fileVersions}
          renderItem={(version) => (
            <List.Item
              actions={[
                <Button key="restore" onClick={() => handleRestoreVersion(version)}>
                  Restore
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<HistoryOutlined />} />}
                title={`Version ${version.version}`}
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">{version.changelog}</Text>
                    <Text type="secondary">Size: {formatFileSize(version.size)}</Text>
                    <Text type="secondary">Modified: {new Date(version.modifiedAt).toLocaleString()}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* Advanced Search Modal */}
      <Modal
        title="Advanced Search"
        open={searchModalVisible}
        onCancel={() => setSearchModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSearchModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="search" type="primary" onClick={handleSearch}>
            Search
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Search Query:</Text>
            <Input
              placeholder="Enter filename or keywords..."
              value={searchFilters.query}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
              style={{ marginTop: '8px' }}
            />
          </div>

          <div>
            <Text strong>File Type:</Text>
            <Select
              value={searchFilters.fileType}
              onChange={(value) => setSearchFilters(prev => ({ ...prev, fileType: value }))}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Option value="all">All Files</Option>
              <Option value="image">Images</Option>
              <Option value="video">Videos</Option>
              <Option value="audio">Audio</Option>
              <Option value="document">Documents</Option>
              <Option value="application/pdf">PDFs</Option>
            </Select>
          </div>

          <div>
            <Text strong>Filters:</Text>
            <Space direction="vertical" style={{ width: '100%', marginTop: '8px' }}>
              <Checkbox
                checked={searchFilters.sharedOnly}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, sharedOnly: e.target.checked }))}
              >
                Shared files only
              </Checkbox>
              <Checkbox
                checked={searchFilters.encryptedOnly}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, encryptedOnly: e.target.checked }))}
              >
                Encrypted files only
              </Checkbox>
            </Space>
          </div>
        </Space>
      </Modal>

      {/* Compression Progress Modal */}
      <Modal
        title="Compressing Files"
        open={compressionModalVisible}
        closable={false}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }} align="center">
          <Spin size="large" />
          <Text>Compressing {selectedFiles.length} files...</Text>
          <Progress percent={isCompressing ? 75 : 100} />
          <Text type="secondary">This may take a few moments</Text>
        </Space>
      </Modal>

      {/* Duplicates Found Modal */}
      {duplicateGroups.length > 0 && (
        <Modal
          title={`Found ${duplicateGroups.length} Duplicate Groups`}
          open={true}
          onCancel={() => setDuplicateGroups([])}
          footer={[
            <Button key="close" onClick={() => setDuplicateGroups([])}>
              Close
            </Button>
          ]}
          width={800}
        >
          <List
            dataSource={duplicateGroups}
            renderItem={(group) => (
              <List.Item>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Duplicate Group ({group.files.length} files, {formatFileSize(group.totalSize)})</Text>
                  <List
                    size="small"
                    dataSource={group.files}
                    renderItem={(file) => (
                      <List.Item>
                        <Space>
                          {getFileIcon(file.mime, file.type)}
                          <Text>{file.name}</Text>
                          <Text type="secondary">{formatFileSize(file.size)}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                  <Space>
                    <Button size="small">Keep All</Button>
                    <Button size="small">Keep Newest</Button>
                    <Button size="small" danger>Delete Duplicates</Button>
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        </Modal>
      )}
    </div>
  );
};

export default CloudStorage;
