import React, { useState } from 'react';
import { Card, Avatar, Button, Typography, Divider, Row, Col, Tag, Space, Modal, Form, Input, Upload } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, CalendarOutlined, BookOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
    form.setFieldsValue({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  const handleSaveProfile = (values: any) => {
    // Update user in localStorage and context
    if (user) {
      const updatedUser = { ...user, ...values };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // You might need to add an update function in AuthContext
      window.location.reload(); // Temporary solution to refresh the user data
    }
    setIsEditModalVisible(false);
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
  };

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={3}>User Profile</Title>
        <Text>Please log in to view your profile.</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                src={user.avatar}
                icon={!user.avatar ? <UserOutlined /> : undefined}
                style={{ marginBottom: 16 }}
              />
              <Title level={3}>{user.name || 'User'}</Title>
              <Text type="secondary">{user.email}</Text>
              <div style={{ marginTop: 16 }}>
                <Button type="primary" icon={<EditOutlined />} onClick={handleEditProfile}>
                  Edit Profile
                </Button>
              </div>
            </div>
          </Col>
          
          <Col xs={24} md={16}>
            <Title level={4}>Profile Information</Title>
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong>
                  <MailOutlined style={{ marginRight: 8 }} />
                  Email Address
                </Text>
                <br />
                <Text>{user.email}</Text>
              </div>
              
              <div>
                <Text strong>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Member Since
                </Text>
                <br />
                <Text>{new Date().toLocaleDateString()}</Text>
              </div>
              
              <div>
                <Text strong>
                  <BookOutlined style={{ marginRight: 8 }} />
                  Account Type
                </Text>
                <br />
                <Tag color="blue">Premium Member</Tag>
              </div>
            </Space>
            
            <Divider />
            
            <Title level={4}>Statistics</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <Title level={2}>42</Title>
                    <Text type="secondary">Notes Created</Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <Title level={2}>15</Title>
                    <Text type="secondary">Study Sessions</Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <Title level={2}>7</Title>
                    <Text type="secondary">Day Streak</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Edit Profile"
        visible={isEditModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Profile Picture"
            name="avatar"
          >
            <Upload
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={() => false} // Prevent automatic upload
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
