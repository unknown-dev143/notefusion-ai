import React from 'react';
import { Card, Typography } from 'antd';
import PomodoroTimer from '../components/PomodoroTimer';

const { Title } = Typography;

const StudyPage: React.FC = () => {
  return (
    <div className="study-page">
      <Title level={2} style={{ marginBottom: 24 }}>Study Tools</Title>
      <Card>
        <PomodoroTimer />
      </Card>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .study-page {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          @media (max-width: 768px) {
            .study-page {
              padding: 10px;
            }
          }
        `
      }} />
    </div>
  );
};

export default StudyPage;
