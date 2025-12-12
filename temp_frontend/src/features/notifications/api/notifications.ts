import { apiClient } from '@/lib/api';

// Re-export the WebSocket service
export { webSocketService };

export interface NotificationFilters {
  is_read?: boolean;
  status?: NotificationStatus;
  type?: NotificationType;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'read_at' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface NotificationCounts {
  total: number;
  unread: number;
  read: number;
  [key: string]: number; // For notification type counts
}

export interface MarkAsReadResponse {
  success: boolean;
  notification: Notification;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  updated_count: number;
}

export interface DeleteResponse {
  success: boolean;
  deleted: boolean;
  id: string;
}

/**
 * Fetches notifications based on the provided filters
 */
export const getNotifications = async (
  filters: NotificationFilters = {}
): Promise<{ data: Notification[]; total: number }> => {
  const response = await api.get('/api/notifications', { 
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
  const response = await api.get(`/api/notifications/${id}`);
  return response.data;
};

/**
 * Fetches notification counts (total, read, unread, etc.)
 */
export const getNotificationCounts = async (): Promise<NotificationCounts> => {
  const response = await api.get('/api/notifications/counts');
  return response.data;
};

/**
 * Marks a notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<MarkAsReadResponse> => {
  const response = await api.patch(`/api/notifications/${id}/read`);
  return response.data;
};

/**
 * Marks all notifications as read for the current user
 */
export const markAllNotificationsAsRead = async (): Promise<MarkAllAsReadResponse> => {
  const response = await api.patch('/api/notifications/read-all');
  return response.data;
};

/**
 * Deletes a notification
 */
export const deleteNotification = async (id: string): Promise<DeleteResponse> => {
  const response = await api.delete(`/api/notifications/${id}`);
  return response.data;
};

/**
 * Deletes all notifications for the current user
 */
export const deleteAllNotifications = async (): Promise<{ success: boolean; deleted_count: number }> => {
  const response = await api.delete('/api/notifications');
  return response.data;
};

/**
 * Subscribes to push notifications
 */
export const subscribeToPushNotifications = async (subscription: PushSubscription): Promise<{ success: boolean }> => {
  const response = await api.post('/api/notifications/subscribe', { 
    subscription,
    device: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    },
  });
  return response.data;
};

export const unsubscribeFromPushNotifications = async (): Promise<{ success: boolean }> => {
  const response = await apiClient.post('/api/v1/notifications/unsubscribe');
  return response.data;
};
