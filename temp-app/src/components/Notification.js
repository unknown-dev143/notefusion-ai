import React from 'react';

const notificationStyles = {
  base: {
    position: 'fixed',
    top: 20,
    right: 20,
    minWidth: 300,
    zIndex: 9999,
    padding: '16px 24px',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 500,
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 16
  },
  success: { background: '#4caf50' },
  error: { background: '#f44336' },
  warning: { background: '#ff9800' },
  partial_success: { background: '#2196f3' }
};

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  partial_success: 'ℹ️'
};

export default function Notification({ open, type, message, onClose, duration = 4000 }) {
  React.useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div style={{ ...notificationStyles.base, ...notificationStyles[type || 'success'] }}>
      <span>{icons[type] || 'ℹ️'}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
