import React from 'react';
import { Card, Button, Typography, Space, Divider } from 'antd';
import { CheckCircleOutlined, CrownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SubscriptionPage: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '120 minutes of transcription/month',
        'Basic AI summaries',
        'Single user',
        'Basic integrations'
      ],
      buttonText: 'Current Plan',
      buttonType: 'default' as const,
      isCurrent: true
    },
    {
      name: 'Pro',
      price: '$10',
      period: 'per month',
      features: [
        '1,800 minutes of transcription/month',
        '100+ AI summaries/month',
        'Export options',
        'Speaker identification',
        'File recordings',
        'Extended integrations'
      ],
      buttonText: 'Upgrade to Pro',
      buttonType: 'primary' as const,
      isPopular: true
    },
    {
      name: 'Business',
      price: '$20',
      period: 'per user/month',
      features: [
        'Unlimited transcription',
        'Unlimited AI summaries',
        'Admin dashboard',
        'Multi-user control',
        'Usage analytics',
        'Priority support',
        'SSO/SAML',
        'Custom integrations'
      ],
      buttonText: 'Contact Sales',
      buttonType: 'default' as const
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Title level={2}>Choose Your Plan</Title>
        <Text type="secondary">Select the plan that fits your needs</Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.isPopular ? 'border-2 border-blue-500' : ''}`}
            hoverable
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              </div>
            )}
            
            <div className="text-center">
              <Title level={4} className="mb-0">{plan.name}</Title>
              <div className="my-4">
                <Text className="text-4xl font-bold">{plan.price}</Text>
                <Text type="secondary"> {plan.period}</Text>
              </div>
              
              <Button 
                type={plan.buttonType}
                icon={plan.isPopular ? <CrownOutlined /> : null}
                block
                className="mb-6"
              >
                {plan.buttonText}
              </Button>
              
              <Divider>Features</Divider>
              
              <Space direction="vertical" className="w-full text-left">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 mr-2" />
                    <Text>{feature}</Text>
                  </div>
                ))}
              </Space>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center text-gray-500">
        <Text>Need help choosing? <a href="#contact">Contact our sales team</a></Text>
      </div>
    </div>
  );
};

export default SubscriptionPage;
