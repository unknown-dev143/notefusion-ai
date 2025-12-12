// Base notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  created_at: string;
  updated_at?: string;
  read_at?: string;
  data?: Record<string, any>;
  user_id: string;
  reminder_id?: string;
  // Computed properties for UI
  is_read?: boolean;
  is_new?: boolean;
}

// Notification status enum
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

// Notification type enum
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  REMINDER = 'reminder',
  MENTION = 'mention',
  ASSIGNMENT = 'assignment',
  SYSTEM = 'system',
  AUTH = 'auth',
  PAYMENT = 'payment',
  PROMOTIONAL = 'promotional',
  OTHER = 'other',
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// WebSocket message types
export type WebSocketMessageType = 
  | 'notification'
  | 'notification_update'
  | 'notification_deleted'
  | 'auth'
  | 'ping'
  | 'pong';

// WebSocket message interface
export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: string;
}

// Notification update payload
export interface NotificationUpdate {
  id: string;
  status?: NotificationStatus;
  read_at?: string;
  updated_at?: string;
  // Other fields that can be updated
  [key: string]: any;
}

// Notification delete payload
export interface NotificationDelete {
  id: string;
  user_id: string;
  was_unread: boolean;
  deleted_at: string;
}

// Notification counts by type
export interface NotificationCounts {
  total: number;
  unread: number;
  read: number;
  [key: string]: number; // For notification type counts
}

// Notification filter options
export interface NotificationFilters {
  status?: NotificationStatus | NotificationStatus[];
  type?: NotificationType | NotificationType[];
  priority?: NotificationPriority | NotificationPriority[];
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at' | 'read_at' | 'title';
  sort_order?: 'asc' | 'desc';
  search?: string;
  user_id?: string;
  reminder_id?: string;
}

// Paginated response for notifications
export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_more: boolean;
}

// Response for marking notifications as read
export interface MarkAsReadResponse {
  success: boolean;
  notification: Notification;
}

// Response for marking all notifications as read
export interface MarkAllAsReadResponse {
  success: boolean;
  updated_count: number;
}

// Response for deleting notifications
export interface DeleteResponse {
  success: boolean;
  deleted: boolean;
  id: string;
}

// Notification settings for user
export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  notification_sound: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  // Per-type notification settings
  notification_types: {
    [key in NotificationType]?: {
      email?: boolean;
      push?: boolean;
      in_app?: boolean;
    };
  };
  // Notification quiet hours (don't send notifications during these times)
  quiet_hours?: {
    enabled: boolean;
    start_time: string; // e.g., '22:00'
    end_time: string;   // e.g., '08:00'
    timezone: string;   // e.g., 'America/New_York'
  };
  // Additional preferences
  preferences?: {
    [key: string]: any;
  };
}
