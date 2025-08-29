import React from 'react';
import { Button, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  return (
    <div className={styles.homePage}>
      <Title level={1}>Welcome to NoteFusion AI</Title>
      <Paragraph type="secondary" className={styles.subtitle}>
        Your intelligent note-taking companion with AI-powered features
      </Paragraph>
      <Space size="middle">
        <Button type="primary" size="large">
          <Link to="/signup">Get Started</Link>
        </Button>
        <Button size="large">
          <Link to="/login">Login</Link>
        </Button>
      </Space>
    </div>
  );
};

export default Home;
