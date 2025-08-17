import React from 'react';
import { Tabs, Typography, Space } from 'antd';
import { BackupSettings } from './BackupSettings';
import { BackupList } from './BackupList';

const { Title } = Typography;
const { TabPane } = Tabs;

export const BackupManager: React.FC = () => {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Backup & Restore</Title>
        
        <Tabs defaultActiveKey="1">
          <TabPane tab="Backup Settings" key="1">
            <BackupSettings />
          </TabPane>
          <TabPane tab="Your Backups" key="2">
            <BackupList />
          </TabPane>
        </Tabs>
      </Space>
    </div>
  );
};

export default BackupManager;
