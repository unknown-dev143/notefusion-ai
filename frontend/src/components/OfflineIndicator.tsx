import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm ${
          isOnline
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-900 text-white'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi size={18} />
            <span>Back online!</span>
          </>
        ) : (
          <>
            <WifiOff size={18} />
            <span>You're offline - Changes will sync when reconnected</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
