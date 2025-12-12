import { apiClient, ApiResponse } from './apiClient';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'social' | 'achievement' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  action_url?: string;
  action_text?: string;
  icon?: string;
  image_url?: string;
  expires_at?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreference {
  user_id: string;
  channel: 'email' | 'push' | 'in_app' | 'sms';
  type: string;
  enabled: boolean;
  settings: {
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
    quiet_hours?: {
      start: string;
      end: string;
      timezone: string;
    };
    max_daily?: number;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  title_template: string;
  message_template: string;
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
    default_value?: any;
  }>;
  default_channels: Array<'email' | 'push' | 'in_app' | 'sms'>;
  is_active: boolean;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent?: string;
  is_active: boolean;
  created_at: string;
}

class NotificationsAPI {
  private socket: Socket | null = null;

  // Notifications
  async getNotifications(params?: {
    is_read?: boolean;
    type?: string;
    category?: string;
    priority?: string;
    limit?: number;
    offset?: number;
    sort_by?: 'created_at' | 'priority';
    sort_order?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ notifications: Notification[]; total: number; unread_count: number }>> {
    return apiClient.get('/notifications', params);
  }

  async getNotification(notificationId: string): Promise<ApiResponse<Notification>> {
    return apiClient.get(`/notifications/${notificationId}`);
  }

  async markAsRead(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put(`/notifications/${notificationId}/read`);
  }

  async markAsUnread(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put(`/notifications/${notificationId}/unread`);
  }

  async markAllAsRead(params?: {
    type?: string;
    category?: string;
  }): Promise<ApiResponse<{ marked_count: number }>> {
    return apiClient.put('/notifications/read-all', params);
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/notifications/${notificationId}`);
  }

  async deleteAllNotifications(params?: {
    type?: string;
    category?: string;
    is_read?: boolean;
  }): Promise<ApiResponse<{ deleted_count: number }>> {
    return apiClient.delete('/notifications', { data: params });
  }

  async createNotification(data: {
    user_ids?: string[];
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    action_url?: string;
    action_text?: string;
    icon?: string;
    image_url?: string;
    expires_at?: string;
    channels?: Array<'email' | 'push' | 'in_app' | 'sms'>;
  }): Promise<ApiResponse<Notification[]>> {
    return apiClient.post('/notifications', data);
  }

  // Preferences
  async getPreferences(): Promise<ApiResponse<NotificationPreference[]>> {
    return apiClient.get('/notifications/preferences');
  }

  async updatePreference(preferenceId: string, data: {
    enabled: boolean;
    settings: NotificationPreference['settings'];
  }): Promise<ApiResponse<NotificationPreference>> {
    return apiClient.put(`/notifications/preferences/${preferenceId}`, data);
  }

  async updateAllPreferences(preferences: Array<{
    channel: 'email' | 'push' | 'in_app' | 'sms';
    type: string;
    enabled: boolean;
    settings: NotificationPreference['settings'];
  }>): Promise<ApiResponse<NotificationPreference[]>> {
    return apiClient.put('/notifications/preferences', { preferences });
  }

  async resetPreferences(): Promise<ApiResponse<NotificationPreference[]>> {
    return apiClient.post('/notifications/preferences/reset');
  }

  // Push Notifications
  async subscribeToPush(data: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
    user_agent?: string;
  }): Promise<ApiResponse<PushSubscription>> {
    return apiClient.post('/notifications/push/subscribe', data);
  }

  async unsubscribeFromPush(subscriptionId?: string): Promise<ApiResponse<void>> {
    const endpoint = subscriptionId 
      ? `/notifications/push/unsubscribe/${subscriptionId}`
      : '/notifications/push/unsubscribe';
    return apiClient.post(endpoint);
  }

  async getPushSubscriptions(): Promise<ApiResponse<PushSubscription[]>> {
    return apiClient.get('/notifications/push/subscriptions');
  }

  async testPushNotification(data?: {
    title?: string;
    message?: string;
  }): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post('/notifications/push/test', data);
  }

  // Templates (Admin)
  async getTemplates(params?: {
    type?: string;
    category?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<NotificationTemplate[]>> {
    return apiClient.get('/notifications/templates', params);
  }

  async getTemplate(templateId: string): Promise<ApiResponse<NotificationTemplate>> {
    return apiClient.get(`/notifications/templates/${templateId}`);
  }

  async createTemplate(data: {
    name: string;
    type: string;
    category: string;
    title_template: string;
    message_template: string;
    variables: Array<{
      name: string;
      type: 'string' | 'number' | 'boolean' | 'date';
      required: boolean;
      default_value?: any;
    }>;
    default_channels: Array<'email' | 'push' | 'in_app' | 'sms'>;
  }): Promise<ApiResponse<NotificationTemplate>> {
    return apiClient.post('/notifications/templates', data);
  }

  async updateTemplate(templateId: string, data: Partial<NotificationTemplate>): Promise<ApiResponse<NotificationTemplate>> {
    return apiClient.put(`/notifications/templates/${templateId}`, data);
  }

  async deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/notifications/templates/${templateId}`);
  }

