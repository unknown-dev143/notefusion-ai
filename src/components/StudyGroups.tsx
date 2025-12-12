import React, { useState } from 'react';
import { Card, Typography, Button, Space, List, Avatar, Tag, Modal, Input, Select, Tabs, Row, Col, Progress, Badge, message } from 'antd';
import { 
  TeamOutlined, 
  PlusOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  ShareAltOutlined,
  SettingOutlined,
  QrcodeOutlined,
  CopyOutlined,
  MobileOutlined
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  members: string[];
  maxMembers: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  schedule: string;
  nextMeeting: string;
  progress: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface StudySession {
  id: string;
  groupId: string;
  title: string;
  date: string;
  duration: number;
  attendees: string[];
  notes: string;
  recordingUrl?: string;
}

interface GroupMessage {
  id: string;
  groupId: string;
  author: string;
  content: string;
  timestamp: string;
  isAnnouncement: boolean;
}

const StudyGroups: React.FC = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([
    {
      id: '1',
      name: 'JavaScript Masters',
      description: 'Advanced JavaScript concepts and modern frameworks',
      subject: 'Programming',
      members: ['Alice', 'Bob', 'Charlie', 'David'],
      maxMembers: 6,
      difficulty: 'Advanced',
      schedule: 'Tuesdays & Thursdays 6PM',
      nextMeeting: '2024-01-18T18:00:00',
      progress: 75,
      isActive: true,
      createdBy: 'Alice',
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      name: 'Calculus Study Circle',
      description: 'Master calculus through collaborative problem solving',
      subject: 'Mathematics',
      members: ['Eve', 'Frank'],
      maxMembers: 4,
      difficulty: 'Intermediate',
      schedule: 'Mondays 5PM',
      nextMeeting: '2024-01-17T17:00:00',
      progress: 45,
      isActive: true,
      createdBy: 'Eve',
      createdAt: '2024-01-08'
    }
  ]);

  const [sessions] = useState<StudySession[]>([
    {
      id: '1',
      groupId: '1',
      title: 'React Hooks Deep Dive',
      date: '2024-01-16T18:00:00',
      duration: 90,
      attendees: ['Alice', 'Bob', 'Charlie'],
      notes: 'Discussed useState, useEffect, and custom hooks',
      recordingUrl: 'https://example.com/recording1'
    }
  ]);

  const [messages] = useState<GroupMessage[]>([
    {
      id: '1',
      groupId: '1',
      author: 'Alice',
      content: 'Great session today! Next week we\'ll cover Redux.',
      timestamp: '2024-01-16T19:30:00',
      isAnnouncement: true
    },
    {
      id: '2',
      groupId: '1',
      author: 'Bob',
      content: 'Thanks for the explanation on custom hooks!',
      timestamp: '2024-01-16T19:45:00',
      isAnnouncement: false
    }
  ]);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [qrCodeData, setQrCodeData] = useState('');
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    difficulty: 'Intermediate' as const,
    schedule: '',
    maxMembers: 4
  });

  const createGroup = () => {
    if (!newGroup.name || !newGroup.description || !newGroup.subject) {
      return;
    }

    const group: StudyGroup = {
      id: Date.now().toString(),
      ...newGroup,
      members: ['You'],
      nextMeeting: '',
      progress: 0,
      isActive: true,
      createdBy: 'You',
      createdAt: new Date().toISOString()
    };

    setStudyGroups(prev => [...prev, group]);
    setCreateModalVisible(false);
    setNewGroup({
      name: '',
      description: '',
      subject: '',
      difficulty: 'Intermediate',
      schedule: '',
      maxMembers: 4
    });
  };

  const joinGroup = (groupId: string) => {
    setStudyGroups(prev => prev.map(group => 
      group.id === groupId && group.members.length < group.maxMembers
        ? { ...group, members: [...group.members, 'You'] }
        : group
    ));
    setJoinModalVisible(false);
    setSelectedGroup(null);
  };

  const leaveGroup = (groupId: string) => {
    setStudyGroups(prev => prev.map(group => 
      group.id === groupId
        ? { ...group, members: group.members.filter(member => member !== 'You') }
        : group
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'green';
      case 'Intermediate': return 'blue';
      case 'Advanced': return 'red';
      default: return 'default';
    }
  };

  const getGroupMessages = (groupId: string) => {
    return messages.filter(msg => msg.groupId === groupId);
  };

  const getGroupSessions = (groupId: string) => {
    return sessions.filter(session => session.groupId === groupId);
  };

  const generateGroupQRCode = (group: StudyGroup) => {
    const joinData = {
      type: 'study-group',
      groupId: group.id,
      groupName: group.name,
      subject: group.subject,
      difficulty: group.difficulty,
      timestamp: Date.now()
    };
    
    const qrData = btoa(JSON.stringify(joinData));
    setQrCodeData(qrData);
    setSelectedGroup(group);
    setQrModalVisible(true);
  };

  const copyJoinLink = (group: StudyGroup) => {
    const joinLink = `${window.location.origin}/join-group/${group.id}`;
    navigator.clipboard.writeText(joinLink).then(() => {
      message.success('Join link copied to clipboard!');
    });
  };

  const shareGroup = (group: StudyGroup) => {
    const shareData = {
      title: group.name,
      text: `Join my study group: ${group.name} - ${group.description}`,
      url: `${window.location.origin}/join-group/${group.id}`
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      copyJoinLink(group);
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Study Groups</Title>
      
      <Space style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          Create Group
        </Button>
        <Button icon={<TeamOutlined />} onClick={() => setJoinModalVisible(true)}>
          Browse Groups
        </Button>
      </Space>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <List
            dataSource={studyGroups}
            renderItem={(group) => (
              <List.Item>
                <Card
                  size="small"
                  title={
                    <Space>
                      <TeamOutlined />
                      <Text strong>{group.name}</Text>
                      {group.isActive && <Badge status="processing" />}
                    </Space>
                  }
                  extra={
                    <Space>
                      {group.members.includes('You') ? (
                        <>
                          <Button 
                            size="small" 
                            icon={<QrcodeOutlined />}
                            onClick={() => generateGroupQRCode(group)}
                          >
                            QR Code
                          </Button>
                          <Button 
                            size="small" 
                            icon={<ShareAltOutlined />}
                            onClick={() => shareGroup(group)}
                          >
                            Share
                          </Button>
                          <Button size="small" onClick={() => leaveGroup(group.id)}>
                            Leave
                          </Button>
                        </>
                      ) : (
                        <Button size="small" type="primary" onClick={() => {
                          setSelectedGroup(group);
                          setJoinModalVisible(true);
                        }}>
                          Join
                        </Button>
                      )}
                    </Space>
                  }
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">{group.description}</Text>
                        
                        <Space wrap>
                          <Tag color="blue">{group.subject}</Tag>
                          <Tag color={getDifficultyColor(group.difficulty)}>
                            {group.difficulty}
                          </Tag>
                        </Space>

                        <div>
                          <Text strong>Members: </Text>
                          <Text>{group.members.length}/{group.maxMembers}</Text>
                          <Progress 
                            percent={(group.members.length / group.maxMembers) * 100} 
                            size="small" 
                            style={{ marginTop: 4 }}
                          />
                        </div>

                        <div>
                          <Text strong>Schedule: </Text>
                          <Text>{group.schedule}</Text>
                        </div>

                        {group.nextMeeting && (
                          <div>
                            <Text strong>Next Meeting: </Text>
                            <Text>{new Date(group.nextMeeting).toLocaleString()}</Text>
                          </div>
                        )}
                      </Space>
                    </Col>

                    <Col xs={24} md={12}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>Progress: </Text>
                          <Progress percent={group.progress} />
                        </div>

                        <Avatar.Group>
                          {group.members.map((_, index) => (
                            <Avatar key={index} icon={<UserOutlined />} />
                          ))}
                        </Avatar.Group>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        </Col>

        <Col xs={24} lg={8}>
          {selectedGroup && (
            <Card
              title={`${selectedGroup.name} Details`}
              extra={
                <Button 
                  type="text" 
                  icon={<SettingOutlined />}
                  onClick={() => setSelectedGroup(null)}
                />
              }
            >
              <Tabs defaultActiveKey="messages">
                <TabPane tab="Messages" key="messages">
                  <List
                    dataSource={getGroupMessages(selectedGroup.id)}
                    renderItem={(message) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={
                            <Space>
                              <Text strong>{message.author}</Text>
                              {message.isAnnouncement && <Tag color="red">Announcement</Tag>}
                            </Space>
                          }
                          description={
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Text>{message.content}</Text>
                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                {new Date(message.timestamp).toLocaleString()}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>

                <TabPane tab="Sessions" key="sessions">
                  <List
                    dataSource={getGroupSessions(selectedGroup.id)}
                    renderItem={(session) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<CalendarOutlined />} />}
                          title={session.title}
                          description={
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Text>{new Date(session.date).toLocaleString()}</Text>
                              <Text type="secondary">
                                Duration: {session.duration} minutes • {session.attendees.length} attendees
                              </Text>
                              {session.recordingUrl && (
                                <Button size="small" icon={<ShareAltOutlined />}>
                                  Watch Recording
                                </Button>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>
              </Tabs>
            </Card>
          )}
        </Col>
      </Row>

      {/* Create Group Modal */}
      <Modal
        title="Create Study Group"
        open={createModalVisible}
        onOk={createGroup}
        onCancel={() => setCreateModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text>Group Name:</Text>
            <Input
              value={newGroup.name}
              onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
            />
          </div>

          <div>
            <Text>Description:</Text>
            <TextArea
              value={newGroup.description}
              onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your study group"
              rows={3}
            />
          </div>

          <div>
            <Text>Subject:</Text>
            <Select
              value={newGroup.subject}
              onChange={(value) => setNewGroup(prev => ({ ...prev, subject: value }))}
              style={{ width: '100%' }}
              placeholder="Select subject"
            >
              <Option value="Mathematics">Mathematics</Option>
              <Option value="Science">Science</Option>
              <Option value="Programming">Programming</Option>
              <Option value="Languages">Languages</Option>
              <Option value="History">History</Option>
              <Option value="Other">Other</Option>
            </Select>
          </div>

          <div>
            <Text>Difficulty Level:</Text>
            <Select
              value={newGroup.difficulty}
              onChange={(value) => setNewGroup(prev => ({ ...prev, difficulty: value }))}
              style={{ width: '100%' }}
            >
              <Option value="Beginner">Beginner</Option>
              <Option value="Intermediate">Intermediate</Option>
              <Option value="Advanced">Advanced</Option>
            </Select>
          </div>

          <div>
            <Text>Schedule:</Text>
            <Input
              value={newGroup.schedule}
              onChange={(e) => setNewGroup(prev => ({ ...prev, schedule: e.target.value }))}
              placeholder="e.g., Tuesdays 6PM"
            />
          </div>

          <div>
            <Text>Max Members:</Text>
            <Select
              value={newGroup.maxMembers}
              onChange={(value) => setNewGroup(prev => ({ ...prev, maxMembers: value }))}
              style={{ width: '100%' }}
            >
              <Option value={2}>2 members</Option>
              <Option value={4}>4 members</Option>
              <Option value={6}>6 members</Option>
              <Option value={8}>8 members</Option>
              <Option value={10}>10 members</Option>
            </Select>
          </div>
        </Space>
      </Modal>

      {/* Join Group Modal */}
      <Modal
        title="Join Study Group"
        open={joinModalVisible}
        onCancel={() => setJoinModalVisible(false)}
        footer={null}
      >
        <List
          dataSource={studyGroups.filter(group => !group.members.includes('You'))}
          renderItem={(group) => (
            <List.Item
              actions={[
                <Button 
                  size="small"
                  icon={<QrcodeOutlined />}
                  onClick={() => generateGroupQRCode(group)}
                >
                  QR Code
                </Button>,
                <Button 
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyJoinLink(group)}
                >
                  Copy Link
                </Button>,
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => joinGroup(group.id)}
                  disabled={group.members.length >= group.maxMembers}
                >
                  Join
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<TeamOutlined />} />}
                title={group.name}
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text type="secondary">{group.description}</Text>
                    <Space wrap>
                      <Tag color="blue">{group.subject}</Tag>
                      <Tag color={getDifficultyColor(group.difficulty)}>
                        {group.difficulty}
                      </Tag>
                      <Tag>{group.members.length}/{group.maxMembers} members</Tag>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title={`Join ${selectedGroup?.name} via QR Code`}
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button 
            key="copy" 
            icon={<CopyOutlined />}
            onClick={() => copyJoinLink(selectedGroup!)}
          >
            Copy Join Link
          </Button>,
          <Button 
            key="share" 
            icon={<ShareAltOutlined />}
            onClick={() => shareGroup(selectedGroup!)}
          >
            Share
          </Button>,
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            Close
          </Button>
        ]}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large" align="center">
          <div>
            <Text strong>Scan to Join Study Group</Text>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <QRCodeSVG 
                value={qrCodeData} 
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <MobileOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Use your mobile device to scan this QR code
              </Text>
            </div>
          </div>

          {selectedGroup && (
            <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong>{selectedGroup.name}</Text>
                <Text type="secondary">{selectedGroup.description}</Text>
                <Space wrap>
                  <Tag color="blue">{selectedGroup.subject}</Tag>
                  <Tag color={getDifficultyColor(selectedGroup.difficulty)}>
                    {selectedGroup.difficulty}
                  </Tag>
                  <Tag>{selectedGroup.members.length}/{selectedGroup.maxMembers} members</Tag>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Schedule: {selectedGroup.schedule}
                </Text>
              </Space>
            </div>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default StudyGroups;
