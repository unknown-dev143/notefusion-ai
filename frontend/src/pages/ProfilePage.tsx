import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { useAuth } from '@/features/auth/context/AuthContext';
import { UserProfile } from '@/features/user/components/UserProfile';
import styles from './ProfilePage.module.css';

// Type definition for CSS modules with exact properties
type ProfilePageStyles = {
  readonly [key: string]: string;
  readonly container: string;
  readonly card: string;
  readonly title: string;
};

const typedStyles = styles as unknown as ProfilePageStyles;

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className={typedStyles.container}>
      <Card className={typedStyles.card}>
        <Typography.Title level={2} className={typedStyles.title}>
          User Profile
        </Typography.Title>
        <UserProfile />
      </Card>
    </div>
  );
};

export default ProfilePage;
