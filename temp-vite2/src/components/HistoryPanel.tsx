import React, { useState } from 'react';
import { Card, List, Input, Button, Space, Typography, Empty, Popconfirm, Tooltip } from 'antd';
import { SearchOutlined, DeleteOutlined, HistoryOutlined, ClearOutlined } from '@ant-design/icons';
import { useHistory } from '../contexts/HistoryContext';

// Simple fallback for date formatting if date-fns is not available
const formatDate = (timestamp: number) => {
  try {
    const { formatDistanceToNow } = require('date-fns');
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (e) {
    // Fallback to simple date string
    return new Date(timestamp).toLocaleString();
  }
};

const { Text } = Typography;

const HistoryPanel: React.FC = () => {
  const { history, isLoading, searchHistory, clearHistory, removeHistoryItem } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    searchHistory(value);
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'summary': 'Summarized',
      'improve': 'Improved',
      'tags': 'Generated Tags',
      'translate': 'Translated',
      'ideas': 'Generated Ideas',
      'question': 'Answered Question'
    };
    return labels[action] || action;
  };

  return (
    <Card 
      title={
        <Space>
          <HistoryOutlined />
          <span>AI History</span>
        </Space>
      }
      extra={
        history.length > 0 && (
          <Popconfirm
            title="Clear all history?"
            onConfirm={clearHistory}
            okText="Yes"
            cancelText="No"
            placement="bottomRight"
          >
            <Button 
              type="text" 
              size="small" 
              icon={<ClearOutlined />}
              danger
            >
              Clear All
            </Button>
          </Popconfirm>
        )
      }
      style={{ height: '100%' }}
      bodyStyle={{ 
        padding: '8px 0',
        height: 'calc(100% - 58px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ padding: '0 16px 12px' }}>
        <Input
          placeholder="Search history..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />
      </div>
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        {history.length === 0 ? (
          <Empty 
            description={
              <span>
                {isLoading ? 'Loading...' : 'No history yet. Your AI interactions will appear here.'}
              </span>
            }
            style={{ marginTop: 40 }}
          />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={history}
            loading={isLoading}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDate(item.timestamp)}
                  </Text>,
                  <Tooltip title="Delete">
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeHistoryItem(item.id)}
                    />
                  </Tooltip>
                ]}
                style={{ 
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                }}
                className="history-item"
                onClick={() => {
                  // You can implement click behavior here, like loading the item
                }}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{getActionLabel(item.action)}</Text>
                      {item.action === 'translate' && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          (to {typeof item.output === 'string' ? item.output.split(' ')[0] : ''})
                        </Text>
                      )}
                    </Space>
                  }
                  description={
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.input.length > 100 ? `${item.input.substring(0, 100)}...` : item.input}
                    </div>
                  }
                />
                
                {Array.isArray(item.output) ? (
                  <div style={{ marginTop: 8 }}>
                    {item.output.map((idea, idx) => (
                      <div key={idx} style={{ marginBottom: 4 }}>
                        <Text type="secondary" style={{ marginRight: 4 }}>•</Text>
                        <Text>{idea}</Text>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    marginTop: 8, 
                    maxHeight: 60, 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    <Text type="secondary">{item.output}</Text>
                  </div>
                )}
              </List.Item>
            )}
          />
        )}
      </div>
    </Card>
  );
};

export default HistoryPanel;
