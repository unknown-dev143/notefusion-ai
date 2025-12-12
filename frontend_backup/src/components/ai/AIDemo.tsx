import React, { useState, useCallback } from 'react';
import { Card, Button, Space, Typography, message, Spin } from 'antd';
import { 
  BulbOutlined,
  SendOutlined
} from '@ant-design/icons';
import styles from './AIDemo.module.css';

const { Text } = Typography;

interface ActionItem {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface AIDemoProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Handler for action execution
   * @param action - The action key being executed
   * @param data - Optional data to pass to the action
   * @returns Promise that resolves with the result string
   */
  onAction: (action: string, data?: Record<string, unknown>) => Promise<string>;
  
  /** List of available actions to display */
  availableActions: ActionItem[];
  
  /** Optional loading state override */
  isLoading?: boolean;
  
  /** Optional error message to display */
  error?: string | null;
  
  /** Optional content to process */
  content?: string;
  
  /** Callback when content is updated */
  onContentUpdate?: (content: string) => void;
}

/**
 * AIDemo - A reusable AI assistant component with action buttons and result display
 */
const AIDemo: React.FC<AIDemoProps> = ({
  onAction,
  availableActions,
  className = '',
  isLoading: externalLoading,
  error,
  content = '',
  onContentUpdate,
  ...rest
}) => {
  const [result, setResult] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading ?? internalLoading;

  const handleAction = useCallback(async (action: string) => {
    if (!content.trim()) {
      message.warning('Please enter some text first');
      return;
    }

    setInternalLoading(true);
    setSelectedAction(action);
    setResult('');
    
    try {
      const response = await onAction(action, { content });
      
      // If we have an onContentUpdate handler and the action is not just a query
      if (onContentUpdate && !['summarize', 'query'].includes(action)) {
        onContentUpdate(response);
      }
      
      setResult(response);
    } catch (err) {
      console.error('Error performing action:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      message.error(`Failed to perform action: ${errorMessage}`);
      setResult('');
      throw err;
    } finally {
      setInternalLoading(false);
    }
  }, [onAction, content, onContentUpdate]);

  const renderActionButtons = useCallback(() => (
    availableActions.map((action) => {
      const buttonClassName = styles['actionButton'] || '';
      return (
        <Button
          key={action.key}
          type={selectedAction === action.key ? 'primary' : 'default'}
          icon={action.icon}
          onClick={() => !isLoading && handleAction(action.key)}
          loading={isLoading && selectedAction === action.key}
          disabled={isLoading || Boolean(action.disabled)}
          className={buttonClassName}
          aria-label={action.description || action.label}
          aria-pressed={selectedAction === action.key ? 'true' : 'false'}
        >
          {action.label}
        </Button>
      );
    })
  ), [availableActions, selectedAction, isLoading, handleAction, styles]);

  return (
    <div 
      {...rest} 
      className={`${styles['aiDemo']} ${className || ''}`.trim()}
      data-testid="ai-demo"
    >
      <Card 
        className={`${styles['card'] || ''}`}
        title={
          <Space align="center">
            <BulbOutlined aria-hidden="true" />
            <Text>AI Assistant</Text>
          </Space>
        }
        loading={isLoading}
        // Use rootClassName for the root card element
        rootClassName={styles['cardRoot'] || ''}
      >
        <div className={styles['actionsContainer']} role="toolbar" aria-label="AI Actions">
          {renderActionButtons()}
        </div>

        <div 
          className={styles['resultContainer']} 
          aria-live="polite"
          aria-atomic="true"
        >
          {isLoading ? (
            <div className={styles['loadingContainer']}>
              <Spin size="large" aria-label="Loading" />
              <Text type="secondary" className={`${styles['loadingText'] || ''}`}>
                Processing your request...
              </Text>
            </div>
          ) : error ? (
            <div className={styles['errorContainer']} role="alert">
              <Text type="danger">{error}</Text>
            </div>
          ) : result ? (
            <div className={styles['resultContent']}>
              <Text>{result}</Text>
            </div>
          ) : (
            <div className={styles['placeholder']}>
              <SendOutlined 
                className={styles['placeholderIcon']} 
                aria-hidden="true"
              />
              <Text type="secondary">Select an action to get started</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AIDemo;
