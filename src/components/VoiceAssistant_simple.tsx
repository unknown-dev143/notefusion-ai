import { Card, Input, Button, Typography, Space } from 'antd';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const VoiceAssistant = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <RobotOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>AI Assistant</Title>
        </Space>
      </Card>

      <Card>
        <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <RobotOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={3}>AI Assistant</Title>
            <Text type="secondary">Chat interface is loading...</Text>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              placeholder="Type your message..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ flex: 1 }}
            />
            <Button type="primary" icon={<SendOutlined />}>
              Send
            </Button>
          </Space.Compact>
        </div>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
