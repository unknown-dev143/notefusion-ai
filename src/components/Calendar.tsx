import React, { useState } from 'react';
import { Card, Typography, Button, Space, Badge, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: string;
  color: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync to discuss project progress',
      date: dayjs().format('YYYY-MM-DD'),
      time: '10:00',
      category: 'Work',
      color: '#1890ff'
    },
    {
      id: '2',
      title: 'Study Session',
      description: 'Review notes for upcoming exam',
      date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      time: '14:00',
      category: 'Study',
      color: '#52c41a'
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form] = Form.useForm();

  const getDaysInMonth = (date: Dayjs) => {
    const startOfMonth = date.startOf('month');
    const endOfMonth = date.endOf('month');
    const days = [];
    
    // Add empty cells for days before month starts
    const startDay = startOfMonth.day();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let i = 0; i < endOfMonth.date(); i++) {
      days.push(startOfMonth.date(i + 1));
    }
    
    return days;
  };

  const getEventsForDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return events.filter(event => event.date === dateStr);
  };

  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
      // Show events for this date
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    form.resetFields();
    form.setFieldsValue({
      date: selectedDate,
      time: '09:00',
      category: 'Work',
      color: '#1890ff'
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    form.setFieldsValue({
      ...event,
      date: dayjs(event.date),
      time: event.time
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = (values: any) => {
    const eventData: CalendarEvent = {
      id: editingEvent?.id || Date.now().toString(),
      title: values.title,
      description: values.description,
      date: values.date.format('YYYY-MM-DD'),
      time: values.time,
      category: values.category,
      color: values.color
    };

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? eventData : e));
      message.success('Event updated successfully!');
    } else {
      setEvents([...events, eventData]);
      message.success('Event added successfully!');
    }

    setShowEventModal(false);
    form.resetFields();
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    message.success('Event deleted successfully!');
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(selectedDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#f0f0f0', marginBottom: '1px' }}>
          {weekDays.map(day => (
            <div key={day} style={{ 
              background: '#fafafa', 
              padding: '8px', 
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              {day}
            </div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#f0f0f0' }}>
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} style={{ background: 'white', height: '100px' }} />;
            }

            const dayEvents = getEventsForDate(day);
            const isToday = day.isSame(dayjs(), 'day');
            const isSelected = day.isSame(selectedDate, 'day');

            return (
              <div
                key={day.format('YYYY-MM-DD')}
                onClick={() => handleDateClick(day)}
                style={{
                  background: 'white',
                  height: '100px',
                  padding: '4px',
                  cursor: 'pointer',
                  border: isToday ? '2px solid #1890ff' : isSelected ? '2px solid #722ed1' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: isToday ? 'bold' : 'normal',
                  color: isToday ? '#1890ff' : 'inherit'
                }}>
                  {day.date()}
                </div>
                <div style={{ marginTop: '4px' }}>
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      style={{
                        fontSize: '10px',
                        background: event.color,
                        color: 'white',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        marginBottom: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                    >
                      {event.time} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card title="Calendar" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Calendar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button 
              onClick={() => setSelectedDate(selectedDate.subtract(1, 'month'))}
            >
              Previous
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {selectedDate.format('MMMM YYYY')}
            </Title>
            <Button 
              onClick={() => setSelectedDate(selectedDate.add(1, 'month'))}
            >
              Next
            </Button>
            <Button 
              onClick={() => setSelectedDate(dayjs())}
            >
              Today
            </Button>
          </Space>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddEvent}
          >
            Add Event
          </Button>
        </div>

        {/* Calendar Grid */}
        {renderCalendar()}

        {/* Events List for Selected Date */}
        <div>
          <Title level={5}>
            Events for {selectedDate.format('MMMM D, YYYY')}
          </Title>
          {getEventsForDate(selectedDate).length === 0 ? (
            <Text type="secondary">No events scheduled for this date</Text>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              {getEventsForDate(selectedDate).map(event => (
                <Card key={event.id} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <ClockCircleOutlined style={{ color: event.color }} />
                        <Text strong>{event.time}</Text>
                        <Badge color={event.color} text={event.category} />
                      </div>
                      <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                        {event.title}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {event.description}
                      </Text>
                    </div>
                    <Space>
                      <Button 
                        size="small" 
                        onClick={() => handleEditEvent(event)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        danger
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        Delete
                      </Button>
                    </Space>
                  </div>
                </Card>
              ))}
            </Space>
          )}
        </div>
      </Space>

      {/* Add/Edit Event Modal */}
      <Modal
        title={editingEvent ? 'Edit Event' : 'Add Event'}
        open={showEventModal}
        onCancel={() => setShowEventModal(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveEvent}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter event title' }]}
          >
            <Input placeholder="Event title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Event description" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: 'Please enter time' }]}
          >
            <Input placeholder="HH:MM" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              <Select.Option value="Work">Work</Select.Option>
              <Select.Option value="Study">Study</Select.Option>
              <Select.Option value="Personal">Personal</Select.Option>
              <Select.Option value="Meeting">Meeting</Select.Option>
              <Select.Option value="Deadline">Deadline</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
            rules={[{ required: true, message: 'Please select color' }]}
          >
            <Select>
              <Select.Option value="#1890ff">Blue</Select.Option>
              <Select.Option value="#52c41a">Green</Select.Option>
              <Select.Option value="#faad14">Yellow</Select.Option>
              <Select.Option value="#722ed1">Purple</Select.Option>
              <Select.Option value="#f5222d">Red</Select.Option>
              <Select.Option value="#8c8c8c">Gray</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button onClick={() => setShowEventModal(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingEvent ? 'Update' : 'Save'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
};

export default Calendar;
