import React from 'react';
import { Button, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  return (
    <div className="home-page" style={{ textAlign: 'center', padding: '2rem' }}>
      <Title level={1}>Welcome to NoteFusion AI</Title>
      <Paragraph type="secondary" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
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
