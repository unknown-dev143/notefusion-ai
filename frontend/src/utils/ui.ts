import { message, notification } from 'antd';

type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export const showMessage = (
  type: MessageType,
  content: string,
  duration: number = 3,
  onClose?: () => void
) => {
  message[type]({
    content,
    duration,
    onClose,
  });
};

type NotificationType = 'success' | 'error' | 'info' | 'warning';

export const showNotification = ({
  type = 'info',
  message,
  description,
  duration = 4.5,
  placement = 'topRight',
  onClose,
}: {
  type?: NotificationType;
  message: string;
  description?: string;
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  onClose?: () => void;
}) => {
  const notificationMethod = notification[type as keyof typeof notification] as (config: any) => void;
  
  notificationMethod({
    message,
    description,
    duration,
    placement,
    onClose,
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text: string, maxLength: number = 100, ellipsis: string = '...'): string => {
  if (!text) return '';
  return text.length > maxLength 
    ? text.substring(0, maxLength) + ellipsis 
    : text;
};

export const formatDate = (dateString: string | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
};
