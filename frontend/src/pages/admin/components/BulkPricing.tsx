import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Upload, 
  Table, 
  Tag, 
  Space, 
  Alert, 
  Progress, 
  Typography,
  Select,
  InputNumber
} from 'antd';
import { 
  UploadOutlined, 
  InfoCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title } = Typography;
const { Option } = Select;

interface BulkPricingRecord {
  key: string;
  tierId: string;
  tierName: string;
  currentPrice: number;
  newPrice: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'no_change';
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

const BulkPricing: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<BulkPricingRecord[]>([]);
  const [selectedAction, setSelectedAction] = useState<'percentage' | 'fixed'>('percentage');
  const [adjustmentValue, setAdjustmentValue] = useState<number>(10);

  // Mock data for demonstration
  const mockTiers = [
    { id: 'tier-1', name: 'Basic', price: 9.99 },
    { id: 'tier-2', name: 'Pro', price: 29.99 },
    { id: 'tier-3', name: 'Enterprise', price: 99.99 },
  ];

  const handleUpload = () => {
    setUploading(true);
    
    // Simulate file processing
    setTimeout(() => {
      // Generate preview data from mock tiers
      const preview = mockTiers.map(tier => {
        const change = selectedAction === 'percentage' 
          ? tier.price * (adjustmentValue / 100) 
          : adjustmentValue;
        const newPrice = selectedAction === 'percentage'
          ? tier.price + change
          : tier.price + change;
          
        return {
          key: tier.id,
          tierId: tier.id,
          tierName: tier.name,
          currentPrice: tier.price,
          newPrice: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no_change',
          status: 'pending' as const
        } as BulkPricingRecord;
      });
      
      setPreviewData(preview);
      setUploading(false);
    }, 1500);
  };

  const handleApplyChanges = () => {
    // Simulate applying changes
    const updatedData = previewData.map(item => ({
      ...item,
      status: 'processing' as const
    }));
    setPreviewData(updatedData);

    // Simulate API calls
    updatedData.forEach((_, index) => {
      setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% success rate for demo
        
        setPreviewData(prev => {
          const newData = [...prev];
          newData[index] = {
            ...newData[index],
            status: isSuccess ? 'completed' : 'error',
            error: isSuccess ? undefined : 'Failed to update price'
          } as BulkPricingRecord;
          return newData;
        });
      }, 500 + (index * 200)); // Staggered delays
    });
  };

  const columns = [
    {
      title: 'Pricing Tier',
      dataIndex: 'tierName',
      key: 'tierName',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Current Price',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'New Price',
      dataIndex: 'newPrice',
      key: 'newPrice',
      render: (price: number, record: BulkPricingRecord) => (
        <span className={record.changeType !== 'no_change' ? 'font-bold' : ''}>
          ${price.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Change',
      key: 'change',
      render: (_: any, record: BulkPricingRecord) => {
        if (record.changeType === 'no_change') return <span>-</span>;
        
        const color = record.changeType === 'increase' ? 'red' : 'green';
        const prefix = record.changeType === 'increase' ? '+' : '';
        
        return (
          <Tag color={color}>
            {prefix}{record.change.toFixed(2)} ({selectedAction === 'percentage' ? `${adjustmentValue}%` : '$' + adjustmentValue})
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: BulkPricingRecord) => {
        const statusMap: any = {
          pending: { text: 'Pending', color: 'default' },
          processing: { text: 'Updating...', color: 'processing' },
          completed: { text: 'Updated', color: 'success' },
          error: { text: 'Error', color: 'error' },
        };
        
        return (
          <div>
            <Tag color={statusMap[status].color}>
              {statusMap[status].text}
            </Tag>
            {record.error && (
              <div className="text-xs text-red-500 mt-1">{record.error}</div>
            )}
          </div>
        );
      },
    },
  ];

  const completedCount = previewData.filter(item => item.status === 'completed').length;
  const errorCount = previewData.filter(item => item.status === 'error').length;
  const processingCount = previewData.filter(item => item.status === 'processing').length;
  const progress = previewData.length > 0 
    ? Math.round((completedCount / previewData.length) * 100) 
    : 0;

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
      return false;
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <div className="bulk-pricing">
      <Card className="mb-6">
        <Title level={4} className="mb-4">Bulk Price Adjustment</Title>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Upload CSV */}
          <div className="space-y-4">
            <div className="font-medium mb-2">1. Upload Price List (CSV/Excel)</div>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} block>
                Select File
              </Button>
            </Upload>
            <div className="text-xs text-gray-500">
              <InfoCircleOutlined className="mr-1" />
              Download the <a href="#" className="text-blue-500">template file</a> for reference
            </div>
          </div>

          {/* Option 2: Adjust by percentage/fixed amount */}
          <div className="space-y-4">
            <div className="font-medium mb-2">2. Or Adjust All Prices</div>
            <div className="flex items-center space-x-4">
              <Select 
                value={selectedAction}
                onChange={setSelectedAction}
                style={{ width: 150 }}
              >
                <Option value="percentage">Increase/Decrease by %</Option>
                <Option value="fixed">Increase/Decrease by $</Option>
              </Select>
              
              <InputNumber
                value={adjustmentValue}
                onChange={(value) => setAdjustmentValue(value || 0)}
                min={selectedAction === 'percentage' ? -100 : -Infinity}
                max={selectedAction === 'percentage' ? 100 : Infinity}
                style={{ width: 150 }}
                addonAfter={selectedAction === 'percentage' ? '%' : '$'}
              />
              
              <Button 
                type="primary" 
                onClick={handleUpload}
                loading={uploading}
              >
                Preview Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {previewData.length > 0 && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Title level={4} className="mb-0">Preview Changes</Title>
            <div className="space-x-2">
              <Button icon={<FileExcelOutlined />}>
                Export to Excel
              </Button>
              <Button icon={<FilePdfOutlined />}>
                Export to PDF
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                {completedCount} of {previewData.length} prices will be updated
                {errorCount > 0 && ` (${errorCount} errors)`}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress 
              percent={progress} 
              status={errorCount > 0 ? 'exception' : 'normal'}
              showInfo={false}
            />
          </div>
          
          <Table 
            columns={columns} 
            dataSource={previewData} 
            pagination={false}
            className="mb-4"
          />
          
          <div className="flex justify-end">
            <Space>
              <Button onClick={() => setPreviewData([])}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                onClick={handleApplyChanges}
                disabled={processingCount > 0 || completedCount > 0}
                loading={processingCount > 0}
              >
                {processingCount > 0 
                  ? `Updating ${processingCount} items...` 
                  : 'Apply Changes'}
              </Button>
            </Space>
          </div>
        </Card>
      )}

      <Alert
        message="Bulk Update Guidelines"
        description={
          <div className="space-y-2">
            <div>• Use the template to ensure proper formatting of your price list</div>
            <div>• All changes will be logged for audit purposes</div>
            <div>• Changes will be applied immediately after confirmation</div>
            <div>• You can download a preview of changes before applying</div>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="font-medium mb-2">Recent Bulk Updates</div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div>Price Increase</div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>
            <div className="flex justify-between">
              <div>Holiday Sale</div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="font-medium mb-2">Next Scheduled Update</div>
          <div className="text-gray-500">No updates scheduled</div>
        </Card>
        
        <Card>
          <div className="font-medium mb-2">Need Help?</div>
          <div className="space-y-2">
            <div className="text-sm">• <a href="#" className="text-blue-500">View documentation</a></div>
            <div className="text-sm">• <a href="#" className="text-blue-500">Contact support</a></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BulkPricing;
