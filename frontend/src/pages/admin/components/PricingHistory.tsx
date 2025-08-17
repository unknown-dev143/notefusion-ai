import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Tooltip } from 'antd';
import { HistoryOutlined, RollbackOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface PriceHistory {
  id: string;
  pricingTierId: string;
  tierName: string;
  previousPrice: number;
  newPrice: number;
  changeType: 'increase' | 'decrease' | 'new' | 'deactivated';
  changedBy: string;
  changedAt: string;
  reason?: string;
}

const PricingHistory: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PriceHistory | null>(null);

  useEffect(() => {
    fetchPriceHistory();
  }, []);

  const fetchPriceHistory = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockData: PriceHistory[] = [
        {
          id: '1',
          pricingTierId: 'tier-1',
          tierName: 'Pro',
          previousPrice: 9.99,
          newPrice: 12.99,
          changeType: 'increase',
          changedBy: 'admin@example.com',
          changedAt: '2025-08-15T10:30:00Z',
          reason: 'Annual price adjustment'
        },
        // Add more mock data as needed
      ];
      setHistory(mockData);
    } catch (error) {
      console.error('Failed to fetch price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = (record: PriceHistory) => {
    setSelectedRecord(record);
    // Show confirmation modal and handle revert
    console.log('Reverting to:', record);
  };

  const columns: ColumnsType<PriceHistory> = [
    {
      title: 'Pricing Tier',
      dataIndex: 'tierName',
      key: 'tierName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Price Change',
      key: 'priceChange',
      render: (_, record) => (
        <Space>
          <span style={{ textDecoration: 'line-through', color: '#999' }}>
            ${record.previousPrice.toFixed(2)}
          </span>
          <span>→</span>
          <span style={{ fontWeight: 'bold' }}>
            ${record.newPrice.toFixed(2)}
          </span>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'changeType',
      key: 'changeType',
      render: (changeType: string) => {
        const color = {
          increase: 'red',
          decrease: 'green',
          new: 'blue',
          deactivated: 'default',
        }[changeType] as string;
        
        return (
          <Tag color={color}>
            {changeType.charAt(0).toUpperCase() + changeType.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Changed By',
      dataIndex: 'changedBy',
      key: 'changedBy',
    },
    {
      title: 'Date',
      dataIndex: 'changedAt',
      key: 'changedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="Revert to this price">
          <Button 
            icon={<RollbackOutlined />} 
            size="small"
            onClick={() => handleRevert(record)}
            disabled={record.changeType === 'new'}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="pricing-history">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          <HistoryOutlined className="mr-2" />
          Price Change History
        </h3>
        <Button 
          type="primary" 
          size="small"
          onClick={fetchPriceHistory}
          loading={loading}
        >
          Refresh
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={history}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <div className="p-4 bg-gray-50 rounded">
              <p className="font-medium mb-2">Change Details:</p>
              <p className="mb-1">
                <span className="font-medium">Reason:</span> {record.reason || 'No reason provided'}
              </p>
              <p className="text-xs text-gray-500">
                Record ID: {record.id}
              </p>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default PricingHistory;
