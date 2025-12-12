import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { notification as notificationApi, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import './NotificationSystem.css';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (newNotification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const notification: NotificationItem = {
      ...newNotification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      duration: newNotification.duration || 4.5
    };

    setNotifications(prev => [notification, ...prev]);

    // Show antd notification
    notificationApi.open({
      type: notification.type,
      message: notification.title,
      description: notification.message,
      duration: notification.duration,
      btn: notification.action && (
        <Button type="primary" size="small" onClick={notification.action.onClick}>
          {notification.action.label}
        </Button>
      )
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Auto-remove old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev =>
        prev.filter(n => Date.now() - n.timestamp.getTime() < 24 * 60 * 60 * 1000) // 24 hours
      );
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      clearAll,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Dropdown Component
export const NotificationDropdown: React.FC = () => {
  const { notifications, markAsRead, clearAll } = useNotifications();

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h4>Notifications</h4>
        {notifications.length > 0 && (
          <Button type="text" size="small" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <BellOutlined />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                  {new Date(notification.timestamp).toLocaleString()}
                </div>
              </div>
              {!notification.read && <div className="notification-dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
