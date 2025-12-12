import React from 'react';
import { Tabs, Typography, Space } from 'antd';
import { BackupSettings } from './BackupSettings';
import { BackupList } from './BackupList';
<<<<<<< HEAD
import styles from './BackupManager.module.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

const { Title } = Typography;
const { TabPane } = Tabs;

export const BackupManager: React.FC = () => {
  return (
<<<<<<< HEAD
    <div className={styles.container}>
      <Space direction="vertical" size="large" className={styles.tabsContainer}>
        <Title level={2} className={styles.title}>Backup & Restore</Title>
=======
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>Backup & Restore</Title>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        
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
