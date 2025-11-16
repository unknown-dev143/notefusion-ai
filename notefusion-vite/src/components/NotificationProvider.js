import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from './Notification';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({ open: false, type: 'success', message: '' });

  const showNotification = useCallback((type, message, duration = 4000) => {
    setNotification({ open: true, type, message, duration });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification
        open={notification.open}
        type={notification.type}
        message={notification.message}
        duration={notification.duration}
        onClose={closeNotification}
      />
    </NotificationContext.Provider>
  );
}
