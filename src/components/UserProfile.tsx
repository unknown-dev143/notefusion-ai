import React, { useState } from 'react';
import { Card, Avatar, Typography, Button, Upload, Input, message, Space, Divider, Row, Col, Tag, Progress } from 'antd';
import { UserOutlined, CameraOutlined, EditOutlined, SaveOutlined, TrophyOutlined, BookOutlined, StarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface UserProfileData {
  name: string;
  email: string;
  bio: string;
  avatar: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    bio: 'Passionate learner and tech enthusiast. Love exploring new technologies and sharing knowledge.',
    avatar: user?.avatar || ''
  });

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
        message.success('Profile picture updated successfully!');
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const handleSave = () => {
    // Here you would typically save to backend
    message.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const uploadProps = {
    name: 'avatar',
    showUploadList: false,
    beforeUpload: (file: File) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG files!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return false;
      }
      return true;
    },
    onChange: handleAvatarChange
  };

  return (
    <Card title="User Profile" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Avatar Section */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              size={120}
              src={profileData.avatar}
              icon={<UserOutlined />}
              style={{ border: '3px solid #1890ff' }}
            />
            {isEditing && (
              <Upload {...uploadProps}>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    border: '2px solid white'
                  }}
                />
              </Upload>
            )}
          </div>
          <div style={{ marginTop: 16 }}>
            <Title level={4}>{profileData.name}</Title>
            <Text type="secondary">{profileData.email}</Text>
          </div>
        </div>

        <Divider />

        {/* Profile Information */}
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Full Name</Text>
            {isEditing ? (
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                style={{ marginTop: 8 }}
              />
            ) : (
              <div style={{ marginTop: 8 }}>
                <Text>{profileData.name}</Text>
              </div>
            )}
          </div>

          <div>
            <Text strong>Email</Text>
            {isEditing ? (
              <Input
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                style={{ marginTop: 8 }}
              />
            ) : (
              <div style={{ marginTop: 8 }}>
                <Text>{profileData.email}</Text>
              </div>
            )}
          </div>

          <div>
            <Text strong>Bio</Text>
            {isEditing ? (
              <TextArea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                style={{ marginTop: 8 }}
              />
            ) : (
              <div style={{ marginTop: 8 }}>
                <Text>{profileData.bio}</Text>
              </div>
            )}
          </div>
        </Space>

        <Divider />

        {/* Features & Achievements Section */}
        <div>
          <Title level={4}>Features & Achievements</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card size="small" title="Learning Stats">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Study Streak</Text>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                      <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
                      <Text>15 days</Text>
                    </div>
                  </div>
                  <div>
                    <Text strong>Notes Created</Text>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                      <BookOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                      <Text>234 notes</Text>
                    </div>
                  </div>
                  <div>
                    <Text strong>Total Study Time</Text>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                      <ClockCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      <Text>48 hours</Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" title="Achievements">
                <Space wrap>
                  <Tag color="gold" icon={<TrophyOutlined />}>Top Learner</Tag>
                  <Tag color="blue" icon={<StarOutlined />}>AI Expert</Tag>
                  <Tag color="green" icon={<BookOutlined />}>Note Master</Tag>
                  <Tag color="purple" icon={<TrophyOutlined />}>30 Day Streak</Tag>
                  <Tag color="orange" icon={<StarOutlined />}>Early Adopter</Tag>
                </Space>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card size="small" title="Feature Usage">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circle" percent={85} size={80} />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>AI Assistant</Text>
                        <br />
                        <Text type="secondary">Frequently Used</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circle" percent={70} size={80} />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Flashcards</Text>
                        <br />
                        <Text type="secondary">Regular Use</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circle" percent={60} size={80} />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Voice Notes</Text>
                        <br />
                        <Text type="secondary">Moderate Use</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress type="circle" percent={45} size={80} />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Study Groups</Text>
                        <br />
                        <Text type="secondary">Occasional</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center' }}>
          {isEditing ? (
            <Space>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Space>
          ) : (
            <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default UserProfile;
