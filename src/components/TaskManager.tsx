import React, { useState } from 'react';
import { Card, Typography, Button, Space, Table, Tag, Modal, Input, Select, DatePicker, message, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate: string;
  category: string;
  progress: number;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Math Assignment',
      description: 'Finish calculus problems 1-20',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-01-20',
      category: 'Academic',
      progress: 60
    },
    {
      id: '2',
      title: 'Review Study Notes',
      description: 'Go through physics notes for exam',
      priority: 'medium',
      status: 'todo',
      dueDate: '2024-01-18',
      category: 'Academic',
      progress: 0
    },
    {
      id: '3',
      title: 'Organize Project Files',
      description: 'Clean up project directory',
      priority: 'low',
      status: 'completed',
      dueDate: '2024-01-15',
      category: 'Personal',
      progress: 100
    }
  ]);

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
    category: 'Personal'
  });

  const categories = ['Academic', 'Personal', 'Work', 'Projects'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['all', 'todo', 'in-progress', 'completed'];

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const createTask = () => {
    if (!taskForm.title.trim()) {
      message.error('Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      status: 'todo',
      dueDate: taskForm.dueDate,
      category: taskForm.category,
      progress: 0
    };

    setTasks(prev => [newTask, ...prev]);
    message.success('Task created successfully!');
    resetForm();
  };

  const updateTask = () => {
    if (!editingTask || !taskForm.title.trim()) {
      message.error('Please enter a task title');
      return;
    }

    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...taskForm }
        : task
    ));

    message.success('Task updated successfully!');
    resetForm();
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    message.success('Task deleted successfully!');
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const statusFlow = {
          'todo': 'in-progress',
          'in-progress': 'completed',
          'completed': 'todo'
        };
        const newStatus = statusFlow[task.status as keyof typeof statusFlow] as Task['status'];
        const newProgress = newStatus === 'completed' ? 100 : newStatus === 'todo' ? 0 : task.progress;
        return { ...task, status: newStatus, progress: newProgress };
      }
      return task;
    }));
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: 'Personal'
    });
    setEditingTask(null);
    setTaskModalVisible(false);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      category: task.category
    });
    setTaskModalVisible(true);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'todo': 'default',
      'in-progress': 'processing',
      'completed': 'success'
    };
    return colors[status as keyof typeof colors];
  };

  const columns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Task) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description}
          </Text>
        </div>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('-', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      )
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (dueDate: string) => (
        <Space>
          <ClockCircleOutlined />
          <span>{dueDate || 'No due date'}</span>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Task) => (
        <Space>
          <Button size="small" icon={<CheckOutlined />} onClick={() => toggleTaskStatus(record.id)}>
            Toggle
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteTask(record.id)}>
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Task Manager</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 150 }}
          >
            {statuses.map(status => (
              <Option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.replace('-', ' ').toUpperCase()}
              </Option>
            ))}
          </Select>

          <Select
            value={filterPriority}
            onChange={setFilterPriority}
            style={{ width: 150 }}
          >
            {priorities.map(priority => (
              <Option key={priority} value={priority}>
                {priority === 'all' ? 'All Priorities' : priority.toUpperCase()}
              </Option>
            ))}
          </Select>

          <Button type="primary" icon={<PlusOutlined />} onClick={() => setTaskModalVisible(true)}>
            Add Task
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        open={taskModalVisible}
        onOk={editingTask ? updateTask : createTask}
        onCancel={resetForm}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Task Title</Text>
            <Input
              value={taskForm.title}
              onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <Text strong>Description</Text>
            <TextArea
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text strong>Priority</Text>
              <Select
                value={taskForm.priority}
                onChange={(value) => setTaskForm(prev => ({ ...prev, priority: value }))}
                style={{ width: '100%', marginTop: 4 }}
              >
                {priorities.map(priority => (
                  <Option key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ flex: 1 }}>
              <Text strong>Category</Text>
              <Select
                value={taskForm.category}
                onChange={(value) => setTaskForm(prev => ({ ...prev, category: value }))}
                style={{ width: '100%', marginTop: 4 }}
              >
                {categories.map(category => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Text strong>Due Date</Text>
            <DatePicker
              value={taskForm.dueDate ? dayjs(taskForm.dueDate) : null}
              onChange={(date) => setTaskForm(prev => ({ 
                ...prev, 
                dueDate: date ? date.format('YYYY-MM-DD') : '' 
              }))}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default TaskManager;
