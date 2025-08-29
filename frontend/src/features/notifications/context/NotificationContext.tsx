import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Notification, NotificationType } from '../types';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  getNotificationCounts,
  webSocketService
} from '../api/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications using React Query
  const { 
    data: notifications = [], 
    isLoading, 
    error,
    refetch: refetchNotifications 
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => getNotifications({ is_read: false }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Fetch notification counts
  const { data: counts = { total: 0, unread: 0, read: 0 } } = useQuery({
    queryKey: ['notificationCounts'],
    queryFn: getNotificationCounts,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Set up WebSocket connection and event listeners
  useEffect(() => {
    // Connect to WebSocket
    const connectWebSocket = async () => {
      try {
        await webSocketService.connect();
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };

    connectWebSocket();

    // Set up event listeners
    const handleNewNotification = (notification: Notification) => {
      // Update the notifications list optimistically
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => {
        // Don't add duplicates
        if (old.some(n => n.id === notification.id)) return old;
        return [notification, ...old];
      });

      // Update counts
      queryClient.setQueryData(['notificationCounts'], (old: any) => ({
        ...old,
        unread: (old?.unread || 0) + 1,
        total: (old?.total || 0) + 1
      }));

      // Play notification sound if enabled
      playNotificationSound();
    };

    const handleNotificationUpdate = (update: { id: string; status: string; read_at: string | null }) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => 
        old.map(n => 
          n.id === update.id 
            ? { ...n, status: update.status, read_at: update.read_at }
            : n
        )
      );

      // Update counts if needed
      if (update.status === 'read') {
        queryClient.setQueryData(['notificationCounts'], (old: any) => ({
          ...old,
          unread: Math.max(0, (old?.unread || 1) - 1),
          read: (old?.read || 0) + 1
        }));
      }
    };

    const handleNotificationDelete = (deleted: { id: string }) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => 
        old.filter(n => n.id !== deleted.id)
      );

      // Update counts if needed
      queryClient.setQueryData(['notificationCounts'], (old: any) => {
        const notification = notifications.find(n => n.id === deleted.id);
        return {
          total: Math.max(0, (old?.total || 1) - 1),
          unread: notification && !notification.is_read 
            ? Math.max(0, (old?.unread || 1) - 1) 
            : old?.unread || 0,
          read: notification && notification.is_read
            ? Math.max(0, (old?.read || 1) - 1)
            : old?.read || 0
        };
      });
    };

    // Subscribe to WebSocket events
    const unsubscribeNew = webSocketService.onNotification(handleNewNotification);
    const unsubscribeUpdate = webSocketService.onNotificationUpdate(handleNotificationUpdate);
    const unsubscribeDelete = webSocketService.onNotificationDelete(handleNotificationDelete);
    
    // Subscribe to connection status changes
    const unsubscribeStatus = webSocketService.onConnectionStatusChange(setIsConnected);

    // Clean up on unmount
    return () => {
      unsubscribeNew();
      unsubscribeUpdate();
      unsubscribeDelete();
      unsubscribeStatus();
      webSocketService.disconnect();
    };
  }, [queryClient, notifications]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(e => console.warn('Failed to play notification sound:', e));
    } catch (e) {
      console.warn('Error playing notification sound:', e);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']) || [];
      
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => 
        old.map(n => 
          n.id === id 
            ? { ...n, status: 'read', read_at: new Date().toISOString() }
            : n
        )
      );

      // Update counts optimistically
      queryClient.setQueryData(['notificationCounts'], (old: any) => ({
        ...old,
        unread: Math.max(0, (old?.unread || 1) - 1),
        read: (old?.read || 0) + 1
      }));

      // Call the API
      await markNotificationAsRead(id);
      
      // Revalidate
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Optimistic update
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']) || [];
      const unreadCount = previousNotifications.filter(n => !n.is_read).length;
      
      if (unreadCount === 0) return;
      
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => 
        old.map(n => ({
          ...n, 
          status: 'read', 
          read_at: n.read_at || new Date().toISOString()
        }))
      );

      // Update counts optimistically
      queryClient.setQueryData(['notificationCounts'], (old: any) => ({
        ...old,
        unread: 0,
        read: (old?.read || 0) + unreadCount
      }));

      // Call the API
      await markAllNotificationsAsRead();
      
      // Revalidate
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
      throw error;
    }
  };

  // Remove a notification
  const removeNotification = async (id: string) => {
    try {
      // Optimistic update
      const notificationToRemove = notifications.find(n => n.id === id);
      if (!notificationToRemove) return;
      
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => 
        old.filter(n => n.id !== id)
      );

      // Update counts optimistically
      queryClient.setQueryData(['notificationCounts'], (old: any) => ({
        total: Math.max(0, (old?.total || 1) - 1),
        unread: !notificationToRemove.is_read 
          ? Math.max(0, (old?.unread || 1) - 1) 
          : old?.unread || 0,
        read: notificationToRemove.is_read
          ? Math.max(0, (old?.read || 1) - 1)
          : old?.read || 0
      }));

      // Call the API
      await deleteNotification(id);
      
      // Revalidate
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
      throw error;
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      // Optimistic update
      const count = notifications.length;
      const unreadCount = notifications.filter(n => !n.is_read).length;
      
      queryClient.setQueryData<Notification[]>(['notifications'], []);
      
      // Update counts optimistically
      queryClient.setQueryData(['notificationCounts'], (old: any) => ({
        total: 0,
        unread: 0,
        read: 0
      }));

      // Call the API for each notification
      await Promise.all(notifications.map(n => deleteNotification(n.id)));
      
      // Revalidate
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
      throw error;
    }
  };

  // Refetch all notification data
  const refetch = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      queryClient.invalidateQueries({ queryKey: ['notificationCounts'] })
    ]);
  };

  const value = {
    notifications,
    unreadCount: counts.unread,
    totalCount: counts.total,
    isLoading,
    error: error as Error | null,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    refetch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
