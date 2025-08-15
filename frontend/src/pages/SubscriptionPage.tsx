import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, Space, Divider, Alert, Skeleton } from 'antd';
import { CheckCircleOutlined, CrownOutlined, RocketOutlined } from '@ant-design/icons';
import { useAuth } from './features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { subscriptionApi } from './services/api';

const { Title, Text } = Typography;

type Plan = {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
};

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '120 minutes of transcription/month',
      'Basic AI summaries',
      'Single user',
      'Basic integrations'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 14.99,
    interval: 'month',
    isPopular: true,
    features: [
      '1,800 minutes of transcription/month',
      '100+ AI summaries/month',
      'Export options',
      'Speaker identification',
      'File recordings',
      'Extended integrations'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 29.99,
    interval: 'month',
    features: [
      'Unlimited transcription',
      'Unlimited AI summaries',
      'Advanced file handling',
      'Admin dashboard',
      'Multi-user control',
      'Priority support'
    ]
  }
];

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // Replace with actual API call
        // const subscription = await subscriptionApi.getCurrentSubscription();
        // setCurrentPlan(subscription.planId);
        // setUsage(subscription.usage);
        
        // Mock data for now
        setCurrentPlan('free');
        setUsage({ used: 45, total: 120 });
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubscription();
    } else {
      navigate('/login', { state: { from: '/subscription' } });
    }
  }, [user, navigate]);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }

    try {
      // Replace with actual subscription logic
      // const { url } = await subscriptionApi.createCheckoutSession(planId);
      // window.location.href = url;
      
      // For demo purposes
      if (planId === 'free') {
        setCurrentPlan('free');
      } else {
        window.alert('Redirecting to checkout...');
      }
    } catch (error) {
      console.error('Failed to initiate subscription:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <Skeleton active />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Subscription Plans</Title>
      <Text type="secondary">
        Choose the plan that's right for you. Upgrade, downgrade, or cancel anytime.
      </Text>

      {currentPlan && usage && (
        <Card style={{ margin: '2rem 0' }}>
          <Title level={4}>Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</Title>
          <div style={{ margin: '1rem 0' }}>
            <Text>Monthly Usage: </Text>
            <Text strong>
              {usage.used} / {usage.total} minutes
            </Text>
            <div
              style={{
                width: '100%',
                height: '10px',
                backgroundColor: '#f0f0f0',
                borderRadius: '5px',
                marginTop: '0.5rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min((usage.used / usage.total) * 100, 100)}%`,
                  height: '100%',
                  backgroundColor: '#1890ff',
                  borderRadius: '5px',
                }}
              />
            </div>
          </div>
        </Card>
      )}

      <Row gutter={[24, 24]} style={{ marginTop: '2rem' }}>
        {plans.map((plan) => (
          <Col xs={24} md={8} key={plan.id}>
            <Card
              hoverable
              style={{
                height: '100%',
                border: plan.isPopular ? '2px solid #1890ff' : '1px solid #f0f0f0',
                position: 'relative',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              {plan.isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '20px',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    padding: '2px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <RocketOutlined style={{ marginRight: '4px' }} />
                  Popular
                </div>
              )}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={3} style={{ marginBottom: '8px' }}>
                  {plan.name}
                </Title>
                <div style={{ marginBottom: '8px' }}>
                  <Text style={{ fontSize: '32px', fontWeight: 'bold' }}>
                    ${plan.price}
                  </Text>
                  <Text type="secondary">/{plan.interval}</Text>
                </div>
                {plan.id === 'free' && (
                  <Text type="secondary">No credit card required</Text>
                )}
              </div>
              <Divider style={{ margin: '16px 0' }} />
              <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: '24px' }}>
                {plan.features.map((feature, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <Text>{feature}</Text>
                  </div>
                ))}
              </Space>
              <Button
                type={plan.id === currentPlan ? 'default' : plan.isPopular ? 'primary' : 'default'}
                block
                size="large"
                icon={plan.id === 'business' ? <CrownOutlined /> : undefined}
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.id === currentPlan}
              >
                {plan.id === currentPlan ? 'Current Plan' : plan.id === 'free' ? 'Get Started' : 'Upgrade'}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Text type="secondary">
          Need a custom plan for your team?{' '}
          <a href="mailto:support@notefusion.ai">Contact us</a>
        </Text>
      </div>
    </div>
  );
};

export default SubscriptionPage;
