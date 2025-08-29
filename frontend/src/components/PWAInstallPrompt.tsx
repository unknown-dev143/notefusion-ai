import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import { Button, Snackbar, Alert, Box, Typography, Paper } from '@mui/material';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

const PWAInstallPrompt: React.FC = () => {
  const { isPWAInstalled, isOffline, canInstall, installPWA, canNotify, requestNotificationPermission } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  useEffect(() => {
    // Show install banner if PWA can be installed and isn't already installed
    if (canInstall && !isPWAInstalled) {
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [canInstall, isPWAInstalled]);

  useEffect(() => {
    // Show notification permission prompt if not already granted/denied
    if ('Notification' in window && notificationPermission === 'default') {
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notificationPermission]);

  const handleInstallClick = async () => {
    const installed = await installPWA();
    if (installed) {
      setShowInstallBanner(false);
    }
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    setShowNotificationPrompt(false);
    
    if (permission === 'granted') {
      // Show a welcome notification
      new Notification('Notifications Enabled', {
        body: 'You will now receive notifications from NoteFusion AI',
        icon: '/logo192.png',
      });
    }
  };

  const handleCloseInstallBanner = () => {
    setShowInstallBanner(false);
  };

  const handleCloseNotificationPrompt = () => {
    setShowNotificationPrompt(false);
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1400 }}>
      {/* Install Banner */}
      <Snackbar
        open={showInstallBanner}
        onClose={handleCloseInstallBanner}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <InstallDesktopIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Install NoteFusion AI</Typography>
              <Typography variant="body2" color="text.secondary">
                Add to your home screen for a better experience
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleInstallClick}
              sx={{ ml: 'auto' }}
            >
              Install
            </Button>
            <Button 
              color="inherit" 
              onClick={handleCloseInstallBanner}
            >
              Not Now
            </Button>
          </Box>
        </Paper>
      </Snackbar>

      {/* Notification Permission Prompt */}
      <Snackbar
        open={showNotificationPrompt}
        onClose={handleCloseNotificationPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ mb: 2, mr: 2 }}
      >
        <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, maxWidth: 400 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Enable Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Get notified about important updates and reminders from NoteFusion AI
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
            <Button 
              size="small" 
              onClick={handleCloseNotificationPrompt}
              color="inherit"
            >
              Later
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              color="primary"
              onClick={handleEnableNotifications}
            >
              Enable
            </Button>
          </Box>
        </Paper>
      </Snackbar>

      {/* Offline Status */}
      {isOffline && (
        <Box 
          sx={{
            bgcolor: 'warning.light',
            color: 'warning.contrastText',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <CloudOffIcon fontSize="small" />
          <Typography variant="caption">
            You are currently offline. Some features may be limited.
          </Typography>
        </Box>
      )}

      {/* Online Status */}
      {!isOffline && !isPWAInstalled && (
        <Box 
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 1,
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 3,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
          onClick={handleInstallClick}
          title="Install NoteFusion AI"
        >
          <InstallDesktopIcon />
        </Box>
      )}
    </Box>
  );
};

export default PWAInstallPrompt;
