import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visible, setVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Mock notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Welcome to NoteFusion AI!',
          message: 'Start by creating your first note or try our AI chat feature.',
          type: 'info',
          read: false,
          createdAt: dayjs().subtract(1, 'hour').toISOString()
        },
        {
          id: '2',
          title: 'Task Due Soon',
          message: 'Your task "Review lecture notes" is due tomorrow.',
          type: 'warning',
          read: false,
          createdAt: dayjs().subtract(2, 'hours').toISOString(),
          actionUrl: '/tasks'
        },
        {
          id: '3',
          title: 'AI Feature Available',
          message: 'Try our new AI chat assistant to help with your notes!',
          type: 'success',
          read: true,
          createdAt: dayjs().subtract(1, 'day').toISOString(),
          actionUrl: '/ai-chat'
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    }
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  if (!user) return null;

  return (
    <ErrorBoundary componentName="NotificationCenter">
      <div style={{ position: 'relative' }}>
        <Badge count={unreadCount} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            onClick={() => setVisible(!visible)}
          />
        </Badge>

        {visible && (
          <Card
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: '350px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button type="link" size="small" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
              </div>
            }
            size="small"
          >
            {notifications.length === 0 ? (
              <Text type="secondary">No notifications</Text>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  style={{
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    backgroundColor: notification.read ? 'transparent' : '#f6ffed'
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong={!notification.read}>{notification.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {notification.message}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {dayjs(notification.createdAt).fromNow()}
                      </Text>
                    </div>
                    {!notification.read && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#1890ff',
                          borderRadius: '50%',
                          marginTop: '4px'
                        }}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
};
