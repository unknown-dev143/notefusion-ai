import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, List, Tag, Modal, Calendar, Input, Select, TimePicker, message, Badge, Progress, DatePicker } from 'antd';
import { 
  CalendarOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ClockCircleOutlined,
  BellOutlined,
  CheckCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface StudySession {
  id: string;
  title: string;
  description: string;
  moduleCode: string;
  date: string;
  startTime: string;
  duration: number; // in minutes
  sessionType: 'lecture' | 'study' | 'review' | 'exam' | 'assignment';
  priority: 'low' | 'medium' | 'high';
  location?: string;
  reminders: number[]; // minutes before session
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
  };
  materials: string[];
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  targetHours: number;
  completedHours: number;
  modules: string[];
  status: 'active' | 'completed' | 'paused';
}

const StudyScheduler: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: '1',
      title: 'Machine Learning Study Session',
      description: 'Review neural networks and backpropagation',
      moduleCode: 'CS301',
      date: new Date().toISOString(),
      startTime: '14:00',
      duration: 120,
      sessionType: 'study',
      priority: 'high',
      location: 'Library',
      reminders: [15, 60],
      status: 'scheduled',
      materials: ['ML Textbook', 'Lecture Notes']
    },
    {
      id: '2',
      title: 'AI Ethics Discussion',
      description: 'Group discussion on ethical implications of AI',
      moduleCode: 'CS302',
      date: new Date(Date.now() + 86400000).toISOString(),
      startTime: '10:00',
      duration: 90,
      sessionType: 'lecture',
      priority: 'medium',
      location: 'Room 203',
      reminders: [30],
      status: 'scheduled',
      materials: ['Discussion Notes']
    }
  ]);

  const [goals, setGoals] = useState<StudyGoal[]>([
    {
      id: '1',
      title: 'Complete Machine Learning Module',
      description: 'Finish all ML coursework and achieve 85%+ in exams',
      targetDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      targetHours: 40,
      completedHours: 12,
      modules: ['CS301'],
      status: 'active'
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'goals'>('calendar');
  
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    moduleCode: '',
    date: null as Dayjs | null,
    startTime: null as Dayjs | null,
    duration: 60,
    sessionType: 'study' as 'lecture' | 'study' | 'review' | 'exam' | 'assignment',
    priority: 'medium' as 'low' | 'medium' | 'high',
    location: '',
    reminders: [] as number[],
    recurring: {
      type: null as 'daily' | 'weekly' | 'monthly' | null,
      endDate: null as Dayjs | null
    },
    materials: [] as string[]
  });

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetDate: null as Dayjs | null,
    targetHours: 0,
    modules: [] as string[]
  });

  const [newReminder, setNewReminder] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newModule, setNewModule] = useState('');

  const sessionTypeColors = {
    lecture: 'blue',
    study: 'green',
    review: 'orange',
    exam: 'red',
    assignment: 'purple'
  };

  const priorityColors = {
    low: 'green',
    medium: 'orange',
    high: 'red'
  };

  const statusColors = {
    scheduled: 'blue',
    'in-progress': 'orange',
    completed: 'green',
    cancelled: 'default'
  };

  useEffect(() => {
    // Check for upcoming sessions and show reminders
    const checkReminders = () => {
      const now = dayjs();
      sessions.forEach(session => {
        if (session.status === 'scheduled') {
          const sessionDateTime = dayjs(`${session.date} ${session.startTime}`);
          session.reminders.forEach(reminderMinutes => {
            const reminderTime = sessionDateTime.subtract(reminderMinutes, 'minute');
            if (now.isSame(reminderTime, 'minute')) {
              message.info(`Reminder: "${session.title}" starts in ${reminderMinutes} minutes!`);
            }
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [sessions]);

  const createSession = () => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      title: sessionForm.title,
      description: sessionForm.description,
      moduleCode: sessionForm.moduleCode,
      date: sessionForm.date?.toISOString() || new Date().toISOString(),
      startTime: sessionForm.startTime?.format('HH:mm') || '09:00',
      duration: sessionForm.duration,
      sessionType: sessionForm.sessionType,
      priority: sessionForm.priority,
      location: sessionForm.location,
      reminders: sessionForm.reminders,
      status: 'scheduled',
      recurring: sessionForm.recurring.type ? {
        type: sessionForm.recurring.type,
        endDate: sessionForm.recurring.endDate?.toISOString()
      } : undefined,
      materials: sessionForm.materials
    };

    setSessions(prev => [newSession, ...prev]);
    setCreateModalVisible(false);
    resetSessionForm();
    message.success('Study session scheduled successfully');
  };

  const updateSession = () => {
    if (!editingSession) return;

    const updatedSession = {
      ...editingSession,
      title: sessionForm.title,
      description: sessionForm.description,
      moduleCode: sessionForm.moduleCode,
      date: sessionForm.date?.toISOString() || editingSession.date,
      startTime: sessionForm.startTime?.format('HH:mm') || editingSession.startTime,
      duration: sessionForm.duration,
      sessionType: sessionForm.sessionType,
      priority: sessionForm.priority,
      location: sessionForm.location,
      reminders: sessionForm.reminders,
      recurring: sessionForm.recurring.type ? {
        type: sessionForm.recurring.type,
        endDate: sessionForm.recurring.endDate?.toISOString()
      } : undefined,
      materials: sessionForm.materials
    };

    setSessions(prev => prev.map(session => 
      session.id === editingSession.id ? updatedSession : session
    ));

    setEditModalVisible(false);
    setEditingSession(null);
    resetSessionForm();
    message.success('Study session updated successfully');
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    message.success('Study session deleted');
  };

  const completeSession = (sessionId: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, status: 'completed' as const } : session
    ));
    message.success('Study session marked as completed');
  };

  const createGoal = () => {
    const newGoal: StudyGoal = {
      id: Date.now().toString(),
      title: goalForm.title,
      description: goalForm.description,
      targetDate: goalForm.targetDate?.toISOString() || new Date().toISOString(),
      targetHours: goalForm.targetHours,
      completedHours: 0,
      modules: goalForm.modules,
      status: 'active'
    };

    setGoals(prev => [newGoal, ...prev]);
    setGoalModalVisible(false);
    resetGoalForm();
    message.success('Study goal created successfully');
  };

  const updateGoalProgress = (goalId: string, additionalHours: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newCompletedHours = Math.min(goal.completedHours + additionalHours, goal.targetHours);
        return {
          ...goal,
          completedHours: newCompletedHours,
          status: newCompletedHours >= goal.targetHours ? 'completed' : 'active'
        };
      }
      return goal;
    }));
  };

  const startEditSession = (session: StudySession) => {
    setEditingSession(session);
    setSessionForm({
      title: session.title,
      description: session.description,
      moduleCode: session.moduleCode,
      date: dayjs(session.date),
      startTime: dayjs(session.startTime, 'HH:mm'),
      duration: session.duration,
      sessionType: session.sessionType,
      priority: session.priority,
      location: session.location || '',
      reminders: session.reminders,
      recurring: {
        type: session.recurring?.type || null,
        endDate: session.recurring?.endDate ? dayjs(session.recurring.endDate) : null
      },
      materials: session.materials
    });
    setEditModalVisible(true);
  };

  const resetSessionForm = () => {
    setSessionForm({
      title: '',
      description: '',
      moduleCode: '',
      date: null,
      startTime: null,
      duration: 60,
      sessionType: 'study',
      priority: 'medium',
      location: '',
      reminders: [],
      recurring: {
        type: null,
        endDate: null
      },
      materials: []
    });
    setNewReminder('');
    setNewMaterial('');
  };

  const resetGoalForm = () => {
    setGoalForm({
      title: '',
      description: '',
      targetDate: null,
      targetHours: 0,
      modules: []
    });
    setNewModule('');
  };

  const addReminder = () => {
    const minutes = parseInt(newReminder);
    if (!isNaN(minutes) && minutes > 0 && !sessionForm.reminders.includes(minutes)) {
      setSessionForm(prev => ({
        ...prev,
        reminders: [...prev.reminders, minutes].sort((a, b) => b - a)
      }));
      setNewReminder('');
    }
  };

  const removeReminder = (reminder: number) => {
    setSessionForm(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r !== reminder)
    }));
  };

  const addMaterial = () => {
    if (newMaterial.trim() && !sessionForm.materials.includes(newMaterial.trim())) {
      setSessionForm(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()]
      }));
      setNewMaterial('');
    }
  };

  const removeMaterial = (material: string) => {
    setSessionForm(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m !== material)
    }));
  };

  const addModule = () => {
    if (newModule.trim() && !goalForm.modules.includes(newModule.trim())) {
      setGoalForm(prev => ({
        ...prev,
        modules: [...prev.modules, newModule.trim()]
      }));
      setNewModule('');
    }
  };

  const removeModule = (module: string) => {
    setGoalForm(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m !== module)
    }));
  };

  const getSessionsForDate = (date: Dayjs) => {
    return sessions.filter(session => 
      dayjs(session.date).isSame(date, 'day')
    );
  };

  const getListData = (value: Dayjs) => {
    const daySessions = getSessionsForDate(value);
    return daySessions.map(session => ({
      type: sessionTypeColors[session.sessionType],
      content: session.title
    }));
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type as any} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const upcomingSessions = sessions
    .filter(session => session.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <Card title="Study Scheduler" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* View Mode Selector */}
        <Space>
          <Button 
            type={viewMode === 'calendar' ? 'primary' : 'default'}
            icon={<CalendarOutlined />}
            onClick={() => setViewMode('calendar')}
          >
            Calendar
          </Button>
          <Button 
            type={viewMode === 'list' ? 'primary' : 'default'}
            icon={<ClockCircleOutlined />}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button 
            type={viewMode === 'goals' ? 'primary' : 'default'}
            icon={<TrophyOutlined />}
            onClick={() => setViewMode('goals')}
          >
            Goals
          </Button>
        </Space>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4}>Study Calendar</Title>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Schedule Session
              </Button>
            </div>
            
            <Calendar 
              value={selectedDate}
              onSelect={setSelectedDate}
              dateCellRender={dateCellRender}
            />

            <div style={{ marginTop: 16 }}>
              <Title level={5}>Sessions for {selectedDate.format('MMMM D, YYYY')}</Title>
              <List
                dataSource={getSessionsForDate(selectedDate)}
                renderItem={(session) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="text" 
                        icon={<EditOutlined />}
                        onClick={() => startEditSession(session)}
                      />,
                      <Button 
                        type="text" 
                        icon={<CheckCircleOutlined />}
                        onClick={() => completeSession(session.id)}
                        disabled={session.status === 'completed'}
                      />,
                      <Button 
                        type="text" 
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteSession(session.id)}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          {session.title}
                          <Tag color={sessionTypeColors[session.sessionType]}>
                            {session.sessionType}
                          </Tag>
                          <Tag color={priorityColors[session.priority]}>
                            {session.priority}
                          </Tag>
                          <Tag color={statusColors[session.status]}>
                            {session.status}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text>{session.description}</Text>
                          <Space>
                            <ClockCircleOutlined />
                            <Text>{session.startTime} • {session.duration} minutes</Text>
                            {session.location && (
                              <>
                                <Text>•</Text>
                                <Text>{session.location}</Text>
                              </>
                            )}
                          </Space>
                          <Space wrap>
                            {session.materials.map((material, index) => (
                              <Tag key={index}>{material}</Tag>
                            ))}
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4}>All Study Sessions</Title>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Schedule Session
              </Button>
            </div>
            
            <List
              dataSource={upcomingSessions}
              renderItem={(session) => (
                <List.Item
                  actions={[
                    <Button 
                      type="text" 
                      icon={<EditOutlined />}
                      onClick={() => startEditSession(session)}
                    />,
                    <Button 
                      type="text" 
                      icon={<CheckCircleOutlined />}
                      onClick={() => completeSession(session.id)}
                      disabled={session.status === 'completed'}
                    />,
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteSession(session.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        {session.title}
                        <Tag color="blue">{session.moduleCode}</Tag>
                        <Tag color={sessionTypeColors[session.sessionType]}>
                          {session.sessionType}
                        </Tag>
                        <Tag color={priorityColors[session.priority]}>
                          {session.priority}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text>{session.description}</Text>
                        <Space>
                          <CalendarOutlined />
                          <Text>{new Date(session.date).toLocaleDateString()}</Text>
                          <ClockCircleOutlined />
                          <Text>{session.startTime} • {session.duration} minutes</Text>
                          {session.location && <Text>• {session.location}</Text>}
                        </Space>
                        <Space wrap>
                          {session.reminders.map((reminder, index) => (
                            <Tag key={index} icon={<BellOutlined />}>
                              {reminder}min
                            </Tag>
                          ))}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {/* Goals View */}
        {viewMode === 'goals' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4}>Study Goals</Title>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setGoalModalVisible(true)}
              >
                Create Goal
              </Button>
            </div>
            
            <List
              dataSource={goals}
              renderItem={(goal) => (
                <List.Item
                  actions={[
                    <Button 
                      type="primary"
                      onClick={() => {
                        const additionalHours = 2; // Add 2 hours
                        updateGoalProgress(goal.id, additionalHours);
                        message.success(`Added ${additionalHours} hours to goal`);
                      }}
                    >
                      Log Hours
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        {goal.title}
                        <Tag color={goal.status === 'completed' ? 'green' : 'blue'}>
                          {goal.status}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text>{goal.description}</Text>
                        <Space>
                          <Text strong>Target: {goal.targetHours} hours</Text>
                          <Text strong>Completed: {goal.completedHours} hours</Text>
                        </Space>
                        <Progress 
                          percent={(goal.completedHours / goal.targetHours) * 100}
                          format={() => `${goal.completedHours}/${goal.targetHours}h`}
                        />
                        <Space>
                          <Text type="secondary">
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </Text>
                        </Space>
                        <Space wrap>
                          {goal.modules.map((module, index) => (
                            <Tag key={index} color="blue">{module}</Tag>
                          ))}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {/* Create Session Modal */}
        <Modal
          title="Schedule Study Session"
          open={createModalVisible}
          onOk={createSession}
          onCancel={() => {
            setCreateModalVisible(false);
            resetSessionForm();
          }}
          width={700}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Session Title"
              value={sessionForm.title}
              onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextArea
              placeholder="Description"
              value={sessionForm.description}
              onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
            <Input
              placeholder="Module Code (e.g., CS301)"
              value={sessionForm.moduleCode}
              onChange={(e) => setSessionForm(prev => ({ ...prev, moduleCode: e.target.value }))}
            />
            
            <Space style={{ width: '100%' }}>
              <DatePicker
                placeholder="Date"
                value={sessionForm.date}
                onChange={(date: any) => setSessionForm(prev => ({ ...prev, date }))}
              />
              <TimePicker
                placeholder="Start Time"
                value={sessionForm.startTime}
                onChange={(time) => setSessionForm(prev => ({ ...prev, startTime: time }))}
                format="HH:mm"
              />
              <Input
                placeholder="Duration (minutes)"
                type="number"
                value={sessionForm.duration}
                onChange={(e) => setSessionForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
              />
            </Space>

            <Space style={{ width: '100%' }}>
              <Select
                value={sessionForm.sessionType}
                onChange={(value) => setSessionForm(prev => ({ ...prev, sessionType: value }))}
                style={{ width: '50%' }}
              >
                <Option value="lecture">Lecture</Option>
                <Option value="study">Study</Option>
                <Option value="review">Review</Option>
                <Option value="exam">Exam</Option>
                <Option value="assignment">Assignment</Option>
              </Select>
              
              <Select
                value={sessionForm.priority}
                onChange={(value) => setSessionForm(prev => ({ ...prev, priority: value }))}
                style={{ width: '50%' }}
              >
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
              </Select>
            </Space>

            <Input
              placeholder="Location (optional)"
              value={sessionForm.location}
              onChange={(e) => setSessionForm(prev => ({ ...prev, location: e.target.value }))}
            />

            <div>
              <Text strong>Reminders (minutes before):</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add reminder"
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                />
                <Button onClick={addReminder}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {sessionForm.reminders.map((reminder, index) => (
                  <Tag key={index} closable onClose={() => removeReminder(reminder)}>
                    {reminder}min
                  </Tag>
                ))}
              </Space>
            </div>

            <div>
              <Text strong>Materials:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add material"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                />
                <Button onClick={addMaterial}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {sessionForm.materials.map((material, index) => (
                  <Tag key={index} closable onClose={() => removeMaterial(material)}>
                    {material}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>

        {/* Edit Session Modal */}
        <Modal
          title="Edit Study Session"
          open={editModalVisible}
          onOk={updateSession}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingSession(null);
            resetSessionForm();
          }}
          width={700}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Session Title"
              value={sessionForm.title}
              onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextArea
              placeholder="Description"
              value={sessionForm.description}
              onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
            <Input
              placeholder="Module Code (e.g., CS301)"
              value={sessionForm.moduleCode}
              onChange={(e) => setSessionForm(prev => ({ ...prev, moduleCode: e.target.value }))}
            />
            
            <Space style={{ width: '100%' }}>
              <DatePicker
                placeholder="Date"
                value={sessionForm.date}
                onChange={(date: any) => setSessionForm(prev => ({ ...prev, date }))}
              />
              <TimePicker
                placeholder="Start Time"
                value={sessionForm.startTime}
                onChange={(time) => setSessionForm(prev => ({ ...prev, startTime: time }))}
                format="HH:mm"
              />
              <Input
                placeholder="Duration (minutes)"
                type="number"
                value={sessionForm.duration}
                onChange={(e) => setSessionForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
              />
            </Space>

            <Space style={{ width: '100%' }}>
              <Select
                value={sessionForm.sessionType}
                onChange={(value) => setSessionForm(prev => ({ ...prev, sessionType: value }))}
                style={{ width: '50%' }}
              >
                <Option value="lecture">Lecture</Option>
                <Option value="study">Study</Option>
                <Option value="review">Review</Option>
                <Option value="exam">Exam</Option>
                <Option value="assignment">Assignment</Option>
              </Select>
              
              <Select
                value={sessionForm.priority}
                onChange={(value) => setSessionForm(prev => ({ ...prev, priority: value }))}
                style={{ width: '50%' }}
              >
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
              </Select>
            </Space>

            <Input
              placeholder="Location (optional)"
              value={sessionForm.location}
              onChange={(e) => setSessionForm(prev => ({ ...prev, location: e.target.value }))}
            />

            <div>
              <Text strong>Reminders (minutes before):</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add reminder"
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                />
                <Button onClick={addReminder}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {sessionForm.reminders.map((reminder, index) => (
                  <Tag key={index} closable onClose={() => removeReminder(reminder)}>
                    {reminder}min
                  </Tag>
                ))}
              </Space>
            </div>

            <div>
              <Text strong>Materials:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add material"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                />
                <Button onClick={addMaterial}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {sessionForm.materials.map((material, index) => (
                  <Tag key={index} closable onClose={() => removeMaterial(material)}>
                    {material}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>

        {/* Create Goal Modal */}
        <Modal
          title="Create Study Goal"
          open={goalModalVisible}
          onOk={createGoal}
          onCancel={() => {
            setGoalModalVisible(false);
            resetGoalForm();
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Goal Title"
              value={goalForm.title}
              onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextArea
              placeholder="Description"
              value={goalForm.description}
              onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Space style={{ width: '100%' }}>
              <DatePicker
                placeholder="Target Date"
                value={goalForm.targetDate}
                onChange={(date: any) => setGoalForm(prev => ({ ...prev, targetDate: date }))}
              />
              <Input
                placeholder="Target Hours"
                type="number"
                value={goalForm.targetHours}
                onChange={(e) => setGoalForm(prev => ({ ...prev, targetHours: parseInt(e.target.value) || 0 }))}
              />
            </Space>
            
            <div>
              <Text strong>Modules:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add module"
                  value={newModule}
                  onChange={(e) => setNewModule(e.target.value)}
                />
                <Button onClick={addModule}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {goalForm.modules.map((module, index) => (
                  <Tag key={index} closable onClose={() => removeModule(module)}>
                    {module}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>
      </Space>
    </Card>
  );
};

export default StudyScheduler;
