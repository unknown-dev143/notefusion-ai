import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      
      // Show prompt after 30 seconds
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    } else {
      console.log('User dismissed PWA install');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-6 text-white border-2 border-blue-400">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black mb-1">Install NoteFusion AI</h3>
            <p className="text-sm text-blue-100 font-medium">
              Get instant access from your home screen
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm text-blue-50">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span>Works offline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🚀</span>
            <span>Faster loading</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📱</span>
            <span>App-like experience</span>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="w-full bg-white text-blue-600 py-3 px-4 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Download size={18} />
          Install App
        </button>

        <button
          onClick={handleDismiss}
          className="w-full mt-2 text-white/80 hover:text-white py-2 text-sm font-bold transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
