import React, { useState } from 'react';
import { Card, Button, Form, Select, Typography, message } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { useBackup } from '../hooks/useBackup';

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
      <div style={{ marginBottom: 24 }}>
        <Text>
          Create a manual backup of all your notes. This will allow you to restore your data if needed.
        </Text>
        <div style={{ marginTop: 16 }}>
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
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Automatic Backups
        </Text>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Schedule automatic backups to run at regular intervals.
        </Text>
        
        <Form
          form={form}
          layout="inline"
          onFinish={handleScheduleBackup}
          initialValues={{ frequency: 'weekly' }}
        >
          <Form.Item name="frequency" label="Backup Frequency">
            <Select style={{ width: 150 }} disabled={isLoading || isScheduling}>
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
