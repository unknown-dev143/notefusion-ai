import React from 'react';
import { Spin } from 'antd';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  message?: string;
  fullscreen?: boolean;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  message,
  fullscreen = false,
  overlay = false
}) => {
  const className = [
    'loading-spinner',
    fullscreen && 'fullscreen',
    overlay && 'overlay'
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <Spin size={size} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
