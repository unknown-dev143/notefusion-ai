import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Button, Row, Col, Space, Divider, Skeleton } from 'antd';
import { CheckCircleOutlined, RocketOutlined, CrownOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import './SubscriptionPage.css';

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
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const [subscriptionResponse, usageResponse] = await Promise.all([
          api.get('/subscription/current'),
          api.get('/subscription/usage')
        ]);
        
        setCurrentPlan(subscriptionResponse.data.planId || 'free');
        setUsage({
          used: usageResponse.data.used || 0,
          total: usageResponse.data.total || 120
        });
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        setCurrentPlan('free');
        setUsage({ used: 45, total: 120 });
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
      setLoading(true);
      if (planId === 'free') {
        await api.post('/subscription/downgrade');
        setCurrentPlan('free');
        return;
      }

      const response = await api.post('/subscription/checkout', { planId });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error processing subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <Skeleton active />
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <Title level={2}>Subscription Plans</Title>
      <Text type="secondary">
        Choose the plan that's right for you. Upgrade, downgrade, or cancel anytime.
      </Text>

      {currentPlan && usage && (
        <Card className="usage-card">
          <Title level={4}>Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</Title>
          <div className="usage-container">
            <Text>Monthly Usage: </Text>
            <Text strong>
              {usage.used} / {usage.total} minutes
            </Text>
            <div className="usage-progress">
              <div 
                className="usage-progress-bar" 
                ref={progressBarRef}
                style={{ width: `${Math.min((usage.used / usage.total) * 100, 100)}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      <Row gutter={[24, 24]} className="plans-container">
        {plans.map((plan) => (
          <Col xs={24} md={8} key={plan.id}>
            <Card
              hoverable
              className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
              bodyStyle={{ padding: '24px', position: 'relative' }}
            >
              {plan.isPopular && (
                <div className="popular-badge">
                  <RocketOutlined className="feature-icon" />
                  Popular
                </div>
              )}
              <div className="plan-header">
                <Title level={3}>{plan.name}</Title>
                <div className="plan-price-container">
                  <Text className="plan-price">
                    ${plan.price}
                  </Text>
                  <Text type="secondary">/{plan.interval}</Text>
                </div>
                {plan.price === 0 && (
                  <Text type="secondary">No credit card required</Text>
                )}
              </div>
              <Divider className="plan-divider" />
              <Space direction="vertical" size="middle" className="plan-features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <CheckCircleOutlined className="feature-icon" />
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
                loading={loading && plan.id !== currentPlan}
              >
                {plan.id === currentPlan ? 'Current Plan' : plan.id === 'free' ? 'Get Started' : 'Upgrade'}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="contact-support">
        <Text type="secondary">
          Need a custom plan for your team?{' '}
          <a href="mailto:support@notefusion.ai" rel="noopener noreferrer">
            Contact us
          </a>
        </Text>
      </div>
    </div>
  );
};

export default SubscriptionPage;
