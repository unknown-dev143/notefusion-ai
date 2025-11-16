import { useEffect, useState } from 'react';
import { Button, Modal, notification } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

type UpdateNotificationProps = {
  registration?: ServiceWorkerRegistration;
  onUpdate?: () => void;
};

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  registration,
  onUpdate,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  // Show update notification when a new service worker is waiting
  useEffect(() => {
    if (!registration) return;

    const handleUpdateFound = () => {
      if (registration.waiting) {
        showUpdateNotification();
        return;
      }

      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateNotification();
        }
      });
    };

    // Function to handle service worker updates
    const checkForUpdates = async (): Promise<void> => {
      try {
        console.log('Checking for service worker updates...');
        await registration.update();
        console.log('Service worker update check complete');
      } catch (error) {
        console.error('Error checking for service worker updates:', error);
      }
    };

    // Check for updates immediately
    checkForUpdates();
    
    // Check for updates every hour
    const updateInterval = setInterval(() => {
      checkForUpdates();
    }, 60 * 60 * 1000);

    // Listen for the updatefound event
    registration.addEventListener('updatefound', handleUpdateFound);

    // Initial check
    handleUpdateFound();

    return () => {
      clearInterval(updateInterval);
      registration.removeEventListener('updatefound', handleUpdateFound);
    };
  }, [registration]);

  const showUpdateNotification = () => {
    // Show a notification that an update is available
    const key = `update-${Date.now()}`;
    
    api.info({
      key,
      message: 'Update Available',
      description: 'A new version of the app is available.',
      btn: (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            api.destroy(key);
            setIsModalVisible(true);
          }}
        >
          Update Now
        </Button>
      ),
      duration: 0, // Don't auto-close
      placement: 'bottomRight',
    });
  };

  const handleUpdate = () => {
    if (!registration?.waiting) {
      window.location.reload();
      return;
    }

    setIsUpdating(true);
    
    // Send a message to the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // When the new service worker takes over, reload the page
    const handleControllerChange = () => {
      window.location.reload();
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
    
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    
    // Also listen for the service worker to become active
    registration.waiting.addEventListener('statechange', (e) => {
      if (e.target instanceof ServiceWorker && e.target.state === 'activated') {
        window.location.reload();
      }
    });
    
    // Call the onUpdate callback if provided
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Update Available"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="later" onClick={() => setIsModalVisible(false)}>
            Later
          </Button>,
          <Button
            key="update"
            type="primary"
            icon={<ReloadOutlined spin={isUpdating} />}
            onClick={handleUpdate}
            loading={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Now'}
          </Button>,
        ]}
      >
        <p>A new version of the app is available. Would you like to update now?</p>
        <p><small>The app will reload after updating.</small></p>
      </Modal>
    </>
  );
};

export default UpdateNotification;
