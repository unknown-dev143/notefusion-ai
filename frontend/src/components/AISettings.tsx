import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Button, 
  Card, 
  Alert, 
  Spin, 
  Typography, 
  Switch, 
  Space, 
  Tooltip,
  Modal,
  message,
  Select
} from 'antd';
import type { SelectProps } from 'antd';
import { 
  SettingOutlined, 
  SaveOutlined, 
  SyncOutlined, 
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import { api, handleApiError } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

type AIModelStatus = 'active' | 'beta' | 'alpha' | 'deprecated';

const { Text } = Typography;

interface AIModel {
  id: number;
  name: string;
  model_id: string;
  provider: string;
  is_available: boolean;
  status: AIModelStatus;
  max_tokens?: number;
  description?: string;
}

interface UserAIModelSettings {
  id: number;
  user_id: number;
  model_id: number;
  is_auto_upgrade: boolean;
  last_upgraded_at?: string;
  ai_model: AIModel;
}

interface AIConfigResponse {
  models: AIModel[];
  settings: UserAIModelSettings;
  update_available: boolean;
  recommended_upgrade?: AIModel;
  last_checked: string;
}

const AISettings: React.FC = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  
  // State for form fields
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [autoUpgrade, setAutoUpgrade] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [recommendedUpgrade, setRecommendedUpgrade] = useState<AIModel | null>(null);

  // Fetch AI configuration
  const { data, isLoading, error, refetch } = useQuery<AIConfigResponse>(
    ['aiSettings'],
    async () => {
      const response = await api.get('/ai/settings');
      return response.data;
    },
    {
      onSuccess: (data) => {
        if (data.settings?.ai_model) {
          setSelectedModel(data.settings.model_id);
          setAutoUpgrade(data.settings.is_auto_upgrade);
        }
        setUpdateAvailable(data.update_available);
        setRecommendedUpgrade(data.recommended_upgrade || null);
      },
      onError: (error) => {
        handleApiError(error, 'Failed to load AI settings');
      },
      enabled: !!currentUser,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  // Update configuration mutation
  const updateConfig = useMutation(
    async (values: { model_id?: number; is_auto_upgrade?: boolean }) => {
      const response = await api.patch('/ai/settings', values);
      return response.data;
    },
    {
      onSuccess: (data: UserAIModelSettings) => {
        queryClient.invalidateQueries(['aiSettings']);
        message.success('Settings updated successfully');
      },
      onError: (error) => {
        handleApiError(error, 'Failed to update settings');
      },
    }
  );

  // Check for model updates
  const checkForUpdates = useCallback(async () => {
    try {
      setIsCheckingForUpdates(true);
      const response = await api.post('/ai/models/check-updates');
      
      if (response.status === 202) {
        // Wait a moment for the update to process
        setTimeout(() => {
          refetch();
          toast.success('Successfully checked for updates');
          setIsCheckingForUpdates(false);
        }, 1500);
      }
    } catch (error) {
      handleApiError(error, 'Failed to check for updates');
      setIsCheckingForUpdates(false);
    }
  }, [refetch]);

  // Handle upgrade to recommended model
  const handleUpgrade = useCallback(() => {
    if (!recommendedUpgrade) return;
    
    updateConfig.mutate({
      model_id: recommendedUpgrade.id,
      is_auto_upgrade: true
    });
    
    setUpdateAvailable(false);
    setIsUpdateModalVisible(false);
  }, [recommendedUpgrade, updateConfig]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (selectedModel === null) {
      message.error('Please select a model');
      return;
    }
    
    updateConfig.mutate({
      model_id: selectedModel,
      is_auto_upgrade: autoUpgrade
    });
  }, [selectedModel, autoUpgrade, updateConfig]);

  // Show loading state
  if (isLoading) {
    return (
      <Card 
        title={
          <Space>
            <SettingOutlined />
            <span>AI Model Settings</span>
          </Space>
        } 
        className="mb-6"
      >
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card 
        title={
          <Space>
            <SettingOutlined />
            <span>AI Model Settings</span>
          </Space>
        } 
        className="mb-6"
      >
        <Alert
          message="Error loading settings"
          description={handleApiError(error, 'Failed to load AI settings. Please try again later.')}
          type="error"
          showIcon
          action={
            <Button 
              type="primary" 
              danger 
              onClick={() => refetch()}
            >
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  const availableModels = data?.models || [];
  const currentSettings = data?.settings;
  const currentModel = availableModels.find(m => m.id === selectedModel);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card 
        title={
          <Space>
            <SettingOutlined />
            <span>AI Model Settings</span>
            {updateAvailable && (
              <Tooltip title="Update available">
                <Button 
                  type="link" 
                  icon={<ArrowUpOutlined style={{ color: '#52c41a' }} />} 
                  onClick={() => setIsUpdateModalVisible(true)}
                />
              </Tooltip>
            )}
          </Space>
        }
        className="shadow-lg"
        extra={
          <Space>
            <Button 
              icon={<SyncOutlined />} 
              onClick={checkForUpdates}
              loading={isCheckingForUpdates}
              disabled={updateConfig.isLoading}
            >
              Check for Updates
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSubmit}
              loading={updateConfig.isLoading}
              disabled={!selectedModel || updateConfig.isLoading}
            >
              Save Settings
            </Button>
          </Space>
        }
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">AI Model</h3>
            <Select
              className="w-full"
              value={selectedModel}
              onChange={setSelectedModel}
              loading={isLoading}
              disabled={isLoading || updateConfig.isLoading}
              placeholder="Select an AI model"
              optionLabelProp="label"
              notFoundContent={isLoading ? 'Loading models...' : 'No models available'}
            >
              {availableModels.map((model) => (
                <Select.Option 
                  key={model.id} 
                  value={model.id}
                  disabled={!model.is_available}
                  label={
                    <span>
                      {model.name} {!model.is_available && '(Unavailable)'}
                    </span>
                  }
                >
                  <div>
                    <div className="font-medium">
                      {model.name} 
                      {model.status === 'beta' && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                          Beta
                        </span>
                      )}
                      {!model.is_available && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          Unavailable
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {model.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {model.provider} • {model.max_tokens ? `Max tokens: ${model.max_tokens.toLocaleString()}` : 'Token limit not specified'}
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
            
            {currentModel && (
              <div className="mt-2 text-sm text-gray-600">
                <InfoCircleOutlined className="mr-1" />
                {currentModel.description} 
                {currentModel.max_tokens && (
                  <span>(max {currentModel.max_tokens.toLocaleString()} tokens)</span>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium mb-1">Automatic Updates</h3>
                <Text type="secondary" className="text-sm">
                  Automatically upgrade to newer model versions when available
                </Text>
              </div>
              <Switch 
                checked={autoUpgrade}
                onChange={setAutoUpgrade}
                loading={updateConfig.isLoading}
              />
            </div>
            
            {currentSettings?.last_upgraded_at && (
              <div className="mt-2 text-sm text-gray-500">
                Last upgraded: {new Date(currentSettings.last_upgraded_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Update Available Modal */}
      <Modal
        title={
          <Space>
            <ArrowUpOutlined style={{ color: '#52c41a' }} />
            <span>Update Available</span>
          </Space>
        }
        open={isUpdateModalVisible}
        onOk={handleUpgrade}
        onCancel={() => setIsUpdateModalVisible(false)}
        okText="Upgrade Now"
        cancelText="Later"
        okButtonProps={{ type: 'primary', danger: false }}
        width={600}
      >
        <div className="space-y-4">
          <p>
            A new version of your selected AI model is available. Would you like to upgrade now?
          </p>
          
          {recommendedUpgrade && currentModel && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">Current Model</div>
                <div className="text-sm text-gray-500">{currentModel.name}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="font-medium">Recommended Upgrade</div>
                <div className="text-sm text-green-600 font-medium">
                  {recommendedUpgrade.name}
                  {recommendedUpgrade.status === 'beta' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      Beta
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {recommendedUpgrade.description}
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <ExclamationCircleOutlined className="text-yellow-500 mr-2 mt-1" />
            <Text type="secondary" className="text-sm">
              Note: Upgrading to a new model may affect the behavior of your AI interactions.
              You can always switch back to a previous model if needed.
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AISettings;
