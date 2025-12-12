import React, { useState, useMemo } from 'react';
import { Tabs, Card, Typography } from 'antd';
import { AudioOutlined, SoundOutlined, FileTextOutlined, FileAddOutlined } from '@ant-design/icons';
import { TextToSpeech } from '../components/TextToSpeech';
import { SpeechToText } from '../components/SpeechToText';
import { AudioTranscriber } from '../components/AudioTranscriber';
import { AudioNoteTaker } from '../components/AudioNoteTaker';

const { Title } = Typography;

type TabItem = {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
};

export const AudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tts');

  const items: TabItem[] = useMemo(() => [
    {
      key: 'tts',
      label: (
        <span>
          <SoundOutlined /> Text to Speech
        </span>
      ),
      children: <TextToSpeech />,
    },
    {
      key: 'stt',
      label: (
        <span>
          <AudioOutlined /> Speech to Text
        </span>
      ),
      children: <SpeechToText />,
    },
    {
      key: 'transcriber',
      label: (
        <span>
          <FileTextOutlined /> Audio Transcriber
        </span>
      ),
      children: <AudioTranscriber />,
    },
    {
      key: 'notes',
      label: (
        <span>
          <FileAddOutlined /> Audio Notes
        </span>
      ),
      children: <AudioNoteTaker />,
    },
  ], []);

  return (
    <div className="audio-page">
      <Title level={2} className="page-title">
        <AudioOutlined /> Audio Tools
      </Title>
      
      <Card>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          animated
        />
      </Card>
    </div>
  );
};
