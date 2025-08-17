import React from 'react';
import { Card, Switch, Typography } from 'antd';
import { useFeatureFlag } from './useFeatureFlag';

const { Title, Text } = Typography;

export const FeatureFlagExample: React.FC = () => {
  // Example usage of feature flags
  const isDarkModeEnabled = useFeatureFlag('dark-mode');
  const isAiSummarizationEnabled = useFeatureFlag('ai-summarization');
  const isCollaborativeEditingEnabled = useFeatureFlag('collaborative-editing');

  return (
    <Card title="Feature Flags" style={{ maxWidth: 600, margin: '20px auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>Dark Mode</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Enable dark theme across the application</Text>
          <Switch checked={isDarkModeEnabled} disabled />
        </div>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>AI Summarization</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Enable AI-powered note summarization</Text>
          <Switch checked={isAiSummarizationEnabled} disabled />
        </div>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>Collaborative Editing</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Enable real-time collaborative note editing</Text>
          <Switch checked={isCollaborativeEditingEnabled} disabled />
        </div>
      </div>
      
      <div style={{ marginTop: 24, color: '#666' }}>
        <Text type="secondary">
          These toggles are controlled by feature flags. They can be toggled on/off
          without requiring a new deployment.
        </Text>
      </div>
    </Card>
  );
};

export default FeatureFlagExample;
