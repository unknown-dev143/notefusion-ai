import { api } from '../../../lib/api';
import { 
  Notification, 
  NotificationStatus, 
  NotificationType,
  NotificationFilters,
  NotificationCounts,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  DeleteResponse,
} from '../types';
import { webSocketService } from '../services/websocket';

// Re-export the WebSocket service
export { webSocketService };

/**
 * Fetches notifications based on the provided filters
 */
export const getNotifications = async (
  filters: NotificationFilters = {}
): Promise<{ data: Notification[]; total: number }> => {
  const response = await api.get('/notifications', { 
    params: {
      limit: 20, // Default limit
      offset: 0, // Default offset
      sort_by: 'created_at',
      sort_order: 'desc',
      ...filters
    } 
  });
  
  return {
    data: response.data.notifications || [],
    total: response.data.total || 0
  };
};

/**
 * Fetches a single notification by ID
 */
export const getNotification = async (id: string): Promise<Notification> => {
  const response = await api.get(`/notifications/${id}`);
  return response.data;
};

/**
 * Fetches notification counts (total, read, unread, etc.)
 */
export const getNotificationCounts = async (): Promise<NotificationCounts> => {
  const response = await api.get('/notifications/counts');
  return response.data;
};

/**
 * Marks a notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<MarkAsReadResponse> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Marks all notifications as read for the current user
 */
export const markAllNotificationsAsRead = async (): Promise<MarkAllAsReadResponse> => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

/**
 * Deletes a notification
 */
export const deleteNotification = async (id: string): Promise<DeleteResponse> => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

/**
 * Deletes all notifications for the current user
 */
export const deleteAllNotifications = async (): Promise<{ success: boolean; deleted_count: number }> => {
  const response = await api.delete('/notifications');
  return response.data;
};

/**
 * Subscribes to push notifications
 */
export const subscribeToPushNotifications = async (subscription: PushSubscription): Promise<{ success: boolean }> => {
  const response = await api.post('/notifications/subscribe', { 
    subscription,
    device: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    },
  });
  return response.data;
};

export const unsubscribeFromPushNotifications = async (): Promise<{ success: boolean }> => {
  const response = await api.post('/notifications/unsubscribe');
  return response.data;
};
