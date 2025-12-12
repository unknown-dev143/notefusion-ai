import React, { useState } from 'react';
import { Card, Typography, List, Button, Space, Tag, Modal, message } from 'antd';
import { HistoryOutlined, EyeOutlined, RestOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Version {
  id: string;
  timestamp: string;
  content: string;
  changes: string;
  author: string;
}

interface VersionHistoryProps {
  onRestore: (content: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ 
  onRestore 
}) => {
  const [versions] = useState<Version[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      content: 'Previous version content...',
      changes: 'Added new section',
      author: 'You'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      content: 'Even older version content...',
      changes: 'Initial draft',
      author: 'You'
    }
  ]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const handlePreview = (version: Version) => {
    setPreviewVersion(version);
    setPreviewVisible(true);
  };

  const handleRestore = (version: Version) => {
    Modal.confirm({
      title: 'Restore Version',
      content: `Are you sure you want to restore the version from ${formatTimestamp(version.timestamp)}? This will replace the current content.`,
      okText: 'Restore',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk() {
        onRestore(version.content);
        message.success('Version restored successfully!');
      },
    });
  };

  return (
    <Card 
      title={
        <Space>
          <HistoryOutlined />
          <span>Version History</span>
        </Space>
      }
      style={{ marginTop: 16 }}
    >
      <List
        dataSource={versions}
        renderItem={(version) => (
          <List.Item
            actions={[
              <Button
                key="preview"
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(version)}
              >
                Preview
              </Button>,
              <Button
                key="restore"
                type="text"
                icon={<RestOutlined />}
                onClick={() => handleRestore(version)}
              >
                Restore
              </Button>
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{formatTimestamp(version.timestamp)}</Text>
                  <Tag color="blue">{version.author}</Tag>
                </Space>
              }
              description={
                <div>
                  <Text type="secondary">{version.changes}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {version.content.substring(0, 100)}...
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title="Version Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
          previewVersion && (
            <Button 
              key="restore" 
              type="primary" 
              onClick={() => {
                handleRestore(previewVersion);
                setPreviewVisible(false);
              }}
            >
              Restore This Version
            </Button>
          )
        ]}
        width={800}
      >
        {previewVersion && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Timestamp:</Text> {formatTimestamp(previewVersion.timestamp)}
            </div>
            <div>
              <Text strong>Changes:</Text> {previewVersion.changes}
            </div>
            <div>
              <Text strong>Content:</Text>
              <div style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '6px',
                marginTop: '8px',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                {previewVersion.content}
              </div>
            </div>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

export default VersionHistory;
