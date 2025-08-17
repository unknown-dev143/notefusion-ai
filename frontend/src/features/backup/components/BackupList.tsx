import React, { useEffect } from 'react';
import { List, Button, Card, Typography, Space, Tag, Popconfirm } from 'antd';
import { CloudDownloadOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useBackup } from '../hooks/useBackup';

const { Text } = Typography;

export const BackupList: React.FC = () => {
  const { 
    backups, 
    isLoading, 
    fetchBackups, 
    deleteBackup, 
    restoreBackup
  } = useBackup();

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleRestore = async (backupId: string) => {
    const success = await restoreBackup(backupId);
    if (success) {
      fetchBackups();
    }
  };

  const handleDelete = async (backupId: string) => {
    const success = await deleteBackup(backupId);
    if (success) {
      fetchBackups();
    }
  };

  return (
    <Card 
      title="Your Backups" 
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchBackups}
          loading={isLoading}
          size="small"
        >
          Refresh
        </Button>
      }
    >
      <List
        itemLayout="horizontal"
        dataSource={backups}
        loading={isLoading}
        renderItem={(backup) => (
          <List.Item
            actions={[
              <Button 
                key="restore" 
                type="link" 
                icon={<CloudDownloadOutlined />} 
                onClick={() => handleRestore(backup.id)}
                disabled={isLoading}
              >
                Restore
              </Button>,
              <Popconfirm
                key="delete"
                title="Are you sure you want to delete this backup?"
                onConfirm={() => handleDelete(backup.id)}
                okText="Yes"
                cancelText="No"
                disabled={isLoading}
              >
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>Backup from {new Date(backup.createdAt).toLocaleString()}</Text>
                  <Tag color={backup.status === 'completed' ? 'success' : 'error'}>
                    {backup.status}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    {backup.metadata.noteCount} notes • {Math.round(backup.size / 1024)} KB
                  </Text>
                  <Text type="secondary">
                    Version: {backup.metadata.version}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'No backups found' }}
      />
    </Card>
  );
};
