import React from 'react';
import { Card, Switch, Typography } from 'antd';
import { useFeatureFlag } from './useFeatureFlag';
import styles from './FeatureFlagExample.module.css';

const { Title, Text } = Typography;

export const FeatureFlagExample: React.FC = () => {
  // Example usage of feature flags
  const isDarkModeEnabled = useFeatureFlag('dark-mode');
  const isAiSummarizationEnabled = useFeatureFlag('ai-summarization');
  const isCollaborativeEditingEnabled = useFeatureFlag('collaborative-editing');

  return (
    <Card title="Feature Flags" className={styles['card'] || ''}>
      <div className={styles['featureItem']}>
        <Title level={5}>Dark Mode</Title>
        <div className={styles['featureToggle']}>
          <Text>Enable dark theme across the application</Text>
          <Switch checked={isDarkModeEnabled} disabled />
        </div>
      </div>
      
      <div className={styles['featureItem']}>
        <Title level={5}>AI Summarization</Title>
        <div className={styles['featureToggle']}>
          <Text>Enable AI-powered note summarization</Text>
          <Switch checked={isAiSummarizationEnabled} disabled />
        </div>
      </div>
      
      <div className={styles['featureItem']}>
        <Title level={5}>Collaborative Editing</Title>
        <div className={styles['featureToggle']}>
          <Text>Enable real-time collaborative note editing</Text>
          <Switch checked={isCollaborativeEditingEnabled} disabled />
        </div>
      </div>
      
      <div className={styles['footerText']}>
        <Text type="secondary">
          These toggles are controlled by feature flags. They can be toggled on/off
          without requiring a new deployment.
        </Text>
      </div>
    </Card>
  );
};

export default FeatureFlagExample;
