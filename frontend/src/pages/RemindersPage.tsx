import React, { useState } from 'react';
import { Card, Button, Typography, Space, Tag, List, Modal } from 'antd';
import { PlusOutlined, BellOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReminderForm } from '../features/reminders/components/ReminderForm';
import { getReminders, deleteReminder } from '../features/reminders/api/reminders';
import { Reminder } from '../features/reminders/types';

const { Title, Text } = Typography;

const RemindersPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const queryClient = useQueryClient();

  const { data: reminders = [] as Reminder[], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => getReminders(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const handleEdit = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Delete Reminder',
      content: 'Are you sure you want to delete this reminder?',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedReminder(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Title level={2}>
            <BellOutlined className="mr-2" />
            Reminders
          </Title>
          <Text type="secondary">Manage your study reminders and notifications</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsFormOpen(true)}
          size="large"
        >
          New Reminder
        </Button>
      </div>

      <List
        loading={isLoading}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}
        dataSource={reminders}
        renderItem={(reminder: Reminder) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                <Button type="link" onClick={() => handleEdit(reminder)}>Edit</Button>,
                <Button type="link" danger onClick={() => handleDelete(reminder.id)}>Delete</Button>,
              ]}
            >
              <Card.Meta
                title={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>{reminder.title}</Text>
                    <Space>
                      <Tag color="blue">
                        <CalendarOutlined /> {new Date(reminder.due_date).toLocaleDateString()}
                      </Tag>
                      <Tag color="green">
                        <ClockCircleOutlined /> {new Date(reminder.due_date).toLocaleTimeString()}
                      </Tag>
                    </Space>
                  </Space>
                }
                description={
                  <div className="mt-2">
                    <Text type="secondary">{reminder.description}</Text>
                    {reminder.is_recurring && (
                      <Tag color="purple" className="mt-2">Recurring</Tag>
                    )}
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <ReminderForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        reminder={selectedReminder}
        onSuccess={() => {
          handleFormClose();
          queryClient.invalidateQueries({ queryKey: ['reminders'] });
        }}
      />
    </div>
  );
};

export default RemindersPage;
