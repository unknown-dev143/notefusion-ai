import { useEffect, useState } from 'react';

const { Text, Title, Paragraph } = Typography;

type InstallResult = {
  outcome: 'accepted' | 'dismissed' | null;
  platform: 'ios' | 'android' | 'desktop' | 'other';
};

type PWAPlatform = {
  id: 'ios' | 'android' | 'desktop' | 'other';
  name: string;
  icon: React.ReactNode;
  instructions: React.ReactNode;
};

export const PWAInstallPrompt: React.FC = () => {
  const { token } = theme.useToken();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [result, setResult] = useState<InstallResult | null>(null);
  const [platform, setPlatform] = useState<null | 'ios' | 'android' | 'desktop'>(null);
  const { isIos, isStandalone } = usePWA();

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('desktop');
  }, []);

  // Check if the app is running in standalone mode (already installed)
  const checkInstallStatus = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        // @ts-ignore - iOS specific check
                        (window.navigator.standalone === true) || 
                        document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);
    return isStandalone;
  };

  useEffect(() => {
    // Check if the app is already installed
    checkInstallStatus();

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show the install prompt after a delay to not interrupt the user immediately
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // 5 second delay
      
      return () => clearTimeout(timer);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('App was installed');
      setIsInstalled(true);
      setResult({ outcome: 'accepted', platform: platform || 'other' });
      setIsVisible(false);
    };

    // Listen for PWA install events
    if ('onbeforeinstallprompt' in window) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
    
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check for iOS PWA installation
    const isIosPwa = () => {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
      const isInStandaloneMode = 'standalone' in window.navigator && (window.navigator as any).standalone;
      
      return isIos && !isSafari && !isInStandaloneMode;
    };

    // Show iOS install prompt if needed
    if (isIosPwa()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000); // 10 second delay for iOS
      
      return () => clearTimeout(timer);
    }

    // Clean up
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [platform]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Handle iOS or other platforms without beforeinstallprompt
      if (platform === 'ios') {
        // iOS instructions will be shown in the modal
        return;
      }
      return;
    }
    
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      // Update our state based on user's choice
      setResult({ 
        outcome, 
        platform: platform || 'other' 
      });
      
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
      
      // Hide the install button
      setIsVisible(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setResult({ 
      outcome: 'dismissed', 
      platform: platform || 'other' 
    });
    setIsVisible(false);
    
    // Don't show again for a week if dismissed
    localStorage.setItem('pwaPromptDismissed', new Date().toISOString());
  };

  // Don't show the install prompt if the app is already installed
  if (isInstalled || isStandalone) return null;
  
  // Check if user has recently dismissed the prompt
  const dismissedTime = localStorage.getItem('pwaPromptDismissed');
  if (dismissedTime) {
    const dismissedDate = new Date(dismissedTime);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    if (dismissedDate > oneWeekAgo) {
      return null;
    }
  }

  // Platform-specific instructions
  const platforms: PWAPlatform[] = [
    {
      id: 'ios',
      name: 'iOS',
      icon: <AppleOutlined style={{ fontSize: 24 }} />,
      instructions: (
        <ol style={{ margin: '8px 0', paddingLeft: 24 }}>
          <li>Tap the <Text strong>Share</Text> button <Text code>↗️</Text></li>
          <li>Select <Text strong>Add to Home Screen</Text> <Text code>+</Text></li>
          <li>Tap <Text strong>Add</Text> in the top right corner</li>
        </ol>
      )
    },
    {
      id: 'android',
      name: 'Android',
      icon: <AndroidOutlined style={{ fontSize: 24 }} />,
      instructions: (
        <ol style={{ margin: '8px 0', paddingLeft: 24 }}>
          <li>Tap the <Text strong>Menu</Text> button <Text code>⋮</Text></li>
          <li>Select <Text strong>Install App</Text> or <Text strong>Add to Home screen</Text></li>
          <li>Follow the on-screen instructions</li>
        </ol>
      )
    },
    {
      id: 'desktop',
      name: 'Desktop',
      icon: <ChromeOutlined style={{ fontSize: 24 }} />,
      instructions: (
        <ol style={{ margin: '8px 0', paddingLeft: 24 }}>
          <li>Click the <Text strong>Install</Text> button below</li>
          <li>Confirm the installation in the browser prompt</li>
          <li>Launch the app from your desktop or start menu</li>
        </ol>
      )
    },
    {
      id: 'other',
      name: 'Other Devices',
      icon: <InfoCircleOutlined style={{ fontSize: 24 }} />,
      instructions: (
        <p>
          Look for the <Text strong>Install</Text> or <Text strong>Add to Home Screen</Text> option in your browser's menu.
        </p>
      )
    }
  ];

  const currentPlatform = platforms.find(p => p.id === platform) || platforms[platforms.length - 1];

  return (
    <Modal
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      centered
      closable={true}
      width={450}
      className="pwa-install-modal"
    >
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px' }}>
          Install NoteFusion AI
        </Title>
        
        <div style={{ marginBottom: '24px' }}>
          <Text>
            Add NoteFusion AI to your home screen for quick access and an app-like experience.
          </Text>
        </div>
        
        <Space size="middle" style={{ marginTop: '24px' }}>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleInstall}
            size="large"
          >
            Install Now
          </Button>
          <Button onClick={handleClose} size="large">
            Not Now
          </Button>
        </Space>
        
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Click the menu button and select "Install" if the prompt doesn't appear.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default PWAInstallPrompt;
