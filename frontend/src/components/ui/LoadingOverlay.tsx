import React, { ReactElement } from 'react';
import { Spin, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { SpinIndicator } from 'antd/es/spin';
import styles from './LoadingOverlay.module.css';

const { Text } = Typography;

interface LoadingOverlayProps {
  loading: boolean;
  text?: string;
  fullScreen?: boolean;
  size?: 'small' | 'default' | 'large';
  className?: string;
  style?: React.CSSProperties;
  indicator?: SpinIndicator;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  text = 'Loading...',
  fullScreen = false,
  size = 'default',
  className = '',
  style = {},
  indicator,
}) => {
  if (!loading) return null;

  const getIndicator = (): ReactElement => {
    if (indicator) {
      return <>{indicator}</>;
    }
    return <LoadingOutlined className={`${styles['loadingSpinner']} ${styles[size]}`} spin />;
  };

  const content = (
    <div
      className={`${styles['loadingOverlay']} ${fullScreen ? styles['fullscreen'] : ''} ${className}`}
      style={style}
    >
      <Space direction="vertical" align="center" size="middle">
        <Spin indicator={getIndicator()} />
        {text && <Text className={styles['loadingText']}>{text}</Text>}
      </Space>
    </div>
  );

  return content;
};

export default LoadingOverlay;
