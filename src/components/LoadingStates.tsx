import React from 'react';
import { Skeleton, Card, Spin, Typography, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Page Skeleton Loader
export const PageSkeleton: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Skeleton active paragraph={{ rows: 4 }} />
    <div style={{ marginTop: '24px' }}>
      <Skeleton active paragraph={{ rows: 6 }} />
    </div>
  </div>
);

// Card Skeleton Loader
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index}>
        <Skeleton active avatar paragraph={{ rows: 3 }} />
      </Card>
    ))}
  </div>
);

// Table Skeleton Loader
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div style={{ padding: '24px' }}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} style={{ marginBottom: '12px' }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton.Input 
            key={colIndex} 
            style={{ width: '100%', marginRight: '12px' }} 
            active 
            size="small" 
          />
        ))}
      </div>
    ))}
  </div>
);

// List Skeleton Loader
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div style={{ padding: '24px' }}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} style={{ marginBottom: '16px' }}>
        <Skeleton avatar paragraph={{ rows: 2 }} active />
      </div>
    ))}
  </div>
);

// Chart Skeleton Loader
export const ChartSkeleton: React.FC = () => (
  <Card style={{ height: '400px' }}>
    <Skeleton.Input 
      style={{ width: '100%', height: '350px' }} 
      active 
    />
  </Card>
);

// Form Skeleton Loader
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 6 }) => (
  <div style={{ padding: '24px' }}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} style={{ marginBottom: '24px' }}>
        <Skeleton.Input 
          style={{ width: '120px', marginBottom: '8px' }} 
          active 
          size="small" 
        />
        <Skeleton.Input style={{ width: '100%' }} active />
      </div>
    ))}
    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
      <Skeleton.Input style={{ width: '100px', height: '32px' }} active />
      <Skeleton.Input style={{ width: '100px', height: '32px' }} active />
    </div>
  </div>
);

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ 
  size?: 'small' | 'default' | 'large'; 
  tip?: string;
  fullscreen?: boolean;
}> = ({ size = 'default', tip = 'Loading...', fullscreen = false }) => {
  const spinner = (
    <Spin 
      size={size} 
      indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 32 : size === 'small' ? 16 : 24 }} spin />}
      tip={tip}
    />
  );

  if (fullscreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px'
    }}>
      {spinner}
    </div>
  );
};

// Component-specific loading states
export const ExcelPageSkeleton: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <Skeleton.Input style={{ width: '200px', marginBottom: '16px' }} active />
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton.Input key={index} style={{ width: '80px', height: '32px' }} active />
      ))}
    </div>
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ background: '#fafafa', padding: '8px', borderBottom: '1px solid #d9d9d9' }}>
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton.Input 
            key={index} 
            style={{ width: '60px', marginRight: '8px' }} 
            active 
            size="small" 
          />
        ))}
      </div>
      {Array.from({ length: 10 }).map((_, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ width: '60px', padding: '8px', background: '#fafafa', borderRight: '1px solid #d9d9d9' }}>
            <Skeleton.Input style={{ width: '30px' }} active size="small" />
          </div>
          {Array.from({ length: 9 }).map((_, colIndex) => (
            <div key={colIndex} style={{ padding: '8px', flex: 1, borderRight: '1px solid #f0f0f0' }}>
              <Skeleton.Input style={{ width: '80%' }} active size="small" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const EditorSkeleton: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton.Input key={index} style={{ width: '60px', height: '32px' }} active />
      ))}
    </div>
    <div style={{ display: 'flex', gap: '16px' }}>
      <div style={{ flex: 1 }}>
        <Skeleton.Input style={{ width: '100%', height: '500px' }} active />
      </div>
      <div style={{ width: '200px' }}>
        <Skeleton.Input style={{ width: '100%', height: '500px' }} active />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div style={{ padding: '24px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <Skeleton active paragraph={{ rows: 2 }} />
        </Card>
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
      <Card>
        <ChartSkeleton />
      </Card>
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    </div>
  </div>
);

// Generic loading overlay for components
export const LoadingOverlay: React.FC<{ 
  loading: boolean; 
  children: React.ReactNode;
  tip?: string;
}> = ({ loading, children, tip = 'Loading...' }) => (
  <Spin spinning={loading} tip={tip} delay={200}>
    {children}
  </Spin>
);

// Progress loading indicator
export const ProgressLoader: React.FC<{ 
  percent: number; 
  status?: 'normal' | 'success' | 'exception';
  tip?: string;
}> = ({ percent, status = 'normal', tip }) => (
  <div style={{ padding: '24px', textAlign: 'center' }}>
    <Space direction="vertical" size="large">
      <Title level={4}>{tip || `Loading... ${percent}%`}</Title>
      <div style={{ width: '300px', margin: '0 auto' }}>
        <Skeleton.Input 
          style={{ width: '100%', height: '8px' }} 
          active={false}
        />
      </div>
    </Space>
  </div>
);

export default {
  PageSkeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  ChartSkeleton,
  FormSkeleton,
  LoadingSpinner,
  ExcelPageSkeleton,
  EditorSkeleton,
  DashboardSkeleton,
  LoadingOverlay,
  ProgressLoader
};
