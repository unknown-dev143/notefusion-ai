import React, { useState } from 'react';
import { Card, Button, Form, Select, Typography, message } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { useBackup } from '../hooks/useBackup';
import styles from './BackupSettings.module.css';

const { Option } = Select;
const { Text } = Typography;

export const BackupSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [isScheduling, setIsScheduling] = useState(false);
  const { createBackup, scheduleBackup, isLoading } = useBackup();

  const handleCreateBackup = async () => {
    const backup = await createBackup();
    if (backup) {
      message.success('Backup created successfully!');
    }
  };

  const handleScheduleBackup = async (values: { frequency: string }) => {
    try {
      setIsScheduling(true);
      const jobId = await scheduleBackup(values.frequency as any);
      if (jobId) {
        message.success(
          `Scheduled ${values.frequency} backups successfully`,
        );
      }
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Card title="Backup Settings">
      <div className={styles['description']}>
        <Text>
          Create a manual backup of all your notes. This will allow you to restore your data if needed.
        </Text>
        <div className={styles['buttonContainer']}>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={handleCreateBackup}
            loading={isLoading}
          >
            Create Backup Now
          </Button>
        </div>
      </div>

      <div>
        <Text strong className={styles['sectionTitle']}>
          Automatic Backups
        </Text>
        <Text type="secondary" className={styles['sectionDescription']}>
          Schedule automatic backups to run at regular intervals.
        </Text>
        
        <Form
          form={form}
          layout="inline"
          onFinish={handleScheduleBackup}
          initialValues={{ frequency: 'weekly' }}
        >
          <Form.Item name="frequency" label="Backup Frequency">
            <Select className={styles['frequencySelect']} disabled={isLoading || isScheduling}>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={isLoading || isScheduling}
              disabled={isLoading}
            >
              {isScheduling ? 'Scheduling...' : 'Schedule Backup'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
};
