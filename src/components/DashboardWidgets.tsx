import React, { useState } from 'react';
import { Card, Typography, Button, Space, Row, Col } from 'antd';
import { DragOutlined, SettingOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Widget {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'notes' | 'tasks' | 'calendar' | 'timer';
  size: 'small' | 'medium' | 'large';
  content: React.ReactNode;
}

const DashboardWidgets: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: '1',
      title: 'Study Statistics',
      type: 'stats',
      size: 'medium',
      content: (
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>4.5</Title>
          <Text>Hours Studied Today</Text>
          <br />
          <Text type="secondary">+15% from yesterday</Text>
        </div>
      )
    },
    {
      id: '2',
      title: 'Recent Notes',
      type: 'notes',
      size: 'large',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
            <Text strong>Math Chapter 5</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>2 hours ago</Text>
          </div>
          <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
            <Text strong>Physics Lab Report</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>5 hours ago</Text>
          </div>
          <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
            <Text strong>Essay Outline</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>Yesterday</Text>
          </div>
        </Space>
      )
    },
    {
      id: '3',
      title: 'Upcoming Tasks',
      type: 'tasks',
      size: 'medium',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Math Assignment</Text>
            <Text type="secondary">Due Today</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Physics Quiz</Text>
            <Text type="secondary">Due Tomorrow</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Essay Draft</Text>
            <Text type="secondary">Due in 3 days</Text>
          </div>
        </Space>
      )
    },
    {
      id: '4',
      title: 'Quick Timer',
      type: 'timer',
      size: 'small',
      content: (
        <div style={{ textAlign: 'center' }}>
          <Title level={3}>25:00</Title>
          <Button type="primary" size="small">Start</Button>
        </div>
      )
    }
  ]);

  const [isEditMode, setIsEditMode] = useState(false);

  const availableWidgets = [
    { id: '5', title: 'Study Progress', type: 'chart', size: 'medium' },
    { id: '6', title: 'Calendar', type: 'calendar', size: 'large' },
    { id: '7', title: 'Goals Tracker', type: 'stats', size: 'small' },
    { id: '8', title: 'Recent Activity', type: 'notes', size: 'medium' }
  ];

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const index = widgets.findIndex(w => w.id === id);
    if (index === -1) return;

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(index, 1);
    
    if (direction === 'up' && index > 0) {
      newWidgets.splice(index - 1, 0, removed);
    } else if (direction === 'down' && index < widgets.length - 1) {
      newWidgets.splice(index + 1, 0, removed);
    }
    
    setWidgets(newWidgets);
  };

  const addWidget = (widgetTemplate: any) => {
    const newWidget: Widget = {
      ...widgetTemplate,
      content: getDefaultContent(widgetTemplate.type)
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  };

  const resizeWidget = (id: string, newSize: 'small' | 'medium' | 'large') => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, size: newSize } : widget
    ));
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'chart':
        return <div style={{ textAlign: 'center', padding: '20px' }}>📊 Chart Widget</div>;
      case 'calendar':
        return <div style={{ textAlign: 'center', padding: '20px' }}>📅 Calendar Widget</div>;
      case 'stats':
        return <div style={{ textAlign: 'center', padding: '20px' }}>📈 Stats Widget</div>;
      default:
        return <div style={{ textAlign: 'center', padding: '20px' }}>Widget Content</div>;
    }
  };

  const getColSpan = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 6;
      case 'medium': return 12;
      case 'large': return 24;
      default: return 12;
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Dashboard Widgets</Title>
        <Space>
          <Button
            type={isEditMode ? 'primary' : 'default'}
            icon={<SettingOutlined />}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? 'Done' : 'Customize'}
          </Button>
        </Space>
      </div>

      {isEditMode && (
        <Card title="Available Widgets" style={{ marginBottom: 24 }}>
          <Space wrap>
            {availableWidgets.map(widget => (
              <Button
                key={widget.id}
                icon={<PlusOutlined />}
                onClick={() => addWidget(widget)}
              >
                {widget.title}
              </Button>
            ))}
          </Space>
        </Card>
      )}

      <Row gutter={[16, 16]}>
          {widgets.map((widget, index) => (
            <Col
              key={widget.id}
              xs={24}
              sm={getColSpan(widget.size)}
            >
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{widget.title}</span>
                    {isEditMode && (
                      <Space>
                        <Button
                          size="small"
                          icon={<DragOutlined />}
                          onClick={() => moveWidget(widget.id, 'up')}
                          disabled={index === 0}
                        />
                        <Button
                          size="small"
                          icon={<MinusOutlined />}
                          onClick={() => removeWidget(widget.id)}
                        />
                        <Button
                          size="small"
                          onClick={() => moveWidget(widget.id, 'down')}
                          disabled={index === widgets.length - 1}
                        >
                          ↓
                        </Button>
                      </Space>
                    )}
                  </div>
                }
                size="small"
                style={{ height: '100%' }}
              >
                {widget.content}
                
                {isEditMode && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                    <Space>
                      <Text type="secondary">Size:</Text>
                      <Button
                        size="small"
                        type={widget.size === 'small' ? 'primary' : 'default'}
                        onClick={() => resizeWidget(widget.id, 'small')}
                      >
                        Small
                      </Button>
                      <Button
                        size="small"
                        type={widget.size === 'medium' ? 'primary' : 'default'}
                        onClick={() => resizeWidget(widget.id, 'medium')}
                      >
                        Medium
                      </Button>
                      <Button
                        size="small"
                        type={widget.size === 'large' ? 'primary' : 'default'}
                        onClick={() => resizeWidget(widget.id, 'large')}
                      >
                        Large
                      </Button>
                    </Space>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>

      {widgets.length === 0 && (
        <Card style={{ textAlign: 'center', marginTop: 24 }}>
          <Title level={4} type="secondary">
            No widgets on dashboard
          </Title>
          <Text type="secondary">
            Click "Customize" to add widgets to your dashboard
          </Text>
        </Card>
      )}
    </div>
  );
};

export default DashboardWidgets;
