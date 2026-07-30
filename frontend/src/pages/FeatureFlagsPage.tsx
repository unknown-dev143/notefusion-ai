import React from 'react';
import { Layout } from 'antd';
import { FeatureFlagExample } from '../features/feature-flags/FeatureFlagExample';
import AppHeader from '../components/AppHeader';

const { Content } = Layout;

const FeatureFlagsPage: React.FC = () => {
  return (
    <Layout className="app-layout">
      <AppHeader collapsed={false} toggleCollapsed={() => {}} isMobile={false} />
      <Content style={{ padding: '24px' }}>
        <FeatureFlagExample />
      </Content>
    </Layout>
  );
};

export default FeatureFlagsPage;
