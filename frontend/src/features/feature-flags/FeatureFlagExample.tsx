import React from 'react';
import { Card, Switch, Typography } from 'antd';
import { useFeatureFlag } from './useFeatureFlag';
<<<<<<< HEAD
import styles from './FeatureFlagExample.module.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

const { Title, Text } = Typography;

export const FeatureFlagExample: React.FC = () => {
  // Example usage of feature flags
  const isDarkModeEnabled = useFeatureFlag('dark-mode');
  const isAiSummarizationEnabled = useFeatureFlag('ai-summarization');
  const isCollaborativeEditingEnabled = useFeatureFlag('collaborative-editing');

  return (
<<<<<<< HEAD
    <Card title="Feature Flags" className={styles['card'] || ''}>
      <div className={styles['featureItem']}>
        <Title level={5}>Dark Mode</Title>
        <div className={styles['featureToggle']}>
=======
    <Card title="Feature Flags" style={{ maxWidth: 600, margin: '20px auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>Dark Mode</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          <Text>Enable dark theme across the application</Text>
          <Switch checked={isDarkModeEnabled} disabled />
        </div>
      </div>
      
<<<<<<< HEAD
      <div className={styles['featureItem']}>
        <Title level={5}>AI Summarization</Title>
        <div className={styles['featureToggle']}>
=======
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>AI Summarization</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          <Text>Enable AI-powered note summarization</Text>
          <Switch checked={isAiSummarizationEnabled} disabled />
        </div>
      </div>
      
<<<<<<< HEAD
      <div className={styles['featureItem']}>
        <Title level={5}>Collaborative Editing</Title>
        <div className={styles['featureToggle']}>
=======
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>Collaborative Editing</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          <Text>Enable real-time collaborative note editing</Text>
          <Switch checked={isCollaborativeEditingEnabled} disabled />
        </div>
      </div>
      
<<<<<<< HEAD
      <div className={styles['footerText']}>
=======
      <div style={{ marginTop: 24, color: '#666' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Text type="secondary">
          These toggles are controlled by feature flags. They can be toggled on/off
          without requiring a new deployment.
        </Text>
      </div>
    </Card>
  );
};

export default FeatureFlagExample;
