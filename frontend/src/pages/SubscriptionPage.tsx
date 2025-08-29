<<<<<<< HEAD
import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Button, Row, Col, Space, Divider, Skeleton } from 'antd';
import { CheckCircleOutlined, RocketOutlined, CrownOutlined } from '@ant-design/icons';
import './SubscriptionPage.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

declare global {
  interface Window {
    Stripe: any;
  }
}
=======
import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Row, Col, Space, Divider, Alert, Skeleton } from 'antd';
import { CheckCircleOutlined, CrownOutlined, RocketOutlined } from '@ant-design/icons';
import { useAuth } from './features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { subscriptionApi } from './services/api';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

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
<<<<<<< HEAD
  const progressBarRef = useRef<HTMLDivElement>(null);
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
<<<<<<< HEAD
        // Fetch subscription data from the API
        const [subscriptionResponse, usageResponse] = await Promise.all([
          api.get('/subscription/current'),
          api.get('/subscription/usage')
        ]);
        
        setCurrentPlan(subscriptionResponse.data.planId || 'free');
        setUsage({
          used: usageResponse.data.used || 0,
          total: usageResponse.data.total || 120 // Default to 120 if not provided
        });
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        // Fallback to mock data in case of error
        setCurrentPlan('free');
        setUsage({ used: 45, total: 120 });
=======
        // Replace with actual API call
        // const subscription = await subscriptionApi.getCurrentSubscription();
        // setCurrentPlan(subscription.planId);
        // setUsage(subscription.usage);
        
        // Mock data for now
        setCurrentPlan('free');
        setUsage({ used: 45, total: 120 });
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
      <div className="subscription-page">
=======
      <div style={{ padding: '2rem' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Skeleton active />
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="subscription-page">
=======
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      <Title level={2}>Subscription Plans</Title>
      <Text type="secondary">
        Choose the plan that's right for you. Upgrade, downgrade, or cancel anytime.
      </Text>

      {currentPlan && usage && (
<<<<<<< HEAD
        <Card className="usage-card">
          <Title level={4}>Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</Title>
          <div className="usage-container">
=======
        <Card style={{ margin: '2rem 0' }}>
          <Title level={4}>Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</Title>
          <div style={{ margin: '1rem 0' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            <Text>Monthly Usage: </Text>
            <Text strong>
              {usage.used} / {usage.total} minutes
            </Text>
<<<<<<< HEAD
            <div className="usage-progress">
              <div className="usage-progress-bar" ref={progressBarRef} />
=======
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
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            </div>
          </div>
        </Card>
      )}

<<<<<<< HEAD
      <Row gutter={[24, 24]} className="plans-container">
=======
      <Row gutter={[24, 24]} style={{ marginTop: '2rem' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        {plans.map((plan) => (
          <Col xs={24} md={8} key={plan.id}>
            <Card
              hoverable
<<<<<<< HEAD
              className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
              bodyStyle={{ padding: '24px' }}
            >
              {plan.isPopular && (
                <div className="popular-badge">
                  <RocketOutlined className="feature-icon" />
                  Popular
                </div>
              )}
              <div className="plan-header">
                <Title level={3}>
                  {plan.name}
                </Title>
                <div className="plan-price-container">
                  <Text className="plan-price">
=======
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
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                    ${plan.price}
                  </Text>
                  <Text type="secondary">/{plan.interval}</Text>
                </div>
<<<<<<< HEAD
                {plan.price === 0 && (
                  <Text type="secondary">No credit card required</Text>
                )}
              </div>
              <Divider className="plan-divider" />
              <Space direction="vertical" size="middle" className="plan-features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <CheckCircleOutlined className="feature-icon" />
=======
                {plan.id === 'free' && (
                  <Text type="secondary">No credit card required</Text>
                )}
              </div>
              <Divider style={{ margin: '16px 0' }} />
              <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: '24px' }}>
                {plan.features.map((feature, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
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
<<<<<<< HEAD
      <div className="contact-support">
        <Text type="secondary">
          Need a custom plan for your team?{' '}
          <a href="mailto:support@notefusion.ai" rel="noopener noreferrer">Contact us</a>
=======
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Text type="secondary">
          Need a custom plan for your team?{' '}
          <a href="mailto:support@notefusion.ai">Contact us</a>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        </Text>
      </div>
    </div>
  );
};

export default SubscriptionPage;
