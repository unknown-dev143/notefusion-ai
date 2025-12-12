import React, { useState } from 'react';
import { Card, Typography, Button, Space, Input, Select, Tabs, List, Tag, Row, Col, Modal } from 'antd';
import { 
  RobotOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BulbOutlined,
  TrophyOutlined,
  FireOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number;
  deadline: string;
  category: string;
  completed: boolean;
  aiSuggestions?: string[];
}

interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'study' | 'work' | 'break' | 'meeting' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
}

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  task: string;
  category: string;
  energy: 'high' | 'medium' | 'low';
}

const AISmartScheduler: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scheduler');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Math Assignment',
      description: 'Finish calculus problems 1-20',
      priority: 'high',
      estimatedDuration: 120,
      deadline: '2024-01-20',
      category: 'Academic',
      completed: false,
      aiSuggestions: ['Break into smaller chunks', 'Start with easier problems first']
    },
    {
      id: '2',
      title: 'Study for Physics Exam',
      description: 'Review chapters 5-8',
      priority: 'urgent',
      estimatedDuration: 180,
      deadline: '2024-01-18',
      category: 'Academic',
      completed: false
    }
  ]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  const generateOptimalSchedule = () => {
    // Mock AI schedule optimization
    const optimizedEvents: ScheduleEvent[] = [
      {
        id: '1',
        title: 'Math Assignment',
        start: new Date(new Date().setHours(9, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 0, 0, 0)),
        type: 'study',
        priority: 'high',
        description: 'Complete calculus problems'
      },
      {
        id: '2',
        title: 'Physics Study',
        start: new Date(new Date().setHours(14, 0, 0, 0)),
        end: new Date(new Date().setHours(17, 0, 0, 0)),
        type: 'study',
        priority: 'urgent',
        description: 'Review exam material'
      },
      {
        id: '3',
        title: 'Break',
        start: new Date(new Date().setHours(12, 0, 0, 0)),
        end: new Date(new Date().setHours(13, 0, 0, 0)),
        type: 'break',
        priority: 'low'
      }
    ];
    
    setEvents(optimizedEvents);
  };

  const addTask = () => {
    if (newTask.title && newTask.priority && newTask.estimatedDuration) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description || '',
        priority: newTask.priority,
        estimatedDuration: newTask.estimatedDuration,
        deadline: newTask.deadline || new Date().toISOString().split('T')[0],
        category: newTask.category || 'General',
        completed: false,
        aiSuggestions: generateAISuggestions()
      };
      setTasks([...tasks, task]);
      setNewTask({});
      setShowTaskModal(false);
    }
  };

  const generateAISuggestions = (): string[] => {
    const suggestions = [
      'Break this into smaller tasks',
      'Schedule during peak energy hours',
      'Set reminders 15 minutes before',
      'Prepare materials in advance',
      'Block distractions during this time'
    ];
    return suggestions.slice(0, 2);
  };

  const prioritizeTasks = () => {
    const prioritized = [...tasks].sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    setTasks(prioritized);
  };

  const generateTimeBlocks = () => {
    const blocks: TimeBlock[] = [
      {
        id: '1',
        startTime: '09:00',
        endTime: '11:00',
        task: 'Math Assignment',
        category: 'Study',
        energy: 'high'
      },
      {
        id: '2',
        startTime: '11:00',
        endTime: '12:00',
        task: 'Quick Review',
        category: 'Study',
        energy: 'medium'
      },
      {
        id: '3',
        startTime: '14:00',
        endTime: '17:00',
        task: 'Physics Exam Prep',
        category: 'Study',
        energy: 'high'
      }
    ];
    setTimeBlocks(blocks);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'study': return 'blue';
      case 'work': return 'purple';
      case 'break': return 'green';
      case 'meeting': return 'orange';
      case 'personal': return 'cyan';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <Space>
          <RobotOutlined />
          AI Smart Scheduler
        </Space>
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Smart Scheduler" key="scheduler">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Calendar View" size="small">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <CalendarOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                  <div style={{ marginTop: '16px' }}>
                    <Text type="secondary">Calendar component would be displayed here</Text>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Today's Schedule" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={generateOptimalSchedule}
                    block
                  >
                    Generate Optimal Schedule
                  </Button>

                  {events.length > 0 ? (
                    <List
                      dataSource={events}
                      renderItem={(event) => (
                        <List.Item>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                              <Text strong>{event.title}</Text>
                              <Tag color={getEventTypeColor(event.type)} style={{ marginLeft: '8px' }}>
                                {event.type}
                              </Tag>
                            </div>
                            <div>
                              <ClockCircleOutlined style={{ marginRight: '4px' }} />
                              <Text>
                                {new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            </div>
                            {event.description && (
                              <Text type="secondary">{event.description}</Text>
                            )}
                          </Space>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <CalendarOutlined style={{ fontSize: '32px', color: '#ccc' }} />
                      <div style={{ marginTop: '8px' }}>
                        <Text type="secondary">No events scheduled</Text>
                      </div>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Task Management" key="tasks">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4}>Tasks ({tasks.length})</Title>
                <Space>
                  <Button
                    icon={<ThunderboltOutlined />}
                    onClick={prioritizeTasks}
                  >
                    Auto-Prioritize
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowTaskModal(true)}
                  >
                    Add Task
                  </Button>
                </Space>
              </div>

              <List
                dataSource={tasks}
                renderItem={(task) => (
                  <List.Item>
                    <Card size="small" style={{ width: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>{task.title}</Text>
                          <Tag color={getPriorityColor(task.priority)} style={{ marginLeft: '8px' }}>
                            {task.priority}
                          </Tag>
                          <Tag style={{ marginLeft: '8px' }}>
                            {task.category}
                          </Tag>
                        </div>
                        
                        {task.description && (
                          <Text type="secondary">{task.description}</Text>
                        )}
                        
                        <div>
                          <ClockCircleOutlined style={{ marginRight: '4px' }} />
                          <Text>{task.estimatedDuration} minutes</Text>
                          <Text style={{ marginLeft: '16px' }}>
                            Due: {task.deadline}
                          </Text>
                        </div>

                        {task.aiSuggestions && task.aiSuggestions.length > 0 && (
                          <div>
                            <Text strong style={{ color: '#1890ff' }}>AI Suggestions:</Text>
                            <ul style={{ marginTop: '4px', marginBottom: '0' }}>
                              {task.aiSuggestions.map((suggestion, index) => (
                                <li key={index} style={{ fontSize: '12px', color: '#666' }}>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <Space>
                          <Button size="small" icon={<CheckCircleOutlined />}>
                            Complete
                          </Button>
                          <Button size="small" icon={<EditOutlined />}>
                            Edit
                          </Button>
                          <Button size="small" icon={<DeleteOutlined />} danger>
                            Delete
                          </Button>
                        </Space>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Time Blocking" key="timeblocking">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4}>Time Blocks</Title>
                <Button
                  type="primary"
                  icon={<BulbOutlined />}
                  onClick={generateTimeBlocks}
                >
                  Generate Time Blocks
                </Button>
              </div>

              {timeBlocks.length > 0 ? (
                <List
                  dataSource={timeBlocks}
                  renderItem={(block) => (
                    <List.Item>
                      <Card size="small" style={{ width: '100%' }}>
                        <Space>
                          <div style={{ minWidth: '120px' }}>
                            <Text strong>{block.startTime} - {block.endTime}</Text>
                          </div>
                          <div style={{ minWidth: '150px' }}>
                            <Text>{block.task}</Text>
                          </div>
                          <Tag color={block.energy === 'high' ? 'red' : block.energy === 'medium' ? 'orange' : 'green'}>
                            {block.energy} energy
                          </Tag>
                        </Space>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <ClockCircleOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                  <div style={{ marginTop: '16px' }}>
                    <Text type="secondary">Generate AI-optimized time blocks</Text>
                  </div>
                </div>
              )}
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Productivity Analytics" key="analytics">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card size="small" title="Tasks Completed">
                <div style={{ textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>24</Text>
                  </div>
                  <Text type="secondary">This week</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card size="small" title="Productivity Score">
                <div style={{ textAlign: 'center' }}>
                  <TrophyOutlined style={{ fontSize: '32px', color: '#faad14' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>87%</Text>
                  </div>
                  <Text type="secondary">Great job!</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card size="small" title="Focus Time">
                <div style={{ textAlign: 'center' }}>
                  <FireOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>6.5h</Text>
                  </div>
                  <Text type="secondary">Today</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12}>
              <Card size="small" title="Efficiency">
                <div style={{ textAlign: 'center' }}>
                  <ThunderboltOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>92%</Text>
                  </div>
                  <Text type="secondary">Excellent!</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title="Add New Task"
        visible={showTaskModal}
        onOk={addTask}
        onCancel={() => setShowTaskModal(false)}
        okText="Add Task"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Task Title:</Text>
            <Input
              placeholder="Enter task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
          </div>

          <div>
            <Text strong>Description:</Text>
            <TextArea
              placeholder="Enter task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Text strong>Priority:</Text>
            <Select
              value={newTask.priority}
              onChange={(priority) => setNewTask({ ...newTask, priority })}
              style={{ width: '100%' }}
            >
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </div>

          <div>
            <Text strong>Estimated Duration (minutes):</Text>
            <Input
              type="number"
              placeholder="60"
              value={newTask.estimatedDuration}
              onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <Text strong>Category:</Text>
            <Select
              value={newTask.category}
              onChange={(category) => setNewTask({ ...newTask, category })}
              style={{ width: '100%' }}
            >
              <Option value="Academic">Academic</Option>
              <Option value="Work">Work</Option>
              <Option value="Personal">Personal</Option>
              <Option value="Health">Health</Option>
              <Option value="General">General</Option>
            </Select>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default AISmartScheduler;
