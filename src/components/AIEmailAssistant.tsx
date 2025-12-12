import React, { useState } from 'react';
import { Card, Typography, Button, Space, Input, Select, Tabs, List, Tag, Modal, Avatar, Badge, Switch } from 'antd';
import { 
  MailOutlined,
  SendOutlined,
  RobotOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  category: 'inbox' | 'sent' | 'draft' | 'trash';
  read: boolean;
  starred: boolean;
  aiSummary?: string;
  aiReply?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

const AIEmailAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      from: 'professor@university.edu',
      to: 'student@university.edu',
      subject: 'Assignment Extension Request',
      body: 'I would like to request an extension for the upcoming assignment...',
      timestamp: '2024-01-15T10:30:00',
      priority: 'high',
      category: 'inbox',
      read: false,
      starred: true,
      aiSummary: 'Student requesting assignment extension due to personal reasons.',
      aiReply: 'Dear Student, I understand your situation. Please provide documentation...'
    }
  ]);
  const [newEmail, setNewEmail] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [emailTone, setEmailTone] = useState('professional');
  const [emailLength, setEmailLength] = useState('medium');
  const [autoReply, setAutoReply] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const emailTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Meeting Request',
      subject: 'Meeting Request - [Topic]',
      body: 'Dear [Name],\n\nI would like to schedule a meeting to discuss [topic].\n\nPlease let me know your availability.\n\nBest regards,\n[Your Name]',
      category: 'Professional'
    },
    {
      id: '2',
      name: 'Follow Up',
      subject: 'Follow Up - [Previous Subject]',
      body: 'Hi [Name],\n\nJust following up on our previous conversation about [topic].\n\nLooking forward to hearing from you.\n\nBest,\n[Your Name]',
      category: 'Professional'
    }
  ];

  const generateEmailReply = (email: Email) => {
    const reply = `
Dear ${email.from.split('@')[0]},

Thank you for your email regarding "${email.subject}".

${emailTone === 'professional' ? 'I have received your message and will respond appropriately.' : 
  emailTone === 'casual' ? 'Thanks for reaching out! Got your message.' : 
  'Your message has been noted and will be addressed.'}

${autoReply ? 'This is an automated response. I will get back to you soon.' : ''}

Best regards,
[Your Name]
    `;
    return reply.trim();
  };

  const generateEmailDraft = () => {
    const draft = `
Subject: ${newEmail.subject || 'Generated Subject'}

Dear ${newEmail.to.split('@')[0] || 'Recipient'},

${emailTone === 'professional' ? 
  'I hope this email finds you well. I am writing to discuss...' :
  emailTone === 'casual' ? 
  'Hey! Just wanted to reach out about...' :
  'Greetings! I am contacting you regarding...'
}

${newEmail.body || '[AI-generated content based on your input]'}

${emailTone === 'professional' ? 
  'I look forward to your response.' :
  emailTone === 'casual' ? 
  'Let me know what you think!' :
  'Awaiting your reply.'
}

Best regards,
[Your Name]
    `;
    setNewEmail({ ...newEmail, body: draft.trim() });
  };

  const summarizeEmail = (email: Email) => {
    const summary = `This email from ${email.from} discusses ${email.subject}. Key points: ${email.body.substring(0, 100)}...`;
    return summary;
  };

  const categorizeEmail = (email: Email): string => {
    const body = email.body.toLowerCase();
    if (body.includes('urgent') || body.includes('asap')) return 'urgent';
    if (body.includes('meeting') || body.includes('schedule')) return 'meeting';
    if (body.includes('assignment') || body.includes('deadline')) return 'academic';
    if (body.includes('project') || body.includes('work')) return 'work';
    return 'general';
  };

  const sendEmail = () => {
    const email: Email = {
      id: Date.now().toString(),
      from: 'user@example.com',
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.body,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      category: 'sent',
      read: true,
      starred: false
    };
    setEmails([email, ...emails]);
    setNewEmail({ to: '', subject: '', body: '' });
  };

  const applyTemplate = (template: EmailTemplate) => {
    setNewEmail({
      to: newEmail.to,
      subject: template.subject,
      body: template.body
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <Space>
          <MailOutlined />
          AI Email Assistant
        </Space>
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Compose" key="compose">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="New Email" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>To:</Text>
                    <Input
                      placeholder="recipient@example.com"
                      value={newEmail.to}
                      onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                    />
                  </div>

                  <div>
                    <Text strong>Subject:</Text>
                    <Input
                      placeholder="Email subject"
                      value={newEmail.subject}
                      onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                    />
                  </div>

                  <div>
                    <Text strong>Body:</Text>
                    <TextArea
                      placeholder="Write your email here..."
                      value={newEmail.body}
                      onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                      rows={10}
                    />
                  </div>

                  <Space>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={sendEmail}
                      disabled={!newEmail.to || !newEmail.subject}
                    >
                      Send Email
                    </Button>
                    <Button
                      icon={<RobotOutlined />}
                      onClick={generateEmailDraft}
                    >
                      AI Draft
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="AI Settings" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Email Tone:</Text>
                    <Select
                      value={emailTone}
                      onChange={setEmailTone}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      <Option value="professional">Professional</Option>
                      <Option value="casual">Casual</Option>
                      <Option value="formal">Formal</Option>
                      <Option value="friendly">Friendly</Option>
                    </Select>
                  </div>

                  <div>
                    <Text strong>Email Length:</Text>
                    <Select
                      value={emailLength}
                      onChange={setEmailLength}
                      style={{ width: '100%', marginTop: '8px' }}
                    >
                      <Option value="short">Short</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="long">Long</Option>
                    </Select>
                  </div>

                  <div>
                    <Space>
                      <Text strong>Auto-Reply:</Text>
                      <Switch checked={autoReply} onChange={setAutoReply} />
                    </Space>
                  </div>

                  <div>
                    <Text strong>Templates:</Text>
                    <List
                      dataSource={emailTemplates}
                      renderItem={(template) => (
                        <List.Item>
                          <Button
                            type="link"
                            onClick={() => applyTemplate(template)}
                            style={{ padding: '0' }}
                          >
                            {template.name}
                          </Button>
                        </List.Item>
                      )}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Inbox" key="inbox">
          <Card>
            <List
              dataSource={emails.filter(e => e.category === 'inbox')}
              renderItem={(email) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Space>
                          <Avatar icon={<UserOutlined />} />
                          <Text strong>{email.from}</Text>
                          <Tag color={getPriorityColor(email.priority)}>
                            {email.priority}
                          </Tag>
                          {!email.read && <Badge status="processing" />}
                          {email.starred && <StarOutlined style={{ color: '#faad14' }} />}
                        </Space>
                        <div style={{ float: 'right' }}>
                          <Text type="secondary">
                            {new Date(email.timestamp).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                      
                      <div>
                        <Text strong>{email.subject}</Text>
                      </div>
                      
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {email.body}
                      </Paragraph>

                      {email.aiSummary && (
                        <div style={{ backgroundColor: '#f6ffed', padding: '8px', borderRadius: '4px' }}>
                          <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                            <BulbOutlined /> AI Summary: {email.aiSummary}
                          </Text>
                        </div>
                      )}

                      <Space>
                        <Button size="small" icon={<EditOutlined />}>
                          Reply
                        </Button>
                        <Button size="small" icon={<StarOutlined />}>
                          Star
                        </Button>
                        <Button size="small" icon={<DeleteOutlined />} danger>
                          Delete
                        </Button>
                      </Space>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="AI Assistant" key="assistant">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>Email Analysis</Title>
              
              <div>
                <Text strong>Unread Emails:</Text>
                <Badge count={emails.filter(e => !e.read && e.category === 'inbox').length} style={{ marginLeft: '8px' }} />
              </div>

              <div>
                <Text strong>High Priority:</Text>
                <Badge count={emails.filter(e => e.priority === 'high').length} style={{ marginLeft: '8px' }} />
              </div>

              <Title level={4}>Quick Actions</Title>
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  block
                >
                  Generate Smart Replies for All
                </Button>
                
                <Button
                  icon={<CheckCircleOutlined />}
                  block
                >
                  Mark All as Read
                </Button>
                
                <Button
                  icon={<StarOutlined />}
                  block
                >
                  Star Important Emails
                </Button>
              </Space>

              <Title level={4}>Email Categories</Title>
              
              <Space wrap>
                <Tag color="blue">Academic ({emails.filter(e => categorizeEmail(e) === 'academic').length})</Tag>
                <Tag color="green">Work ({emails.filter(e => categorizeEmail(e) === 'work').length})</Tag>
                <Tag color="orange">Meeting ({emails.filter(e => categorizeEmail(e) === 'meeting').length})</Tag>
                <Tag color="red">Urgent ({emails.filter(e => categorizeEmail(e) === 'urgent').length})</Tag>
              </Space>
            </Space>
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AIEmailAssistant;
