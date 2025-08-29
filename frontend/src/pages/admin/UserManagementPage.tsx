import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
<<<<<<< HEAD
=======
  Space, 
  Modal, 
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  Form, 
  Select, 
  Tag, 
  Typography, 
  Card, 
  Popconfirm, 
<<<<<<< HEAD
  message,
  Avatar,
  Tooltip,
  Switch,
  Space,
  Modal
} from 'antd';
import styles from './UserManagementPage.module.css';
=======
  message, 
  Badge,
  Avatar,
  Tooltip,
  Switch
} from 'antd';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
  id: string;
  key: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastActive: string;
  joinDate: string;
  avatar?: string;
}

type TableParams = {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue | null>;
};

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Mock data - replace with API calls in a real application
  const mockUsers: User[] = [
    {
      id: '1',
      key: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      lastActive: '2023-01-07T14:30:00Z',
      joinDate: '2022-01-01',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: '2',
      key: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      status: 'active',
      lastActive: '2023-01-07T12:15:00Z',
      joinDate: '2022-02-15',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      id: '3',
      key: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'user',
      status: 'inactive',
      lastActive: '2023-01-05T09:45:00Z',
      joinDate: '2022-03-10',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    {
      id: '4',
      key: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      role: 'moderator',
      status: 'active',
      lastActive: '2023-01-07T10:20:00Z',
      joinDate: '2022-04-22',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: '5',
      key: '5',
      name: 'Charlie Wilson',
      email: 'charlie@example.com',
      role: 'user',
      status: 'suspended',
      lastActive: '2023-01-02T16:30:00Z',
      joinDate: '2022-05-18',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    {
      id: '6',
      key: '6',
      name: 'Emma Davis',
      email: 'emma@example.com',
      role: 'user',
      status: 'pending',
      lastActive: '2023-01-06T11:10:00Z',
      joinDate: '2022-06-30',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, [tableParams.pagination?.current, tableParams.pagination?.pageSize]);

  const fetchUsers = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Apply search filter if searchText exists
      const filteredData = searchText
        ? mockUsers.filter(
            (user) =>
              user.name.toLowerCase().includes(searchText.toLowerCase()) ||
              user.email.toLowerCase().includes(searchText.toLowerCase())
          )
        : mockUsers;

      setUsers(filteredData);
      setLoading(false);
      
      // Update pagination
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: filteredData.length,
        },
      });
    }, 500);
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<User> | SorterResult<User>[],
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchUsers();
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = (userId: string) => {
    // Simulate delete API call
    setUsers(users.filter(user => user.id !== userId));
    message.success('User deleted successfully');
  };

  const handleStatusChange = (userId: string, status: User['status']) => {
    // Simulate status update API call
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
    message.success(`User status updated to ${status}`);
  };

  const handleModalSubmit = () => {
    form.validateFields().then(values => {
      if (editingUser) {
        // Update existing user
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...values } : user
        ));
        message.success('User updated successfully');
      } else {
        // Add new user
        const newUser: User = {
          ...values,
          id: Math.random().toString(36).substr(2, 9),
          key: Math.random().toString(36).substr(2, 9),
          status: 'active',
          joinDate: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString(),
        };
        setUsers([...users, newUser]);
        message.success('User added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div>{record.name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
        { text: 'Moderator', value: 'moderator' },
      ],
      onFilter: (value: any, record) => record.role === value,
      render: (role: string) => {
        const color = role === 'admin' ? 'gold' : role === 'moderator' ? 'blue' : 'default';
        return (
          <Tag color={color} key={role}>
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Suspended', value: 'suspended' },
        { text: 'Pending', value: 'pending' },
      ],
      onFilter: (value: any, record) => record.status === value,
      render: (status: string, record: User) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusChange(record.id, checked ? 'active' : 'inactive')}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          disabled={status === 'suspended' || status === 'pending'}
        />
      ),
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
      sorter: (a, b) => new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime(),
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      sorter: (a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          {record.role !== 'admin' && (
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
          {record.status === 'suspended' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleStatusChange(record.id, 'active')}
            >
              Unsuspend
            </Button>
          )}
          {record.status === 'pending' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => handleStatusChange(record.id, 'active')}
            >
              Approve
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
<<<<<<< HEAD
    <div className={styles['pageContainer']}>
      <div className={styles['header']}>
=======
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <Title level={3}>User Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </div>

      <Card>
<<<<<<< HEAD
        <div className={styles['toolbar']}>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            className={styles['searchInput']}
=======
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={(e: any) => handleSearch(e.target.value)}
            allowClear
          />
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              Refresh
            </Button>
            <Button icon={<FilterOutlined />}>
              Filters
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{
            ...tableParams.pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
          onChange={handleTableChange}
          rowKey="id"
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingUser ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            role: 'user',
            status: 'active',
          }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the user name!' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter email" disabled={!!editingUser} />
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input the password!' },
                { min: 8, message: 'Password must be at least 8 characters long' },
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select a role">
              <Option value="admin">Admin</Option>
              <Option value="moderator">Moderator</Option>
              <Option value="user">User</Option>
            </Select>
          </Form.Item>
          
          {editingUser && (
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select a status!' }]}
            >
              <Select placeholder="Select status">
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="suspended">Suspended</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
