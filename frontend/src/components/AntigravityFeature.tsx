import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Tag, Alert, Spin, Row, Col } from 'antd';
import { RocketOutlined, InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

interface AntigravityStatus {
  enabled: boolean;
  available: boolean;
  import_error?: string;
  module_loaded: boolean;
}

interface TestResult {
  is_feature: boolean;
  status: AntigravityStatus;
  info: any;
  safe_execution: { success: boolean; message: string };
  documentation_available: boolean;
}

export const AntigravityFeature: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AntigravityStatus | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/antigravity/status');
      setStatus(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/antigravity/test');
      setTestResult(response.data.data.test_results);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to run tests');
    } finally {
      setLoading(false);
    }
  };

  const executeAntigravity = async (safeMode: boolean = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/v1/antigravity/execute', null, {
        params: { safe_mode: safeMode }
      });
      setExecutionResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to execute antigravity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <RocketOutlined /> Google Antigravity Feature
      </Title>
      
      <Paragraph>
        Google's antigravity is a real Python Easter egg that opens a web browser to XKCD comic #353.
        It's officially part of Python's standard library as a fun feature!
      </Paragraph>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title="Feature Status"
            extra={
              <Button onClick={fetchStatus} loading={loading}>
                Refresh
              </Button>
            }
          >
            {status ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Enabled: </Text>
                  <Tag color={status.enabled ? 'green' : 'red'}>
                    {status.enabled ? 'Yes' : 'No'}
                  </Tag>
                </div>
                <div>
                  <Text strong>Available: </Text>
                  <Tag color={status.available ? 'green' : 'red'}>
                    {status.available ? 'Yes' : 'No'}
                  </Tag>
                </div>
                <div>
                  <Text strong>Module Loaded: </Text>
                  <Tag color={status.module_loaded ? 'green' : 'red'}>
                    {status.module_loaded ? 'Yes' : 'No'}
                  </Tag>
                </div>
                {status.import_error && (
                  <div>
                    <Text strong>Import Error: </Text>
                    <Text type="danger">{status.import_error}</Text>
                  </div>
                )}
              </Space>
            ) : (
              <Spin />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Feature Information"
            extra={
              <Tag color="blue" icon={<InfoCircleOutlined />}>
                Easter Egg
              </Tag>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Type: </Text>
                <Text>Python Standard Library Feature</Text>
              </div>
              <div>
                <Text strong>Purpose: </Text>
                <Text>April Fool's joke / Easter egg</Text>
              </div>
              <div>
                <Text strong>What it does: </Text>
                <Text>Opens browser to XKCD comic #353</Text>
              </div>
              <div>
                <Text strong>URL: </Text>
                <a href="https://xkcd.com/353/" target="_blank" rel="noopener noreferrer">
                  https://xkcd.com/353/
                </a>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '1rem' }}>
        <Col xs={24} md={8}>
          <Card title="Run Tests">
            <Button 
              type="primary" 
              onClick={runTests} 
              loading={loading}
              block
              style={{ marginBottom: '1rem' }}
            >
              <CheckCircleOutlined /> Test Feature
            </Button>
            
            {testResult && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Is Feature: </Text>
                  <Tag color={testResult.is_feature ? 'green' : 'red'}>
                    {testResult.is_feature ? 'Yes' : 'No'}
                  </Tag>
                </div>
                <div>
                  <Text strong>Tests Passed: </Text>
                  <Text>
                    {testResult.summary?.passed || 0} / {testResult.summary?.total_tests || 0}
                  </Text>
                </div>
              </Space>
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Execute Antigravity">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="default" 
                onClick={() => executeAntigravity(true)}
                loading={loading}
                block
                style={{ marginBottom: '0.5rem' }}
              >
                <RocketOutlined /> Safe Mode
              </Button>
              
              <Button 
                type="primary" 
                danger
                onClick={() => executeAntigravity(false)}
                loading={loading}
                block
              >
                <RocketOutlined /> Execute (Opens Browser)
              </Button>
              
              {executionResult && (
                <Alert
                  message={executionResult.success ? 'Success' : 'Failed'}
                  description={executionResult.message}
                  type={executionResult.success ? 'success' : 'error'}
                  showIcon
                  style={{ marginTop: '0.5rem' }}
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Safety Notice">
            <Space direction="vertical">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                <Text>Safe mode prevents browser opening</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                <Text>Production systems should use safe mode</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                <Text>May not work in headless environments</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
