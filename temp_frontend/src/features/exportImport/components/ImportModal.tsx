import React, { useState } from 'react';
import { Modal, Upload, Button, Typography, Progress, message, Card, List } from 'antd';
import { InboxOutlined, FileOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
<<<<<<< HEAD
import styles from './ImportModal.module.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

const { Dragger } = Upload;
const { Text } = Typography;

interface ImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onImport: (files: File[]) => Promise<any>;
  loading?: boolean;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onCancel,
  onImport,
  loading = false,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    importedCount: number;
    errors: string[];
    importedNotes: any[];
  } | null>(null);
  const [progress] = useState(0);

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.warning('Please select files to import');
      return;
    }

    try {
      const files = fileList.map(file => (file as any).originFileObj || file);
      const result = await onImport(files);
      if (result) {
        setImportResults(result);
      }
    } catch (error) {
      console.error('Import failed:', error);
      message.error('Failed to import files');
    }
  };

  const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isSupported = [
      'application/json',
      'text/markdown',
      'text/plain',
      '.md',
      '.txt',
      '.json',
    ].some((type) => file.type.includes(type) || file.name.endsWith(type));

    if (!isSupported) {
      message.error('You can only import JSON, Markdown, or text files!');
      return Upload.LIST_IGNORE;
    }

    // Check for duplicate files
    const isDuplicate = fileList.some(
      (item) => item.name === file.name && item.size === file.size
    );

    if (isDuplicate) {
      message.warning(`${file.name} is already in the list`);
      return Upload.LIST_IGNORE;
    }

    // Add to file list
    setFileList((prev) => [...prev, file]);
    return false;
  };

  const handleRemove = (file: UploadFile) => {
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    return true;
  };

  const resetState = () => {
    setFileList([]);
    setImportResults(null);
  };

  const handleClose = () => {
    resetState();
    onCancel();
  };

  const renderContent = () => {
    if (importResults) {
      return (
<<<<<<< HEAD
        <div className={styles['resultContainer']}>
          <div>
            {importResults.success ? (
              <CheckCircleOutlined className={styles['successIcon']} />
            ) : (
              <CloseCircleOutlined className={styles['errorIcon']} />
=======
        <div>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {importResults.success ? (
              <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            ) : (
              <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            )}
            <h3>
              {importResults.success
                ? `Successfully imported ${importResults.importedCount} notes`
                : 'Import completed with errors'}
            </h3>
            {importResults.errors.length > 0 && (
<<<<<<< HEAD
              <div className={styles['errorList']}>
=======
              <div style={{ marginTop: 16, maxHeight: 200, overflowY: 'auto' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                <h4>Errors:</h4>
                <List
                  size="small"
                  bordered
                  dataSource={importResults.errors}
                  renderItem={(error) => (
                    <List.Item>
                      <Text type="danger">{error}</Text>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <Dragger
        multiple
        fileList={fileList}
        beforeUpload={handleBeforeUpload}
        onRemove={handleRemove}
        showUploadList={false}
<<<<<<< HEAD
        disabled={loading}
=======
        disabled={isImporting}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        style={{ padding: '24px 16px' }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text">
          Click or drag files to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for JSON, Markdown, or text files
        </p>
      </Dragger>
    );
  };

  return (
    <Modal
      title="Import Notes"
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={loading}>
          {importResults ? 'Close' : 'Cancel'}
        </Button>,
        !importResults && (
          <Button
            key="import"
            type="primary"
            onClick={handleImport}
            loading={loading}
            disabled={fileList.length === 0 || loading}
          >
            {loading ? 'Importing...' : `Import ${fileList.length} ${fileList.length === 1 ? 'file' : 'files'}`}
          </Button>
        ),
      ]}
      width={600}
      destroyOnClose
    >
      {loading && !importResults && (
<<<<<<< HEAD
        <div className={styles['loadingContainer']}>
=======
        <div style={{ marginBottom: 16 }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          <Text>Importing files...</Text>
          <Progress percent={progress} status="active" showInfo={false} />
        </div>
      )}
      
      {renderContent()}
      
      {fileList.length > 0 && !importResults && (
        <Card 
          size="small" 
          title="Selected Files" 
<<<<<<< HEAD
          className={styles['fileList']}
=======
          style={{ marginTop: 16, maxHeight: 200, overflowY: 'auto' }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        >
          <List
            size="small"
            dataSource={fileList}
            renderItem={(file) => (
              <List.Item>
                <FileOutlined style={{ marginRight: 8 }} />
<<<<<<< HEAD
                <Text ellipsis={{ tooltip: file.name }} className={styles['fileName']}>
                  {file.name}
                </Text>
                <Text type="secondary" className={styles['fileSize']}>
=======
                <Text ellipsis={{ tooltip: file.name }} style={{ maxWidth: '80%' }}>
                  {file.name}
                </Text>
                <Text type="secondary" style={{ marginLeft: 'auto' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  {(file.size! / 1024).toFixed(1)} KB
                </Text>
              </List.Item>
            )}
          />
        </Card>
      )}
    </Modal>
  );
};
