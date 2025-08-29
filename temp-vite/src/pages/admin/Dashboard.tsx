import React from 'react';
import { Card, Typography, Table, Space, Button, Statistic, Row, Col } from 'antd';
import { UserOutlined, FileTextOutlined, StarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
  // Mock data - replace with actual API calls
  const stats = [
    { title: 'Total Users', value: 1245, icon: <UserOutlined /> },
    { title: 'Total Notes', value: 5678, icon: <FileTextOutlined /> },
    { title: 'Pro Users', value: 342, icon: <StarOutlined /> },
  ];

  const recentUsers = [
    { id: 1, email: 'user1@example.com', joined: '2023-04-15', status: 'active' },
    { id: 2, email: 'user2@example.com', joined: '2023-04-14', status: 'active' },
    { id: 3, email: 'user3@example.com', joined: '2023-04-13', status: 'inactive' },
  ];

  const userColumns = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Joined', dataIndex: 'joined', key: 'joined' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'active' ? '#52c41a' : '#ff4d4f' }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Admin Dashboard</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Recent Users" style={{ marginBottom: '24px' }}>
        <Table 
          dataSource={recentUsers} 
          columns={userColumns} 
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card title="Quick Actions">
        <Space size="middle">
          <Button type="primary">Manage Users</Button>
          <Button>View Analytics</Button>
          <Button>System Settings</Button>
        </Space>
      </Card>
    </div>
  );
};

export default AdminDashboard;
