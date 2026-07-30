type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export const showMessage = (
  type: MessageType,
  content: string,
  duration: number = 3000,
  onClose?: () => void
) => {
  // Create a simple toast notification instead of using antd
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-white' :
    type === 'info' ? 'bg-blue-500 text-white' :
    'bg-gray-500 text-white'
  }`;
  toast.textContent = content;
  
  document.body.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
    if (onClose) onClose();
  }, duration);
};

type NotificationType = 'success' | 'error' | 'info' | 'warning';

export const showNotification = ({
  type = 'info',
  message,
  description,
  duration = 4500,
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
  // Create a more detailed notification
  const notification = document.createElement('div');
  notification.className = `fixed p-4 rounded-lg shadow-lg z-50 max-w-sm ${
    placement === 'topRight' ? 'top-4 right-4' :
    placement === 'topLeft' ? 'top-4 left-4' :
    placement === 'bottomRight' ? 'bottom-4 right-4' :
    'bottom-4 left-4'
  } ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  
  notification.innerHTML = `
    <div class="font-semibold">${message}</div>
    ${description ? `<div class="text-sm mt-1 opacity-90">${description}</div>` : ''}
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after duration
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
    if (onClose) onClose();
  }, duration);
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
