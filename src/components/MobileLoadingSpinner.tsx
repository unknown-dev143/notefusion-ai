import React from 'react';
import './MobileLoadingSpinner.css';

interface MobileLoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  overlay?: boolean;
}

const MobileLoadingSpinner: React.FC<MobileLoadingSpinnerProps> = ({
  size = 'medium',
  text = 'Loading...',
  overlay = false,
}) => {
  return (
    <div className={`mobile-loading-container ${overlay ? 'overlay' : ''}`}>
      <div className={`mobile-loading-spinner ${size}`}>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {text && <div className="mobile-loading-text">{text}</div>}
    </div>
  );
};

export default MobileLoadingSpinner;
