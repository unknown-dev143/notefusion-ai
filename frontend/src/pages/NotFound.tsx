import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import styles from './NotFound.module.css';
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
<<<<<<< HEAD
    <div className={styles['container']}>
=======
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Back Home
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
