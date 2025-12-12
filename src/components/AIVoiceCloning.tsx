import React, { useState } from 'react';
import { Card, Typography, Button, Space, Input, Select, Tabs, Upload, Slider, Progress, message, Row, Col, Tag, List } from 'antd';
import { 
  RobotOutlined,
  SoundOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  ThunderboltOutlined,
  PhoneOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface VoiceProfile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'adult' | 'senior';
  accent: string;
  pitch: number;
  speed: number;
  emotion: string;
  samples: number;
  created: string;
}

interface GeneratedVoice {
  id: string;
  text: string;
  voiceProfile: string;
  duration: number;
  url: string;
  timestamp: string;
}

const AIVoiceCloning: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profiles');
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([
    {
      id: '1',
      name: 'Professional Voice',
      gender: 'neutral',
      age: 'adult',
      accent: 'American',
      pitch: 0.5,
      speed: 0.5,
      emotion: 'neutral',
      samples: 50,
      created: new Date().toISOString()
    }
  ]);
  const [generatedVoices, setGeneratedVoices] = useState<GeneratedVoice[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedSamples, setUploadedSamples] = useState<any[]>([]);
  const [newProfile, setNewProfile] = useState<Partial<VoiceProfile>>({
    name: '',
    gender: 'neutral',
    age: 'adult',
    accent: 'American',
    pitch: 0.5,
    speed: 0.5,
    emotion: 'neutral'
  });

  const accents = ['American', 'British', 'Australian', 'Indian', 'French', 'German', 'Spanish', 'Italian'];
  const emotions = ['neutral', 'happy', 'sad', 'angry', 'excited', 'calm', 'professional', 'friendly'];

  const createVoiceProfile = () => {
    if (newProfile.name && uploadedSamples.length >= 3) {
      const profile: VoiceProfile = {
        id: Date.now().toString(),
        name: newProfile.name,
        gender: newProfile.gender || 'neutral',
        age: newProfile.age || 'adult',
        accent: newProfile.accent || 'American',
        pitch: newProfile.pitch || 0.5,
        speed: newProfile.speed || 0.5,
        emotion: newProfile.emotion || 'neutral',
        samples: uploadedSamples.length,
        created: new Date().toISOString()
      };
      setVoiceProfiles([profile, ...voiceProfiles]);
      setNewProfile({});
      setUploadedSamples([]);
      message.success('Voice profile created successfully!');
    }
  };

  const generateVoice = () => {
    if (!selectedProfile || !textToSpeak) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      const generated: GeneratedVoice = {
        id: Date.now().toString(),
        text: textToSpeak,
        voiceProfile: selectedProfile,
        duration: Math.round(textToSpeak.length * 0.1),
        url: 'generated-audio.mp3',
        timestamp: new Date().toISOString()
      };
      setGeneratedVoices([generated, ...generatedVoices]);
      setIsGenerating(false);
      message.success('Voice generated successfully!');
    }, 3000);
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      message.success('Voice sample recorded!');
    }, 5000);
  };

  const handleSampleUpload = (file: any) => {
    if (file.type.startsWith('audio/')) {
      setUploadedSamples([...uploadedSamples, file]);
      message.success(`${file.name} uploaded successfully`);
    }
    return false;
  };

  const playVoice = (voice: GeneratedVoice) => {
    message.info(`Playing: ${voice.text}`);
  };

  const downloadVoice = (voice: GeneratedVoice) => {
    message.success(`Downloading: ${voice.text}`);
  };

  const deleteProfile = (profileId: string) => {
    setVoiceProfiles(voiceProfiles.filter(p => p.id !== profileId));
    message.success('Voice profile deleted');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <Space>
          <RobotOutlined />
          AI Voice Cloning
        </Space>
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Voice Profiles" key="profiles">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Create New Profile" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Profile Name:</Text>
                    <Input
                      placeholder="Enter profile name"
                      value={newProfile.name}
                      onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                    />
                  </div>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong>Gender:</Text>
                        <Select
                          value={newProfile.gender}
                          onChange={(gender) => setNewProfile({ ...newProfile, gender })}
                          style={{ width: '100%', marginTop: '8px' }}
                        >
                          <Option value="male">Male</Option>
                          <Option value="female">Female</Option>
                          <Option value="neutral">Neutral</Option>
                        </Select>
                      </div>
                    </Col>

                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong>Age:</Text>
                        <Select
                          value={newProfile.age}
                          onChange={(age) => setNewProfile({ ...newProfile, age })}
                          style={{ width: '100%', marginTop: '8px' }}
                        >
                          <Option value="young">Young</Option>
                          <Option value="adult">Adult</Option>
                          <Option value="senior">Senior</Option>
                        </Select>
                      </div>
                    </Col>
                  </Row>

                  <div>
                    <Text strong>Accent:</Text>
                    <Select
                      value={newProfile.accent}
                      onChange={(accent) => setNewProfile({ ...newProfile, accent })}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      {accents.map(accent => (
                        <Option key={accent} value={accent}>
                          {accent}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Text strong>Pitch:</Text>
                    <Slider
                      value={newProfile.pitch}
                      onChange={(pitch) => setNewProfile({ ...newProfile, pitch })}
                      min={0}
                      max={1}
                      step={0.1}
                      marks={{ 0: 'Low', 1: 'High' }}
                    />
                  </div>

                  <div>
                    <Text strong>Speed:</Text>
                    <Slider
                      value={newProfile.speed}
                      onChange={(speed) => setNewProfile({ ...newProfile, speed })}
                      min={0}
                      max={1}
                      step={0.1}
                      marks={{ 0: 'Slow', 1: 'Fast' }}
                    />
                  </div>

                  <div>
                    <Text strong>Emotion:</Text>
                    <Select
                      value={newProfile.emotion}
                      onChange={(emotion) => setNewProfile({ ...newProfile, emotion })}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      {emotions.map(emotion => (
                        <Option key={emotion} value={emotion}>
                          {emotion}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={createVoiceProfile}
                    disabled={!newProfile.name || uploadedSamples.length < 3}
                    block
                  >
                    Create Profile
                  </Button>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Voice Samples" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Upload voice samples (minimum 3 required):</Text>
                    <Upload
                      accept="audio/*"
                      beforeUpload={handleSampleUpload}
                      showUploadList={false}
                      style={{ marginTop: '8px' }}
                    >
                      <Button icon={<UploadOutlined />} block>
                        Upload Audio Sample
                      </Button>
                    </Upload>
                  </div>

                  <Button
                    type="primary"
                    icon={<PhoneOutlined />}
                    onClick={startRecording}
                    loading={isRecording}
                    block
                  >
                    {isRecording ? 'Recording...' : 'Record Sample'}
                  </Button>

                  {uploadedSamples.length > 0 && (
                    <div>
                      <Text strong>Uploaded Samples ({uploadedSamples.length}/3):</Text>
                      {uploadedSamples.map((sample, index) => (
                        <div key={index} style={{ marginTop: '4px' }}>
                          <SoundOutlined style={{ marginRight: '8px' }} />
                          <Text>{sample.name}</Text>
                        </div>
                      ))}
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>

          <Card title="Existing Profiles" style={{ marginTop: '16px' }}>
            <Row gutter={[16, 16]}>
              {voiceProfiles.map((profile) => (
                <Col xs={24} sm={12} md={8} key={profile.id}>
                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>{profile.name}</Text>
                        <Tag color="blue" style={{ marginLeft: '8px' }}>
                          {profile.gender}
                        </Tag>
                      </div>
                      
                      <div>
                        <Text type="secondary">
                          {profile.age} • {profile.accent} • {profile.samples} samples
                        </Text>
                      </div>

                      <Space>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => setSelectedProfile(profile.id)}
                        >
                          Select
                        </Button>
                        <Button
                          size="small"
                          danger
                          onClick={() => deleteProfile(profile.id)}
                        >
                          Delete
                        </Button>
                      </Space>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Voice Generator" key="generator">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Select Voice Profile:</Text>
                <Select
                  value={selectedProfile}
                  onChange={setSelectedProfile}
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Choose a voice profile"
                >
                  {voiceProfiles.map((profile) => (
                    <Option key={profile.id} value={profile.id}>
                      {profile.name}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>Text to Speak:</Text>
                <TextArea
                  placeholder="Enter text to convert to speech..."
                  value={textToSpeak}
                  onChange={(e) => setTextToSpeak(e.target.value)}
                  rows={4}
                  style={{ marginTop: '8px' }}
                />
              </div>

              <div style={{ marginTop: '8px' }}>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={generateVoice}
                  loading={isGenerating}
                  disabled={!selectedProfile || !textToSpeak}
                  block
                >
                  Generate Voice
                </Button>
              </div>

              {isGenerating && (
                <div>
                  <Text strong>Generating voice...</Text>
                  <Progress percent={66} status="active" />
                </div>
              )}
            </Space>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Generated Voices" key="history">
          <Card>
            <List
              dataSource={generatedVoices}
              renderItem={(voice) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>{voice.text}</Text>
                        <Tag color="green" style={{ marginLeft: '8px' }}>
                          {voice.duration}s
                        </Tag>
                      </div>
                      
                      <Text type="secondary">
                        Profile: {voiceProfiles.find(p => p.id === voice.voiceProfile)?.name}
                      </Text>

                      <Space>
                        <Button size="small" icon={<PlayCircleOutlined />} onClick={() => playVoice(voice)}>
                          Play
                        </Button>
                        <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadVoice(voice)}>
                          Download
                        </Button>
                      </Space>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AIVoiceCloning;
