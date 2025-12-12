import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';
import MobileToast, { ToastProps } from './MobileToast';
import MobileGestureHandler from './MobileGestureHandler';
import { isMobile, isTablet } from '../utils/deviceDetection';
import './MobileLayout.css';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isTabletDevice, setIsTabletDevice] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkDevice = () => {
      setIsMobileDevice(isMobile());
      setIsTabletDevice(isTablet());
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handlePullToRefresh = () => {
    addToast({
      type: 'info',
      title: 'Refreshing',
      message: 'Updating content...',
      duration: 2000,
    });
    
    // Trigger actual refresh logic here
    window.location.reload();
  };

  if (!isMobileDevice && !isTabletDevice) {
    // Render desktop layout
    return <>{children || <Outlet />}</>;
  }

  return (
    <div className={`mobile-layout ${orientation}`}>
      <MobileGestureHandler
        onPullToRefresh={handlePullToRefresh}
        onSwipeLeft={() => {
          // Handle swipe left navigation
          console.log('Swipe left detected');
        }}
        onSwipeRight={() => {
          // Handle swipe right navigation
          console.log('Swipe right detected');
        }}
      >
        {/* Mobile Navigation */}
        <MobileNavigation unreadNotifications={toasts.filter(t => t.type === 'info').length} />
        
        {/* Main Content */}
        <main className="mobile-main-content">
          {children || <Outlet />}
        </main>
        
        {/* Toast Container */}
        <div className="mobile-toast-container">
          {toasts.map(toast => (
            <MobileToast
              key={toast.id}
              {...toast}
              onClose={removeToast}
            />
          ))}
        </div>
      </MobileGestureHandler>
    </div>
  );
};

export default MobileLayout;
