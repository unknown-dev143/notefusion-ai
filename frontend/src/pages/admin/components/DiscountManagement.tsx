import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  DatePicker, 
  Modal, 
  Form, 
  InputNumber,
  Switch,
  message
} from 'antd';
<<<<<<< HEAD
import { DiscountCode } from '../../../types/discount';
import { formatDate } from '../../../utils/date';
import { CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './DiscountManagement.module.css';
=======
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  maxUses?: number;
  uses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  appliesTo: 'all' | 'specific';
  appliesToIds?: string[];
  minPurchaseAmount?: number;
  createdBy: string;
  createdAt: string;
}

const DiscountManagement: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockData: DiscountCode[] = [
        {
          id: '1',
          code: 'SUMMER25',
          description: 'Summer Sale 25% Off',
          discountType: 'percentage',
          value: 25,
          maxUses: 100,
          uses: 42,
          validFrom: '2025-06-01T00:00:00Z',
          validUntil: '2025-08-31T23:59:59Z',
          isActive: true,
          appliesTo: 'all',
          createdBy: 'admin@example.com',
          createdAt: '2025-05-25T10:30:00Z',
        },
        // Add more mock data as needed
      ];
      setDiscounts(mockData);
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
      message.error('Failed to load discount codes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingDiscount(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    form.setFieldsValue({
      ...discount,
      validRange: [moment(discount.validFrom), moment(discount.validUntil)]
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setDiscounts(discounts.filter(d => d.id !== id));
      message.success('Discount code deleted');
    } catch (error) {
      message.error('Failed to delete discount code');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const discountData = {
        ...values,
        validFrom: values.validRange[0].toISOString(),
        validUntil: values.validRange[1].toISOString(),
      };
      delete discountData.validRange;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingDiscount) {
        // Update existing
        setDiscounts(discounts.map(d => 
          d.id === editingDiscount.id ? { ...d, ...discountData } : d
        ));
        message.success('Discount code updated');
      } else {
        // Add new
        const newDiscount = {
          ...discountData,
          id: `disc-${Date.now()}`,
          uses: 0,
          createdBy: 'current_user@example.com',
          createdAt: new Date().toISOString(),
        };
        setDiscounts([...discounts, newDiscount]);
        message.success('Discount code created');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save discount code');
    }
  };

  const columns: ColumnsType<DiscountCode> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (text, record) => (
<<<<<<< HEAD
        <div className="discount-code">
=======
        <div>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (_, record) => (
        <span className="font-medium">
          {record.discountType === 'percentage' 
            ? `${record.value}%` 
            : `$${record.value.toFixed(2)}`}
        </span>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
<<<<<<< HEAD
      render: (_, record) => {
        const progress = Math.min(100, (record.uses / (record.maxUses || 100)) * 100);
        return (
          <div className={styles.discountUsage}>
            <div>
              {record.uses} / {record.maxUses || '∞'} uses
            </div>
            <div className={styles.discountUsageBar}>
              <div 
                className={`${styles.discountUsageFill} ${record.maxUses && record.uses >= record.maxUses ? styles.full : ''}`} 
                style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
              />
            </div>
          </div>
        );
      },
=======
      render: (_, record) => (
        <div>
          <div>
            {record.uses} / {record.maxUses || '∞'} uses
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, (record.uses / (record.maxUses || 100)) * 100)}%` }}
            />
          </div>
        </div>
      ),
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
    },
    {
      title: 'Validity',
      key: 'validity',
      render: (_, record) => {
        const now = new Date();
        const validFrom = new Date(record.validFrom);
        const validUntil = new Date(record.validUntil);
        const isActive = now >= validFrom && now <= validUntil;
        
        return (
<<<<<<< HEAD
          <div className="discount-validity">
            <div className={`status-indicator ${isActive ? 'status-active' : 'status-inactive'}`}>
              {isActive ? (
                <CheckCircleOutlined className="icon" />
              ) : (
                <CloseCircleOutlined className="icon" />
=======
          <div>
            <div className="flex items-center">
              {isActive ? (
                <CheckCircleOutlined className="text-green-500 mr-1" />
              ) : (
                <CloseCircleOutlined className="text-red-500 mr-1" />
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              )}
              <span>{isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="text-xs text-gray-500">
              {validFrom.toLocaleDateString()} - {validUntil.toLocaleDateString()}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
<<<<<<< HEAD
        <Tag className={`discount-tag ${isActive ? 'active' : 'expired'}`}>
=======
        <Tag color={isActive ? 'green' : 'red'}>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
<<<<<<< HEAD
        <div className="discount-actions">
=======
        <Space size="middle">
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
<<<<<<< HEAD
            className="action-button"
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
<<<<<<< HEAD
            className="action-button"
          />
        </div>
=======
          />
        </Space>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
      ),
    },
  ];

  return (
    <div className="discount-management">
<<<<<<< HEAD
      <div className="discount-header">
=======
      <div className="flex justify-between items-center mb-6">
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        <h3 className="text-lg font-medium">Discount Codes</h3>
        <div className="flex space-x-4">
          <Input
            placeholder="Search discount codes..."
            prefix={<SearchOutlined />}
<<<<<<< HEAD
=======
            style={{ width: 250 }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddNew}
          >
            Add Discount
          </Button>
        </div>
      </div>

      <Table 
<<<<<<< HEAD
        className="discount-table"
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
        columns={columns} 
        dataSource={discounts}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingDiscount ? 'Edit Discount Code' : 'Create New Discount Code'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
<<<<<<< HEAD
          className="discount-form"
=======
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            appliesTo: 'all',
            discountType: 'percentage',
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Code"
              rules={[{ required: true, message: 'Please enter a discount code' }]}
            >
              <Input placeholder="e.g., SUMMER25" />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter a description' }]}
            >
              <Input placeholder="e.g., Summer Sale 25% Off" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="discountType"
              label="Discount Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="percentage">Percentage</Option>
                <Option value="fixed">Fixed Amount</Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.discountType !== currentValues.discountType
              }
            >
              {({ getFieldValue }) => (
                <Form.Item
                  name="value"
                  label={
                    getFieldValue('discountType') === 'percentage' 
                      ? 'Discount Percentage' 
                      : 'Discount Amount'
                  }
                  rules={[{ required: true, message: 'Please enter the discount value' }]}
                >
                  <InputNumber 
                    min={0}
                    max={getFieldValue('discountType') === 'percentage' ? 100 : undefined}
<<<<<<< HEAD
=======
                    style={{ width: '100%' }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                    addonAfter={getFieldValue('discountType') === 'percentage' ? '%' : '$'}
                  />
                </Form.Item>
              )}
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="maxUses"
              label="Maximum Uses"
              tooltip="Leave empty for unlimited uses"
            >
<<<<<<< HEAD
              <InputNumber min={1} />
=======
              <InputNumber min={1} style={{ width: '100%' }} />
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            </Form.Item>

            <Form.Item
              name="minPurchaseAmount"
              label="Minimum Purchase Amount"
              tooltip="Minimum order amount to apply this discount"
            >
              <InputNumber 
                min={0} 
<<<<<<< HEAD
=======
                style={{ width: '100%' }} 
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                prefix="$"
                precision={2}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="validRange"
            label="Validity Period"
            rules={[{ required: true, message: 'Please select a validity period' }]}
          >
            <RangePicker 
              showTime 
<<<<<<< HEAD
=======
              style={{ width: '100%' }} 
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>

          <Form.Item
            name="appliesTo"
            label="Applies To"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="all">All Products</Option>
              <Option value="specific">Specific Products</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.appliesTo !== currentValues.appliesTo
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('appliesTo') === 'specific' ? (
                <Form.Item
                  name="appliesToIds"
                  label="Select Products"
                  rules={[{ required: true, message: 'Please select at least one product' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select products..."
<<<<<<< HEAD
=======
                    style={{ width: '100%' }}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
                  >
                    {/* These would be populated from your products API */}
                    <Option value="tier-1">Basic Plan</Option>
                    <Option value="tier-2">Pro Plan</Option>
                    <Option value="tier-3">Enterprise Plan</Option>
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="isActive"
            valuePropName="checked"
            label="Status"
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive" 
            />
          </Form.Item>

<<<<<<< HEAD
          <div className="discount-form-footer">
=======
          <div className="flex justify-end space-x-4 mt-6">
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
            <Button onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingDiscount ? 'Update' : 'Create'} Discount
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DiscountManagement;
