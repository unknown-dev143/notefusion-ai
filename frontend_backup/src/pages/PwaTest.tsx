import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Space, Divider, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import styles from './PwaTest.module.css';

const { Title, Text, Paragraph } = Typography;

const PwaTest: React.FC = () => {
  const [pwaState, setPwaState] = useState({
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    isOnline: navigator.onLine,
    serviceWorker: 'serviceWorker' in navigator ? 'Supported' : 'Not Supported',
    storage: {
      localStorage: 'localStorage' in window ? 'Supported' : 'Not Supported',
      indexedDB: 'indexedDB' in window ? 'Supported' : 'Not Supported',
      caches: 'caches' in window ? 'Supported' : 'Not Supported',
    },
    installPrompt: null as BeforeInstallPromptEvent | null,
  });

  useEffect(() => {
                       document.referrer.includes('android-app://');

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaState(prev => ({
        ...prev,
        installPrompt: e as BeforeInstallPromptEvent,
        isInstalled: false
      }));
    };

    // Handle online/offline status
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        setPwaState(prev => ({
          ...prev,
          serviceWorker: registrations.length > 0 ? 'Registered' : 'Not Registered'
        }));
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (pwaState.installPrompt) {
      pwaState.installPrompt.prompt();
      const { outcome } = await pwaState.installPrompt.userChoice;
      if (outcome === 'accepted') {
        // Installation was successful, we can update the UI accordingly
        setPwaState(prev => ({
          ...prev,
          isStandalone: true
        }));
      }
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const renderStatus = (status: boolean | string) => {
    const isSuccess = status === true || status === 'Supported' || status === 'Registered';
    return (
      <Tag 
        icon={isSuccess ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
        color={isSuccess ? 'success' : 'error'}
      >
        {typeof status === 'boolean' ? (status ? 'Yes' : 'No') : status}
      </Tag>
    );
  };

  return (
    <div className={styles['container']}>
      <Card title="PWA Test Page" bordered={false}>
        <Title level={3}>PWA Status</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Running as PWA: </Text>
            {renderStatus(pwaState.isStandalone)}
          </div>
          <div>
            <Text strong>Online Status: </Text>
            {renderStatus(pwaState.isOnline)}
          </div>
          <div>
            <Text strong>Service Worker: </Text>
            {renderStatus(pwaState.serviceWorker)}
          </div>
          
          <Divider orientation="left">Storage Support</Divider>
          <div>
            <Text strong>Local Storage: </Text>
            {renderStatus(pwaState.storage.localStorage)}
          </div>
          <div>
            <Text strong>IndexedDB: </Text>
            {renderStatus(pwaState.storage.indexedDB)}
          </div>
          <div>
            <Text strong>Cache API: </Text>
            {renderStatus(pwaState.storage.caches)}
          </div>

          <Divider orientation="left">Actions</Divider>
          <Space>
            <Button 
              type="primary" 
              onClick={handleInstall}
              disabled={!pwaState.installPrompt || pwaState.isStandalone}
            >
              Install App
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleReload}
            >
              Refresh Status
            </Button>
          </Space>

          <Divider orientation="left">Testing Instructions</Divider>
          <Paragraph>
            <ol>
              <li>Click 'Install App' to install the PWA (if available)</li>
              <li>Test offline functionality by going offline in your browser's dev tools</li>
              <li>Check if the service worker is properly caching assets</li>
              <li>Verify that the app works in standalone mode after installation</li>
            </ol>
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
};

export default PwaTest;
