import React, { useState } from 'react';
import { Card, Typography, Button, Table, Tag, Space, Modal, Select, message, Statistic, Row, Col, Form, Input } from 'antd';
import { 
  CreditCardOutlined, 
  PlusOutlined, 
  HistoryOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank' | 'crypto';
  last4?: string;
  brand?: string;
  isDefault: boolean;
  expiryDate?: string;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
  paymentMethod: string;
  type: 'payment' | 'refund' | 'subscription';
}

const PaymentSystem: React.FC = () => {
  const [form] = Form.useForm();
  const [addPaymentModalVisible, setAddPaymentModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      isDefault: true,
      expiryDate: '12/25'
    }
  ]);

  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2024-01-15',
      amount: 9.99,
      status: 'completed',
      description: 'Premium Plan - Monthly',
      paymentMethod: 'Visa •••• 4242',
      type: 'subscription'
    },
    {
      id: '2',
      date: '2024-01-10',
      amount: 9.99,
      status: 'completed',
      description: 'Premium Plan - Monthly',
      paymentMethod: 'Visa •••• 4242',
      type: 'subscription'
    }
  ];

  const handleAddPaymentMethod = async (values: any) => {
    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      last4: values.cardNumber.slice(-4),
      brand: values.cardType,
      isDefault: paymentMethods.length === 0,
      expiryDate: `${values.expiryMonth}/${values.expiryYear.slice(-2)}`
    };

    setPaymentMethods(prev => [...prev, newPaymentMethod]);
    message.success('Payment method added successfully!');
    setAddPaymentModalVisible(false);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    message.success('Default payment method updated!');
  };

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    message.success('Payment method removed!');
  };

  const paymentColumns = [
    {
      title: 'Payment Method',
      key: 'method',
      render: (record: PaymentMethod) => (
        <Space>
          <CreditCardOutlined />
          <span>
            {record.brand} •••• {record.last4}
            {record.expiryDate && <Text type="secondary"> ({record.expiryDate})</Text>}
          </span>
          {record.isDefault && <Tag color="blue">Default</Tag>}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: PaymentMethod) => (
        <Space>
          {!record.isDefault && (
            <Button size="small" onClick={() => handleSetDefault(record.id)}>
              Set as Default
            </Button>
          )}
          {paymentMethods.length > 1 && (
            <Button size="small" danger onClick={() => handleRemovePaymentMethod(record.id)}>
              Remove
            </Button>
          )}
        </Space>
      )
    }
  ];

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          completed: 'green',
          pending: 'orange',
          failed: 'red'
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      }
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod'
    }
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Payment & Billing</Title>

      {/* Current Plan */}
      <Card title="Current Plan" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Plan"
              value="Premium"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Monthly Cost"
              value="$9.99"
              precision={2}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Next Billing"
              value="Feb 15, 2024"
            />
          </Col>
        </Row>
      </Card>

      {/* Payment Methods */}
      <Card 
        title="Payment Methods" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddPaymentModalVisible(true)}>
            Add Payment Method
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={paymentColumns}
          dataSource={paymentMethods}
          pagination={false}
          rowKey="id"
        />
      </Card>

      {/* Transaction History */}
      <Card title="Transaction History" extra={<HistoryOutlined />}>
        <Table
          columns={transactionColumns}
          dataSource={transactions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add Payment Method Modal */}
      <Modal
        title="Add Payment Method"
        open={addPaymentModalVisible}
        onCancel={() => setAddPaymentModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddPaymentMethod} layout="vertical">
          <Form.Item name="cardType" label="Card Type" rules={[{ required: true }]}>
            <Select placeholder="Select card type">
              <Option value="Visa">Visa</Option>
              <Option value="Mastercard">Mastercard</Option>
              <Option value="American Express">American Express</Option>
            </Select>
          </Form.Item>

          <Form.Item name="cardNumber" label="Card Number" rules={[{ required: true }]}>
            <Input placeholder="1234 5678 9012 3456" maxLength={16} />
          </Form.Item>

          <Form.Item name="cardholderName" label="Cardholder Name" rules={[{ required: true }]}>
            <Input placeholder="John Doe" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="expiryMonth" label="Expiry Month" rules={[{ required: true }]}>
                <Select placeholder="Month">
                  <Option value="01">01</Option>
                  <Option value="02">02</Option>
                  <Option value="03">03</Option>
                  <Option value="04">04</Option>
                  <Option value="05">05</Option>
                  <Option value="06">06</Option>
                  <Option value="07">07</Option>
                  <Option value="08">08</Option>
                  <Option value="09">09</Option>
                  <Option value="10">10</Option>
                  <Option value="11">11</Option>
                  <Option value="12">12</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiryYear" label="Expiry Year" rules={[{ required: true }]}>
                <Select placeholder="Year">
                  <Option value="2024">2024</Option>
                  <Option value="2025">2025</Option>
                  <Option value="2026">2026</Option>
                  <Option value="2027">2027</Option>
                  <Option value="2028">2028</Option>
                  <Option value="2029">2029</Option>
                  <Option value="2030">2030</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="cvv" label="CVV" rules={[{ required: true }]}>
            <Input placeholder="123" maxLength={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Payment Method
              </Button>
              <Button onClick={() => setAddPaymentModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentSystem;
