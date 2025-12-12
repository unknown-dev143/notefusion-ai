import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Space, Typography, List, Badge, message, Tooltip, Switch, Modal, Select, Divider, Avatar, Tag } from 'antd';
import { 
  CloudSyncOutlined, 
  DisconnectOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  DeleteOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface SyncItem {
  id: string;
  type: 'note' | 'document' | 'flashcard' | 'quiz';
  title: string;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  lastModified: number;
  size: number;
  retryCount: number;
}

interface OfflineData {
  notes: any[];
  documents: any[];
  flashcards: any[];
  quizzes: any[];
  lastSync: number;
}

const OfflineSync: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (syncQueue.length > 0) {
        startSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      message.warning('You are now offline. Changes will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue.length]);

  // Load offline data from IndexedDB
  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = async () => {
    try {
      const offlineData = await getOfflineData();
      const queue = await getSyncQueue();
      setSyncQueue(queue);
      if (offlineData.lastSync) {
        setLastSyncTime(new Date(offlineData.lastSync));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const getOfflineData = async (): Promise<OfflineData> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('notefusion-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['offline-data'], 'readonly');
        const store = transaction.objectStore('offline-data');
        const getRequest = store.get('data');
        
        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => {
          resolve(getRequest.result || { notes: [], documents: [], flashcards: [], quizzes: [], lastSync: 0 });
        };
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('offline-data')) {
          db.createObjectStore('offline-data');
        }
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue');
        }
      };
    });
  };

  const getSyncQueue = async (): Promise<SyncItem[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('notefusion-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sync-queue'], 'readonly');
        const store = transaction.objectStore('sync-queue');
        const getRequest = store.getAll();
        
        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => {
          resolve(getRequest.result || []);
        };
      };
    });
  };

  const saveToOfflineStorage = async (data: Partial<OfflineData>) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('notefusion-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['offline-data'], 'readwrite');
        const store = transaction.objectStore('offline-data');
        
        // Get existing data
        const getRequest = store.get('data');
        getRequest.onsuccess = () => {
          const existing = getRequest.result || { notes: [], documents: [], flashcards: [], quizzes: [], lastSync: 0 };
          const updated = { ...existing, ...data };
          
          const putRequest = store.put(updated, 'data');
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve(updated);
        };
      };
    });
  };

  const addToSyncQueue = async (item: Omit<SyncItem, 'retryCount'>) => {
    const queueItem: SyncItem = { ...item, retryCount: 0 };
    
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('notefusion-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sync-queue'], 'readwrite');
        const store = transaction.objectStore('sync-queue');
        
        const putRequest = store.put(queueItem, queueItem.id);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => {
          setSyncQueue(prev => [...prev, queueItem]);
          resolve();
        };
      };
    });
  };

  const removeFromSyncQueue = async (itemId: string) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('notefusion-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sync-queue'], 'readwrite');
        const store = transaction.objectStore('sync-queue');
        
        const deleteRequest = store.delete(itemId);
        deleteRequest.onerror = () => reject(deleteRequest.error);
        deleteRequest.onsuccess = () => {
          setSyncQueue(prev => prev.filter(item => item.id !== itemId));
          resolve();
        };
      };
    });
  };

  const startSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    setSyncProgress(0);
    
    try {
      const queue = [...syncQueue];
      const totalItems = queue.length;
      let syncedItems = 0;
      
      for (const item of queue) {
        try {
          await syncItem(item);
          await removeFromSyncQueue(item.id);
          syncedItems++;
          setSyncProgress((syncedItems / totalItems) * 100);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Update retry count
          const updatedItem = { ...item, retryCount: item.retryCount + 1, status: 'error' as const };
          
          if (item.retryCount >= 3) {
            // Max retries reached, remove from queue
            await removeFromSyncQueue(item.id);
            message.error(`Failed to sync "${item.title}" after 3 attempts`);
          } else {
            // Update item in queue
            await addToSyncQueue(updatedItem);
          }
        }
      }
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      await saveToOfflineStorage({ lastSync: now.getTime() });
      
      message.success('All changes synced successfully!');
    } catch (error) {
      message.error('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const syncItem = async (_item: SyncItem): Promise<void> => {
    // Simulate API call to sync item
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, 1000);
    });
  };

  const clearSyncQueue = async () => {
    Modal.confirm({
      title: 'Clear Sync Queue',
      content: 'Are you sure you want to clear all pending sync items? This cannot be undone.',
      onOk: async () => {
        try {
          const request = indexedDB.open('notefusion-offline', 1);
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['sync-queue'], 'readwrite');
            const store = transaction.objectStore('sync-queue');
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => {
              setSyncQueue([]);
              message.success('Sync queue cleared');
            };
          };
        } catch (error) {
          message.error('Failed to clear sync queue');
        }
      }
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Card 
      title={
        <Space>
          <CloudSyncOutlined />
          <span>Offline Sync</span>
          <Badge 
            status={isOnline ? 'success' : 'error'} 
            text={isOnline ? 'Online' : 'Offline'} 
          />
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Sync Settings">
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setShowSettings(true)}
            />
          </Tooltip>
          <Switch
            checked={offlineMode}
            onChange={setOfflineMode}
            checkedChildren="Offline"
            unCheckedChildren="Online"
          />
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Sync Status */}
        <div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Sync Status</Text>
            {isSyncing ? (
              <div>
                <Progress percent={syncProgress} status="active" />
                <Text type="secondary">Syncing changes...</Text>
              </div>
            ) : (
              <Space>
                {isOnline ? (
                  <Button
                    type="primary"
                    icon={<SyncOutlined />}
                    onClick={startSync}
                    disabled={syncQueue.length === 0}
                  >
                    Sync Now ({syncQueue.length} items)
                  </Button>
                ) : (
                  <Button disabled icon={<DisconnectOutlined />}>
                    Offline
                  </Button>
                )}
                {lastSyncTime && (
                  <Text type="secondary">
                    Last sync: {lastSyncTime.toLocaleString()}
                  </Text>
                )}
              </Space>
            )}
          </Space>
        </div>

        <Divider />

        {/* Sync Queue */}
        <div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Pending Sync Items</Text>
            {syncQueue.length === 0 ? (
              <Text type="secondary">No pending items</Text>
            ) : (
              <List
                dataSource={syncQueue}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Tooltip title="Retry">
                        <Button
                          size="small"
                          icon={<SyncOutlined />}
                          onClick={() => startSync()}
                          disabled={!isOnline || isSyncing}
                        />
                      </Tooltip>,
                      <Tooltip title="Remove">
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeFromSyncQueue(item.id)}
                        />
                      </Tooltip>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={
                            item.status === 'synced' ? <CheckCircleOutlined /> :
                            item.status === 'error' ? <ExclamationCircleOutlined /> :
                            item.status === 'syncing' ? <SyncOutlined spin /> :
                            <CloudSyncOutlined />
                          }
                          style={{
                            backgroundColor: 
                              item.status === 'synced' ? '#52c41a' :
                              item.status === 'error' ? '#ff4d4f' :
                              item.status === 'syncing' ? '#1890ff' :
                              '#faad14'
                          }}
                        />
                      }
                      title={
                        <Space>
                          <span>{item.title}</span>
                          <Tag color={item.type === 'note' ? 'blue' : item.type === 'document' ? 'green' : 'orange'}>
                            {item.type}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">
                            {formatFileSize(item.size)} • {formatTime(item.lastModified)}
                          </Text>
                          {item.retryCount > 0 && (
                            <Text type="danger">
                              Retry count: {item.retryCount}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Space>
        </div>

        {/* Settings Modal */}
        <Modal
          title="Offline Sync Settings"
          open={showSettings}
          onCancel={() => setShowSettings(false)}
          footer={[
            <Button key="cancel" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>,
            <Button key="clear" danger onClick={clearSyncQueue}>
              Clear Queue
            </Button>,
            <Button key="save" type="primary" onClick={() => setShowSettings(false)}>
              Save
            </Button>
          ]}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>Auto-sync when online</Text>
              <Switch defaultChecked style={{ marginLeft: 8 }} />
            </div>
            <div>
              <Text>Max retry attempts</Text>
              <Select defaultValue={3} style={{ marginLeft: 8 }}>
                <Select.Option value={1}>1</Select.Option>
                <Select.Option value={3}>3</Select.Option>
                <Select.Option value={5}>5</Select.Option>
              </Select>
            </div>
            <div>
              <Text>Storage limit</Text>
              <Select defaultValue={100} style={{ marginLeft: 8 }}>
                <Select.Option value={50}>50 MB</Select.Option>
                <Select.Option value={100}>100 MB</Select.Option>
                <Select.Option value={500}>500 MB</Select.Option>
              </Select>
            </div>
          </Space>
        </Modal>
      </Space>
    </Card>
  );
};

export default OfflineSync;
