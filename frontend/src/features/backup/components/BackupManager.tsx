import React from 'react';
import { Tabs, Typography, Space } from 'antd';
import { BackupSettings } from './BackupSettings';
import { BackupList } from './BackupList';
import styles from './BackupManager.module.css';

const { Title } = Typography;
const { TabPane } = Tabs;

export const BackupManager: React.FC = () => {
  return (
    <div className={styles.container}>
      <Space direction="vertical" size="large" className={styles.tabsContainer}>
        <Title level={2} className={styles.title}>Backup & Restore</Title>
        
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
