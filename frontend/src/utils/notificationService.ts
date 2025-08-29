import { toast } from 'react-toastify';

// Check if the browser supports notifications
const isNotificationSupported = () => {
  return 'Notification' in window;
};

// Check if service workers are supported
const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

// Request notification permission
const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    toast.warning('This browser does not support desktop notifications');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      toast.success('Notifications enabled!');
    } else if (permission === 'denied') {
      toast.warning('Notifications are blocked. Please enable them in your browser settings.');
    }
    
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    toast.error('Failed to request notification permission');
    return 'denied';
  }
};

// Check current notification permission
const checkNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

// Send a test notification
const sendTestNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
  if (checkNotificationPermission() !== 'granted') {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body: options?.body || 'This is a test notification',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      ...options
    });
  } catch (error) {
    console.error('Error showing notification:', error);
    toast.error('Failed to show notification');
  }
};

// Subscribe to push notifications
const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  if (!isServiceWorkerSupported()) {
    toast.warning('Push notifications are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      return subscription;
    }

    // Subscribe to push notifications
    const publicVapidKey = 'BP0jv8yZ4XJYQ3vJ7W8r9cT0uVwXyZ1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U';
    const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    // In a real app, you would send the subscription to your server here
    console.log('Push subscription:', subscription);
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    toast.error('Failed to subscribe to push notifications');
    return null;
  }
};

// Unsubscribe from push notifications
const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const success = await subscription.unsubscribe();
      if (success) {
        toast.success('Successfully unsubscribed from push notifications');
      }
      return success;
    }
    
    return true; // Already unsubscribed
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    toast.error('Failed to unsubscribe from push notifications');
    return false;
  }
};

// Helper function to convert base64 to Uint8Array
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};

export {
  isNotificationSupported,
  isServiceWorkerSupported,
  requestNotificationPermission,
  checkNotificationPermission,
  sendTestNotification,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications
};
