import React, { useState } from 'react';
import { Tabs, Card, Button, Space } from 'antd';
import { 
  DownloadOutlined,
  HistoryOutlined, 
  TagOutlined, 
  TableOutlined
} from '@ant-design/icons';

// Import components
import PricingHistory from './components/PricingHistory';
import DiscountManagement from './components/DiscountManagement';
import BulkPricing from './components/BulkPricing';

const { TabPane } = Tabs;

const PricingAdvanced: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const onTabChange = () => {
    // Tab change handler
  };

  return (
    <div className="pricing-advanced">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Advanced Pricing Management</h2>
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            loading={loading}
          >
            Export
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs defaultActiveKey="1" onChange={onTabChange}>
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                Price History
              </span>
            }
            key="1"
          >
            <PricingHistory />
          </TabPane>
          <TabPane
            tab={
              <span>
                <TagOutlined />
                Discount Codes
              </span>
            }
            key="2"
          >
            <DiscountManagement />
          </TabPane>
          <TabPane
            tab={
              <span>
                <TableOutlined />
                Bulk Pricing
              </span>
            }
            key="3"
          >
            <BulkPricing />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PricingAdvanced;