  async previewTemplate(templateId: string, variables: Record<string, any>): Promise<ApiResponse<{
    title: string;
    message: string;
  }>> {
    return apiClient.post(`/notifications/templates/${templateId}/preview`, { variables });
  }

  // Analytics
  async getAnalytics(params?: {
    period_start?: string;
    period_end?: string;
    type?: string;
    channel?: string;
  }): Promise<ApiResponse<{
    summary: {
      total_sent: number;
      total_delivered: number;
      total_read: number;
      delivery_rate: number;
      read_rate: number;
      average_delivery_time: number;
    };
    trends: Array<{
      date: string;
      sent: number;
      delivered: number;
      read: number;
    }>;
    by_type: Record<string, {
      sent: number;
      delivered: number;
      read: number;
      delivery_rate: number;
      read_rate: number;
    }>;
    by_channel: Record<string, {
      sent: number;
      delivered: number;
      read: number;
      delivery_rate: number;
      read_rate: number;
    }>;
    performance: {
      average_delivery_time: number;
      fastest_delivery: number;
      slowest_delivery: number;
      error_rate: number;
    };
  }>> {
    return apiClient.get('/notifications/analytics', params);
  }

  async getNotificationStats(notificationId: string): Promise<ApiResponse<{
    sent_at: string;
    delivered_at?: string;
    read_at?: string;
    delivery_time?: number;
    read_time?: number;
    attempts: number;
    errors: Array<{
      timestamp: string;
      error: string;
      channel: string;
    }>;
  }>> {
    return apiClient.get(`/notifications/${notificationId}/stats`);
  }

  // Bulk Operations
  async bulkCreate(data: {
    notifications: Array<{
      user_id: string;
      type: string;
      title: string;
      message: string;
      data?: Record<string, any>;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      category?: string;
      action_url?: string;
      action_text?: string;
      icon?: string;
      image_url?: string;
      expires_at?: string;
    }>;
    channels?: Array<'email' | 'push' | 'in_app' | 'sms'>;
  }): Promise<ApiResponse<{
    successful: Notification[];
    failed: Array<{
      user_id: string;
      error: string;
    }>;
  }>> {
    return apiClient.post('/notifications/bulk', data);
  }

  async bulkMarkAsRead(notificationIds: string[]): Promise<ApiResponse<{ marked_count: number }>> {
    return apiClient.put('/notifications/bulk/read', { notification_ids: notificationIds });
  }

  async bulkDelete(notificationIds: string[]): Promise<ApiResponse<{ deleted_count: number }>> {
    return apiClient.delete('/notifications/bulk', { data: { notification_ids: notificationIds } });
  }

  // Real-time WebSocket
  connect(token: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(`${apiClient['baseURL'].replace('/api/v1', '')}/notifications`, {
      auth: { token },
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback: (notification: Notification) => void): void {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  onNotificationRead(callback: (notificationId: string) => void): void {
    if (this.socket) {
      this.socket.on('notification_read', callback);
    }
  }

  onUnreadCountUpdate(callback: (count: number) => void): void {
    if (this.socket) {
      this.socket.on('unread_count_update', callback);
    }
  }

  // Scheduled Notifications
  async scheduleNotification(data: {
    user_ids: string[];
    type: string;
    title: string;
    message: string;
    scheduled_at: string;
    data?: Record<string, any>;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    action_url?: string;
    action_text?: string;
    icon?: string;
    image_url?: string;
    expires_at?: string;
    channels?: Array<'email' | 'push' | 'in_app' | 'sms'>;
  }): Promise<ApiResponse<{ scheduled_id: string; scheduled_at: string }>> {
    return apiClient.post('/notifications/schedule', data);
  }

  async getScheduledNotifications(params?: {
    status?: 'pending' | 'sent' | 'failed' | 'cancelled';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    scheduled: Array<{
      id: string;
      user_ids: string[];
      type: string;
      title: string;
      message: string;
      scheduled_at: string;
      status: 'pending' | 'sent' | 'failed' | 'cancelled';
      created_at: string;
    }>;
    total: number;
  }>> {
    return apiClient.get('/notifications/scheduled', params);
  }

  async cancelScheduledNotification(scheduledId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(`/notifications/schedule/${scheduledId}/cancel`);
  }

  async updateScheduledNotification(scheduledId: string, data: {
    scheduled_at?: string;
    title?: string;
    message?: string;
    data?: Record<string, any>;
  }): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put(`/notifications/schedule/${scheduledId}`, data);
  }
}

export const notificationsAPI = new NotificationsAPI();
