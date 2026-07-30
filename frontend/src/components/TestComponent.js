import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Typography, Space, Tag, List, Divider, message } from 'antd';
import { 
  RocketOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ApiOutlined,
  CloudUploadOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const TestComponent = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    setLoading(prev => ({ ...prev, health: true }));
    try {
      const response = await axios.get('http://localhost:8001/');
      setBackendStatus('Connected');
      addResult('Backend Health Check', 'Passed', response.data);
    } catch (error) {
      setBackendStatus('Failed');
      addResult('Backend Health Check', 'Failed', error.message);
    } finally {
      setLoading(prev => ({ ...prev, health: false }));
    }
  };

  const addResult = (test, status, details) => {
    setTestResults(prev => [{
      test,
      status,
      details,
      time: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const testSessionsAPI = async () => {
    setLoading(prev => ({ ...prev, sessions: true }));
    try {
      const response = await axios.get('http://localhost:8001/api/v1/sessions');
      addResult('Sessions API', 'Passed', response.data);
      message.success('Sessions API test passed');
    } catch (error) {
      addResult('Sessions API', 'Failed', error.message);
      message.error('Sessions API test failed');
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }));
    }
  };

  const testUploadAPI = async () => {
    setLoading(prev => ({ ...prev, upload: true }));
    try {
      const testFile = new File(['This is a test file'], 'test.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', testFile);

      const response = await axios.post('http://localhost:8001/api/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addResult('Upload API', 'Passed', response.data);
      message.success('Upload API test passed');
    } catch (error) {
      addResult('Upload API', 'Failed', error.message);
      message.error('Upload API test failed');
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: '0 16px' }}>
      <Card 
        title={
          <Space>
            <RocketOutlined style={{ color: '#1890ff' }} />
            <span>NoteFusion AI Test Dashboard</span>
          </Space>
        }
        extra={
          <Tag color={backendStatus === 'Connected' ? 'success' : 'error'} icon={backendStatus === 'Connected' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
            Backend: {backendStatus}
          </Tag>
        }
      >
        <Paragraph>
          Use this dashboard to verify the connection between the frontend and the backend services.
        </Paragraph>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card size="small" title="Connection Tests">
            <Space wrap>
              <Button 
                type="primary" 
                icon={<ApiOutlined />} 
                onClick={testSessionsAPI}
                loading={loading.sessions}
              >
                Test Sessions API
              </Button>
              <Button 
                type="primary" 
                icon={<CloudUploadOutlined />} 
                onClick={testUploadAPI}
                loading={loading.upload}
              >
                Test Upload API
              </Button>
              <Button 
                icon={<PlayCircleOutlined />} 
                onClick={testBackendConnection}
                loading={loading.health}
              >
                Check Health
              </Button>
            </Space>
          </Card>

          <Divider orientation="horizontal">Test Results</Divider>

          <List
            dataSource={testResults}
            renderItem={item => (
              <List.Item>
                <Card 
                  style={{ width: '100%' }} 
                  size="small"
                  title={
                    <Space justify="space-between" style={{ width: '100%' }}>
                      <Text strong>{item.test}</Text>
                      <Tag color={item.status === 'Passed' ? 'success' : 'error'}>
                        {item.status}
                      </Tag>
                    </Space>
                  }
                  extra={<Text type="secondary" style={{ fontSize: '12px' }}>{item.time}</Text>}
                >
                  <pre style={{ 
                    maxHeight: '150px', 
                    overflow: 'auto', 
                    backgroundColor: '#f5f5f5', 
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    margin: 0
                  }}>
                    {JSON.stringify(item.details, null, 2)}
                  </pre>
                </Card>
              </List.Item>
            )}
            locale={{ emptyText: 'No tests run yet' }}
          />
        </Space>

        <Divider />

        <div style={{ backgroundColor: '#fffbe6', padding: '16px', borderRadius: '8px', border: '1px solid #ffe58f' }}>
          <Title level={5}>Quick Start Guide</Title>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li>Backend: <Text code>http://localhost:8001/api/v1</Text></li>
            <li>Frontend: <Text code>http://localhost:3000</Text></li>
            <li>Run Backend: <Text code>py -m uvicorn main:app --reload</Text></li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default TestComponent;