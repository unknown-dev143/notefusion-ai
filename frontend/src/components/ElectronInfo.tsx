import React, { useEffect, useState } from 'react';
import { useElectron } from '../hooks/useElectron';
import { Card, Typography, Space, Tag, Alert } from 'antd';
import { DesktopOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const ElectronInfo: React.FC = () => {
  const { 
    isAvailable, 
    getPlatform, 
    isDev, 
    getAppVersion,
    send
  } = useElectron();
  
  const [platform, setPlatform] = useState<NodeJS.Platform | undefined>(undefined);
  const [appVersion, setAppVersion] = useState<string>('1.0.0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isAvailable) {
      setPlatform(getPlatform());
      setAppVersion(getAppVersion());
      
      // Example of sending a message to the main process
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const response = await send<string>('app:info');
          setMessage(response);
        } catch (error) {
          console.error('Error fetching app info:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [isAvailable, getPlatform, getAppVersion, send]);

  if (!isAvailable) {
    return (
      <Alert
        type="warning"
        message="Electron is not available"
        description="This component is designed to work in an Electron environment. It will only show information when running in the Electron app."
        showIcon
      />
    );
  }

  return (
    <Card 
      title={
        <Space>
          <DesktopOutlined />
          <span>Electron App Information</span>
        </Space>
      }
      style={{ marginBottom: 24 }}
      loading={isLoading}
    >
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <div>
          <Text strong>App Version: </Text>
          <Tag color="blue">{appVersion}</Tag>
        </div>
        
        <div>
          <Text strong>Platform: </Text>
          <Tag color="green">{platform || 'Unknown'}</Tag>
        </div>
        
        <div>
          <Text strong>Environment: </Text>
          <Tag color={isDev() ? 'orange' : 'purple'}>
            {isDev() ? 'Development' : 'Production'}
          </Tag>
        </div>
        
        {message && (
          <Alert
            type="info"
            message={
              <Space>
                <InfoCircleOutlined />
                <span>Message from Main Process</span>
              </Space>
            }
            description={message}
            showIcon
          />
        )}
        
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            This information is being provided by the Electron main process.
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default ElectronInfo;
