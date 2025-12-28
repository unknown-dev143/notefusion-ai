import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Typography, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  message,
  Tag,
  Checkbox
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import ErrorBoundary from '../../../components/ErrorBoundary';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load tasks (mock data for now)
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Review lecture notes',
        description: 'Go through today\'s physics lecture and summarize key points',
        status: 'pending',
        priority: 'high',
        dueDate: dayjs().add(1, 'day').toISOString(),
        createdAt: dayjs().toISOString(),
        updatedAt: dayjs().toISOString()
      },
      {
        id: '2',
        title: 'Create flashcards',
        description: 'Make flashcards for biology chapter 5',
        status: 'in_progress',
        priority: 'medium',
        dueDate: dayjs().add(3, 'day').toISOString(),
        createdAt: dayjs().subtract(1, 'day').toISOString(),
        updatedAt: dayjs().toISOString()
      }
    ];
    setTasks(mockTasks);
  }, []);

  const handleCreateOrUpdate = async (values: any) => {
    setLoading(true);
    try {
      if (editingTask) {
        // Update task
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id 
            ? { 
                ...task, 
                ...values, 
                dueDate: values.dueDate?.toISOString(),
                updatedAt: dayjs().toISOString()
              }
            : task
        ));
        message.success('Task updated successfully');
      } else {
        // Create new task
        const newTask: Task = {
          id: Date.now().toString(),
          ...values,
          dueDate: values.dueDate?.toISOString(),
          createdAt: dayjs().toISOString(),
          updatedAt: dayjs().toISOString()
        };
        setTasks(prev => [newTask, ...prev]);
        message.success('Task created successfully');
      }
      
      setIsModalVisible(false);
      setEditingTask(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (taskId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this task?',
      onOk: () => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        message.success('Task deleted successfully');
      }
    });
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status, updatedAt: dayjs().toISOString() }
        : task
    ));
    message.success('Task status updated');
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Title level={2}>Please log in to view your tasks</Title>
      </div>
    );
  }

  return (
    <ErrorBoundary componentName="TasksPage">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <Title level={2}>My Tasks</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTask(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Add Task
          </Button>
        </div>

        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item>
              <Card
                size="small"
                title={
                  <Space>
                    <Checkbox
                      checked={task.status === 'completed'}
                      onChange={(e) => handleStatusChange(
                        task.id, 
                        e.target.checked ? 'completed' : 'pending'
                      )}
                    />
                    <Text strong>{task.title}</Text>
                  </Space>
                }
                extra={
                  <Space>
                    <Button 
                      type="text" 
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingTask(task);
                        form.setFieldsValue({
                          ...task,
                          dueDate: task.dueDate ? dayjs(task.dueDate) : undefined
                        });
                        setIsModalVisible(true);
                      }}
                    />
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(task.id)}
                    />
                  </Space>
                }
                actions={[
                  <Tag color={getPriorityColor(task.priority)} key="priority">
                    {task.priority.toUpperCase()}
                  </Tag>,
                  <Tag color={getStatusColor(task.status)} key="status">
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Tag>,
                  task.dueDate && (
                    <span key="due">
                      <CalendarOutlined /> {dayjs(task.dueDate).format('MMM DD')}
                    </span>
                  )
                ]}
              >
                {task.description && (
                  <Text type="secondary">{task.description}</Text>
                )}
              </Card>
            </List.Item>
          )}
        />

        <Modal
          title={editingTask ? 'Edit Task' : 'Create New Task'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingTask(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateOrUpdate}
          >
            <Form.Item
              name="title"
              label="Task Title"
              rules={[{ required: true, message: 'Please enter task title' }]}
            >
              <Input placeholder="Enter task title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={3} placeholder="Enter task description (optional)" />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priority"
              initialValue="medium"
            >
              <Select>
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              initialValue="pending"
            >
              <Select>
                <Option value="pending">Pending</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Due Date"
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="Select due date (optional)"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingTask ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};
