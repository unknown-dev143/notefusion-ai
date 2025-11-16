import { message, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React from 'react';

// Success message
export const showSuccess = (content: string) => {
  message.success(content);
};

// Error message
export const showError = (error: string | Error) => {
  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';
  message.error(errorMessage);
};

// Warning message
export const showWarning = (content: string) => {
  message.warning(content);
};

// Info message
export const showInfo = (content: string) => {
  message.info(content);
};

// Confirmation dialog
export const confirm = ({
  title,
  content,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
}: {
  title: string;
  content: string;
  onOk: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
}) => {
  Modal.confirm({
    title,
    icon: React.createElement(ExclamationCircleOutlined),
    content: content as React.ReactNode,
    okText,
    cancelText,
    onOk,
    onCancel,
  });
};

// Format date
export const formatDate = (dateString: string | Date, format = 'MMM d, yyyy') => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Format date and time
export const formatDateTime = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Truncate text
export const truncate = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Generate a unique ID
export const generateId = (prefix = 'id') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};
