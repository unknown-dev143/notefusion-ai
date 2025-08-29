import React from 'react';
import { Modal, Typography, Button } from 'antd';
import styles from './TermsAndConditions.module.css';

const { Title, Paragraph } = Typography;

interface TermsAndConditionsProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ 
  visible, 
  onAccept, 
  onDecline 
}) => {
  return (
    <Modal
      title="Terms and Conditions"
      open={visible}
      onCancel={onDecline}
      footer={[
        <Button key="decline" onClick={onDecline}>
          Decline
        </Button>,
        <Button key="accept" type="primary" onClick={onAccept}>
          Accept
        </Button>,
      ]}
      width={800}
    >
      <div className={styles['termsContent']}>
        <Title level={4}>Last Updated: August 16, 2025</Title>
        
        <Title level={5}>1. Acceptance of Terms</Title>
        <Paragraph>
          By accessing or using NoteFusion AI, you agree to be bound by these Terms and Conditions. 
          If you do not agree with any part of these terms, you must not use our service.
        </Paragraph>

        <Title level={5}>2. User Responsibilities</Title>
        <Paragraph>
          - You are responsible for maintaining the confidentiality of your account information
          - You agree not to use the service for any illegal or unauthorized purpose
          - You must be at least 13 years old to use this service
        </Paragraph>

        <Title level={5}>3. Privacy Policy</Title>
        <Paragraph>
          Your use of NoteFusion AI is also governed by our Privacy Policy. Please review our 
          Privacy Policy, which explains how we collect, use, and share your information.
        </Paragraph>

        <Title level={5}>4. Intellectual Property</Title>
        <Paragraph>
          All content and materials available on NoteFusion AI, including but not limited to 
          text, graphics, logos, and software, are the property of NoteFusion AI and are 
          protected by applicable copyright and trademark law.
        </Paragraph>

        <Title level={5}>5. Limitation of Liability</Title>
        <Paragraph>
          NoteFusion AI shall not be liable for any indirect, incidental, special, 
          consequential, or punitive damages resulting from your access to or use of the service.
        </Paragraph>

        <Title level={5}>6. Changes to Terms</Title>
        <Paragraph>
          We reserve the right to modify these terms at any time. We will provide notice of 
          significant changes through our website or via email.
        </Paragraph>
      </div>
    </Modal>
  );
};

export default TermsAndConditions;
