import React, { useState, useRef, useEffect } from 'react';
import { Badge, Dropdown, Button, Tooltip, Spin } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNotifications } from '../context/NotificationContext';
import { NotificationCenter } from './NotificationCenter';
import styles from './NotificationBadge.module.css';

interface NotificationBadgeProps {
  className?: string;
  style?: React.CSSProperties;
  showText?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  className = '',
  style = {},
  showText = false,
}) => {
  const { unreadCount, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleVisibleChange = (visible: boolean) => {
    setIsOpen(visible);
  };

  const overlay = (
    <div ref={dropdownRef} className={styles.notificationDropdown}>
      <div className={styles.dropdownHeader}>
        <h3>Notifications</h3>
        <Button 
          type="link" 
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            // Handle mark all as read
          }}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>
      <div className={styles.notificationContent}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spin size="small" />
            <span>Loading notifications...</span>
          </div>
        ) : (
          <NotificationCenter 
            maxHeight={400}
            showMarkAsRead={true}
            showDelete={true}
            onClose={() => setIsOpen(false)}
          />
        )}
      </div>
      <div className={styles.dropdownFooter}>
        <Button 
          type="link" 
          size="small" 
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to notifications page
            window.location.href = '/notifications';
          }}
        >
          View all notifications
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      overlay={overlay}
      trigger={['click']}
      visible={isOpen}
      onVisibleChange={handleVisibleChange}
      placement="bottomRight"
      overlayClassName={styles.notificationDropdownOverlay}
    >
      <div 
        className={`${styles.notificationTrigger} ${className}`} 
        style={style}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <Tooltip title="Notifications">
          <Badge 
            count={unreadCount} 
            size="small"
            style={{ 
              boxShadow: 'none',
              fontSize: '10px',
              fontWeight: 600,
              lineHeight: '16px',
              height: '16px',
              minWidth: '16px',
              padding: '0 4px',
              zIndex: 10,
              ...(unreadCount === 0 ? { display: 'none' } : {})
            }}
            className={styles.notificationBadge}
          >
            <div className={styles.bellIconContainer}>
              <BellOutlined className={styles.bellIcon} />
            </div>
          </Badge>
        </Tooltip>
        {showText && <span className={styles.notificationText}>Notifications</span>}
      </div>
    </Dropdown>
  );
};

export default NotificationBadge;
