import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  InputNumber, 
  Space, 
  Typography, 
  Card, 
  Form, 
  Input, 
  Switch, 
  Select, 
  message, 
  Popconfirm, 
  Tag 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SaveOutlined, 
  CloseOutlined 
} from '@ant-design/icons';
import { 
  getPricingTiers, 
  updatePricingTier, 
  createPricingTier, 
  deletePricingTier,
  PricingTier 
} from '../../services/api/pricing';

const { Title } = Typography;
const { Option } = Select;

const PricingManagement: React.FC = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPricingTiers();
  }, []);

  const fetchPricingTiers = async () => {
    try {
      setLoading(true);
      const data = await getPricingTiers();
      setTiers(data);
    } catch (error) {
      message.error('Failed to fetch pricing tiers');
      console.error('Error fetching pricing tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = (record: PricingTier) => record.id === editingKey;

  const edit = (record: PricingTier) => {
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      price: record.price,
      currency: record.currency,
      features: record.features.join('\n'),
      isActive: record.isActive,
      billingCycle: record.billingCycle,
    });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (id: string) => {
    try {
      const row = await form.validateFields();
      const updatedTier = {
        ...row,
        features: row.features.split('\n').filter((f: string) => f.trim() !== ''),
      };
      
      await updatePricingTier(id, updatedTier);
      message.success('Pricing tier updated successfully');
      setEditingKey('');
      fetchPricingTiers();
    } catch (errInfo) {
      console.error('Save failed:', errInfo);
    }
  };

  const handleAddNew = async () => {
    try {
      const values = await form.validateFields();
      const newTier = {
        ...values,
        features: values.features.split('\n').filter((f: string) => f.trim() !== ''),
      };
      
      await createPricingTier(newTier);
      message.success('New pricing tier created');
      form.resetFields();
      fetchPricingTiers();
    } catch (error) {
      console.error('Failed to add new tier:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePricingTier(id);
      message.success('Pricing tier deleted');
      fetchPricingTiers();
    } catch (error) {
      message.error('Failed to delete pricing tier');
      console.error('Error deleting tier:', error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      render: (_: any, record: PricingTier) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="name"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input />
          </Form.Item>
        ) : (
          <strong>{record.name}</strong>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      editable: true,
      render: (_: any, record: PricingTier) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="description"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Description is required' }]}
          >
            <Input.TextArea autoSize />
          </Form.Item>
        ) : (
          record.description
        );
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      editable: true,
      render: (_: any, record: PricingTier) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="price"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Price is required' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        ) : (
          `${record.currency} ${record.price.toFixed(2)}`
        );
      },
    },
    {
      title: 'Billing Cycle',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      editable: true,
      render: (_: any, record: PricingTier) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="billingCycle"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Billing cycle is required' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="monthly">Monthly</Option>
              <Option value="yearly">Yearly</Option>
            </Select>
          </Form.Item>
        ) : (
          <Tag color={record.billingCycle === 'monthly' ? 'blue' : 'green'}>
            {record.billingCycle.charAt(0).toUpperCase() + record.billingCycle.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (_: any, record: PricingTier) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="isActive"
            style={{ margin: 0 }}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        ) : (
          <Tag color={record.isActive ? 'success' : 'error'}>
            {record.isActive ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PricingTier) => {
        const editable = isEditing(record);
        return editable ? (
          <Space size="middle">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => save(record.id)}
              size="small"
            >
              Save
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={cancel}
              size="small"
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Space size="middle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => edit(record)}
              disabled={editingKey !== ''}
            />
            <Popconfirm
              title="Are you sure you want to delete this pricing tier?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              disabled={editingKey !== ''}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                disabled={editingKey !== ''}
                danger
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="pricing-management">
      <Title level={2}>Pricing Management</Title>
      <Card>
        <Form form={form} layout="vertical">
          <div className="mb-4">
            <Title level={4}>Add New Pricing Tier</Title>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please input the tier name!' }]}
              >
                <Input placeholder="Basic, Pro, Enterprise" />
              </Form.Item>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: 'Please input the price!' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value: number | string | undefined) => 
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value: string | undefined) => 
                    parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')
                  }
                />
              </Form.Item>
              <Form.Item
                name="billingCycle"
                label="Billing Cycle"
                initialValue="monthly"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="monthly">Monthly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="isActive"
                label="Status"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </div>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please input the description!' }]}
            >
              <Input.TextArea rows={2} placeholder="Description of the pricing tier" />
            </Form.Item>
            <Form.Item
              name="features"
              label="Features (one per line)"
              rules={[{ required: true, message: 'Please input at least one feature!' }]}
            >
              <Input.TextArea rows={4} placeholder="Feature 1\nFeature 2\nFeature 3" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddNew}
                disabled={editingKey !== ''}
              >
                Add New Tier
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card className="mt-6">
        <Title level={4} className="mb-4">Current Pricing Tiers</Title>
        <Table
          columns={columns}
          dataSource={tiers}
          rowKey="id"
          loading={loading}
          pagination={false}
          bordered
        />
      </Card>
    </div>
  );
};

export default PricingManagement;
