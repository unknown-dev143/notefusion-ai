import React, { useEffect, useState } from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseOutlined } from '@ant-design/icons';
import './MobileToast.css';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: (id: string) => void;
}

const MobileToast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  persistent = false,
  action,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Auto-dismiss if not persistent
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined className="toast-icon success" />;
      case 'error':
        return <CloseCircleOutlined className="toast-icon error" />;
      case 'warning':
        return <WarningOutlined className="toast-icon warning" />;
      case 'info':
      default:
        return <InfoCircleOutlined className="toast-icon info" />;
    }
  };

  return (
    <div
      className={`mobile-toast ${type} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}
      onClick={handleClose}
    >
      <div className="toast-content">
        <div className="toast-icon-wrapper">
          {getIcon()}
        </div>
        <div className="toast-text">
          {title && <div className="toast-title">{title}</div>}
          <div className="toast-message">{message}</div>
          {action && (
            <button className="toast-action" onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              handleClose();
            }}>
              {action.label}
            </button>
          )}
        </div>
        {!persistent && (
          <button
          className="toast-close"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          aria-label="Close notification"
          title="Close notification"
        >
            <CloseOutlined />
          </button>
        )}
      </div>
      {!persistent && duration > 0 && (
        <div
          className="toast-progress"
          style={{
            animationDuration: `${duration}ms`,
          }}
        />
      )}
    </div>
  );
};

export default MobileToast;
