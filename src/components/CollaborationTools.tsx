import React, { useState } from 'react';
import { Card, Typography, Button, Space, List, Avatar, Tag, Modal, Input, Select, message, Tabs, Badge } from 'antd';
import { UserOutlined, ShareAltOutlined, TeamOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Collaboration {
  id: string;
  title: string;
  type: 'shared-note' | 'group-study' | 'project';
  participants: string[];
  lastActivity: string;
  status: 'active' | 'completed';
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

const CollaborationTools: React.FC = () => {
  const [collaborations] = useState<Collaboration[]>([
    {
      id: '1',
      title: 'Math Study Group',
      type: 'group-study',
      participants: ['Alice', 'Bob', 'Charlie'],
      lastActivity: '2 hours ago',
      status: 'active'
    },
    {
      id: '2',
      title: 'Physics Project Notes',
      type: 'shared-note',
      participants: ['Alice', 'David'],
      lastActivity: '1 day ago',
      status: 'active'
    },
    {
      id: '3',
      title: 'Chemistry Lab Report',
      type: 'project',
      participants: ['Bob', 'Charlie', 'David'],
      lastActivity: '3 days ago',
      status: 'completed'
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Alice',
      content: 'Great explanation of the calculus concepts!',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      author: 'Bob',
      content: 'I think we should add more examples here.',
      timestamp: '3 hours ago'
    }
  ]);

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [shareEmail, setShareEmail] = useState('');

  const shareContent = () => {
    if (!shareEmail.trim()) {
      message.error('Please enter an email address');
      return;
    }
    message.success(`Content shared with ${shareEmail}`);
    setShareModalVisible(false);
    setShareEmail('');
  };

  const addComment = () => {
    if (!newComment.trim()) {
      message.error('Please enter a comment');
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      content: newComment,
      timestamp: 'Just now'
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    message.success('Comment added');
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'green' : 'default';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'group-study': return <TeamOutlined />;
      case 'shared-note': return <ShareAltOutlined />;
      case 'project': return <UserOutlined />;
      default: return <UserOutlined />;
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Collaboration Tools</Title>
      
      <Tabs defaultActiveKey="collaborations">
        <TabPane tab="Active Collaborations" key="collaborations">
          <Card
            title="Your Collaborations"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShareModalVisible(true)}>
                Start New
              </Button>
            }
          >
            <List
              dataSource={collaborations}
              renderItem={(collab) => (
                <List.Item
                  actions={[
                    <Button key="view" type="link">View</Button>,
                    <Button key="edit" type="link">Edit</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={getTypeIcon(collab.type)} />}
                    title={
                      <Space>
                        {collab.title}
                        <Tag color={getStatusColor(collab.status)}>
                          {collab.status}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Space wrap>
                          {collab.participants.map((participant, index) => (
                            <Tag key={index} icon={<UserOutlined />}>
                              {participant}
                            </Tag>
                          ))}
                        </Space>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Last activity: {collab.lastActivity}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="Comments & Discussions" key="comments">
          <Card
            title="Recent Comments"
            extra={<Badge count={comments.length} showZero />}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {comments.map((comment) => (
                <Card key={comment.id} size="small">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Avatar icon={<UserOutlined />} size="small" />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>{comment.author}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {comment.timestamp}
                        </Text>
                      </div>
                      <Text style={{ display: 'block', marginTop: 4 }}>
                        {comment.content}
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}

              <Card size="small" style={{ background: '#f5f5f5' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <TextArea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        addComment();
                      }
                    }}
                    rows={2}
                  />
                  <Button type="primary" icon={<SendOutlined />} onClick={addComment}>
                    Send
                  </Button>
                </Space.Compact>
              </Card>
            </Space>
          </Card>
        </TabPane>

        <TabPane tab="Shared Resources" key="resources">
          <Card title="Shared Files & Resources">
            <List
              dataSource={[
                { name: 'Math Formula Sheet', type: 'PDF', sharedBy: 'Alice', size: '2.3 MB' },
                { name: 'Study Schedule', type: 'Document', sharedBy: 'Bob', size: '156 KB' },
                { name: 'Practice Problems', type: 'PDF', sharedBy: 'Charlie', size: '1.8 MB' }
              ]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="download" type="link">Download</Button>,
                    <Button key="view" type="link">View</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`${item.type} • Shared by ${item.sharedBy} • ${item.size}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="Share Content"
        open={shareModalVisible}
        onOk={shareContent}
        onCancel={() => setShareModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Share with (email):</Text>
            <Input
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Enter email address"
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Share type:</Text>
            <Select defaultValue="view" style={{ width: '100%', marginTop: 8 }}>
              <Select.Option value="view">Can view</Select.Option>
              <Select.Option value="edit">Can edit</Select.Option>
              <Select.Option value="comment">Can comment</Select.Option>
            </Select>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default CollaborationTools;
