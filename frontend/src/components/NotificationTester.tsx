import React, { useState, useEffect } from 'react';
import {
  isNotificationSupported,
  isServiceWorkerSupported,
  requestNotificationPermission,
  checkNotificationPermission,
  sendTestNotification,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications
} from '../utils/notificationService';
import { Button, Card, Typography, Box, Divider, Paper, Alert } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { toast } from 'react-toastify';

const NotificationTester: React.FC = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check support and permissions on component mount
  useEffect(() => {
    const checkSupport = () => {
      const supportsNotifications = isNotificationSupported();
      const supportsServiceWorker = isServiceWorkerSupported();
      setIsSupported(supportsNotifications && supportsServiceWorker);
      
      if (supportsNotifications) {
        setPermission(checkNotificationPermission());
      }
      
      // Check if already subscribed to push notifications
      if (supportsServiceWorker) {
        checkPushSubscription();
      }
    };

    checkSupport();
    
    // Listen for permission changes
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName })
        .then(notificationPerm => {
          notificationPerm.onchange = () => {
            setPermission(checkNotificationPermission());
          };
        });
    }
    
    // Cleanup
    return () => {
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'notifications' as PermissionName })
          .then(notificationPerm => {
            notificationPerm.onchange = null;
          });
      }
    };
  }, []);

  // Check if user is already subscribed to push notifications
  const checkPushSubscription = async () => {
    if (!isServiceWorkerSupported()) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  // Request notification permission
  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
    } finally {
      setIsLoading(false);
    }
  };

  // Send a test notification
  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      await sendTestNotification('Test Notification', {
        body: 'This is a test notification from NoteFusion AI',
        data: { url: window.location.href },
        actions: [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to push notifications
  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        setIsSubscribed(true);
        toast.success('Successfully subscribed to push notifications!');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to subscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from push notifications
  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to unsubscribe from push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Render status indicators
  const renderStatus = () => {
    if (!isSupported) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your browser does not support notifications or service workers.
        </Alert>
      );
    }

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          <strong>Notification Support:</strong> {isSupported ? '✅ Available' : '❌ Not Available'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Permission Status:</strong> {permission === 'granted' ? '✅ Granted' : permission === 'denied' ? '❌ Denied' : '⚠️ Default'}
        </Typography>
        <Typography variant="body1">
          <strong>Push Subscription:</strong> {isSubscribed ? '✅ Subscribed' : '❌ Not Subscribed'}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', my: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        {permission === 'granted' ? (
          <NotificationsActiveIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        ) : (
          <NotificationsOffIcon color="action" sx={{ fontSize: 40, mr: 2 }} />
        )}
        <Typography variant="h5" component="h2">
          Notification Settings
        </Typography>
      </Box>

      {renderStatus()}

      <Divider sx={{ my: 3 }} />

      <Box display="flex" flexDirection="column" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRequestPermission}
          disabled={!isSupported || permission === 'granted' || isLoading}
          fullWidth
        >
          {permission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
        </Button>

        <Button
          variant="outlined"
          onClick={handleTestNotification}
          disabled={!isSupported || permission !== 'granted' || isLoading}
          fullWidth
        >
          Send Test Notification
        </Button>

        {!isSubscribed ? (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubscribe}
            disabled={!isSupported || permission !== 'granted' || isLoading}
            fullWidth
          >
            Subscribe to Push Notifications
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleUnsubscribe}
            disabled={!isSupported || !isSubscribed || isLoading}
            fullWidth
          >
            Unsubscribe from Push Notifications
          </Button>
        )}
      </Box>

      <Box mt={3}>
        <Typography variant="body2" color="textSecondary">
          Note: Make sure to allow notifications in your browser settings if you've previously denied them.
        </Typography>
      </Box>
    </Paper>
  );
};

export default NotificationTester;
