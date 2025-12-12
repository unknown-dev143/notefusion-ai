import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Timeline, 
  Modal, 
  List, 
  Tag, 
  Tooltip, 
  Divider,
  Row,
  Col,
  Alert,
  Input,
  Select,
  Badge,
  message
} from 'antd';
import { 
  GitlabOutlined, 
  BranchesOutlined, 
  RollbackOutlined, 
  SwapOutlined,
  TagOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface DocumentVersion {
  id: string;
  version: string;
  author: string;
  timestamp: number;
  message: string;
  content: string;
  changes: {
    additions: number;
    deletions: number;
    modifications: number;
  };
  tags: string[];
  branch: string;
  parentVersion?: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    sections: number;
  };
}

interface Branch {
  name: string;
  latestVersion: string;
  author: string;
  createdAt: number;
  isActive: boolean;
  description?: string;
}

interface DiffResult {
  oldVersion: DocumentVersion;
  newVersion: DocumentVersion;
  changes: Array<{
    type: 'added' | 'removed' | 'unchanged';
    oldLine?: string;
    newLine?: string;
    lineNumber: number;
  }>;
  summary: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

const VersionControl: React.FC = () => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('main');
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [compareVersionsState, setCompareVersionsState] = useState<[DocumentVersion | undefined, DocumentVersion | undefined]>([undefined, undefined]);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [versionMessage, setVersionMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [tagName, setTagName] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);

  // Load versions and branches
  useEffect(() => {
    loadVersionHistory();
    loadBranches();
  }, []);

  const loadVersionHistory = async () => {
    try {
      // In a real app, fetch from API
      const savedVersions = localStorage.getItem('documentVersions');
      if (savedVersions) {
        setVersions(JSON.parse(savedVersions));
      } else {
        // Initialize with a base version
        const baseVersion: DocumentVersion = {
          id: 'v1',
          version: '1.0.0',
          author: 'System',
          timestamp: Date.now() - 86400000, // 1 day ago
          message: 'Initial version',
          content: 'This is the initial content of the document.',
          changes: { additions: 0, deletions: 0, modifications: 0 },
          tags: ['initial'],
          branch: 'main',
          metadata: { wordCount: 9, characterCount: 46, sections: 1 }
        };
        setVersions([baseVersion]);
        localStorage.setItem('documentVersions', JSON.stringify([baseVersion]));
      }
    } catch (error) {
      console.error('Failed to load version history:', error);
    }
  };

  const loadBranches = async () => {
    try {
      const savedBranches = localStorage.getItem('documentBranches');
      if (savedBranches) {
        setBranches(JSON.parse(savedBranches));
      } else {
        const mainBranch: Branch = {
          name: 'main',
          latestVersion: 'v1',
          author: 'System',
          createdAt: Date.now() - 86400000,
          isActive: true,
          description: 'Main development branch'
        };
        setBranches([mainBranch]);
        localStorage.setItem('documentBranches', JSON.stringify([mainBranch]));
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const createNewVersion = async (content: string, changes: { additions: number; deletions: number; modifications: number }) => {
    if (!versionMessage.trim()) {
      message.error('Please enter a version message');
      return;
    }

    const lastVersion = versions.filter(v => v.branch === currentBranch)[0];
    const newVersionNumber = generateVersionNumber(lastVersion?.version);
    
    const newVersion: DocumentVersion = {
      id: `v${Date.now()}`,
      version: newVersionNumber,
      author: 'Current User', // In real app, get from auth context
      timestamp: Date.now(),
      message: versionMessage,
      content,
      changes,
      tags: [],
      branch: currentBranch,
      parentVersion: lastVersion?.id,
      metadata: {
        wordCount: content.split(/\s+/).length,
        characterCount: content.length,
        sections: content.split(/\n\n+/).length
      }
    };

    const updatedVersions = [newVersion, ...versions];
    setVersions(updatedVersions);
    localStorage.setItem('documentVersions', JSON.stringify(updatedVersions));

    // Update branch
    const updatedBranches = branches.map(branch => 
      branch.name === currentBranch 
        ? { ...branch, latestVersion: newVersion.version }
        : branch
    );
    setBranches(updatedBranches);
    localStorage.setItem('documentBranches', JSON.stringify(updatedBranches));

    setVersionMessage('');
    setShowVersionModal(false);
    message.success('Version created successfully');
  };

  const generateVersionNumber = (lastVersion?: string): string => {
    if (!lastVersion) return '1.0.0';
    
    const parts = lastVersion.split('.').map(Number);
    parts[2]++; // Increment patch version
    return parts.join('.');
  };

  const createBranch = async () => {
    if (!newBranchName.trim()) {
      message.error('Please enter a branch name');
      return;
    }

    if (branches.find(b => b.name === newBranchName)) {
      message.error('Branch already exists');
      return;
    }

    const currentVersions = versions.filter(v => v.branch === currentBranch);
    const latestVersion = currentVersions[0];

    const newBranch: Branch = {
      name: newBranchName,
      latestVersion: latestVersion?.version || '1.0.0',
      author: 'Current User',
      createdAt: Date.now(),
      isActive: false,
      description: `Branch created from ${currentBranch}`
    };

    const updatedBranches = [...branches, newBranch];
    setBranches(updatedBranches);
    localStorage.setItem('documentBranches', JSON.stringify(updatedBranches));

    setNewBranchName('');
    setShowBranchModal(false);
    message.success(`Branch "${newBranchName}" created successfully`);
  };

  const switchBranch = (branchName: string) => {
    setCurrentBranch(branchName);
    
    // Update active status
    const updatedBranches = branches.map(branch => ({
      ...branch,
      isActive: branch.name === branchName
    }));
    setBranches(updatedBranches);
    localStorage.setItem('documentBranches', JSON.stringify(updatedBranches));
    
    message.success(`Switched to branch "${branchName}"`);
  };

  const handleCompareVersions = useCallback((version1: DocumentVersion, version2: DocumentVersion) => {
    // Simple diff implementation without external library
    const lines1 = version1.content.split('\n');
    const lines2 = version2.content.split('\n');
    
    const changes = [];
    const maxLength = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLength; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];
      
      if (line1 === undefined) {
        changes.push({
          type: 'added' as const,
          newLine: line2,
          lineNumber: i
        });
      } else if (line2 === undefined) {
        changes.push({
          type: 'removed' as const,
          oldLine: line1,
          lineNumber: i
        });
      } else if (line1 !== line2) {
        changes.push({
          type: 'unchanged' as const,
          lineNumber: i
        });
      }
    }
    
    const summary = {
      additions: lines2.length - Math.min(lines1.length, lines2.length),
      deletions: lines1.length - Math.min(lines1.length, lines2.length),
      modifications: 0
    };

    setDiffResult({
      oldVersion: version1,
      newVersion: version2,
      changes,
      summary
    });
    setShowDiffModal(true);
  }, []);

  const revertToVersion = async (version: DocumentVersion) => {
    Modal.confirm({
      title: 'Revert to Version',
      content: `Are you sure you want to revert to version ${version.version}? This will create a new version with the old content.`,
      onOk: async () => {
        await createNewVersion(version.content, {
          additions: 0,
          deletions: 0,
          modifications: 0
        });
      }
    });
  };

  const mergeBranch = async (sourceBranch: string, targetBranch: string) => {
    Modal.confirm({
      title: 'Merge Branch',
      content: `Are you sure you want to merge "${sourceBranch}" into "${targetBranch}"?`,
      onOk: async () => {
        // In a real app, handle merge conflicts and create merge commit
        message.success(`Branch "${sourceBranch}" merged into "${targetBranch}"`);
      }
    });
  };

  const addTag = async (version: DocumentVersion) => {
    if (!tagName.trim()) {
      message.error('Please enter a tag name');
      return;
    }

    const updatedVersions = versions.map(v => 
      v.id === version.id 
        ? { ...v, tags: [...v.tags, tagName] }
        : v
    );

    setVersions(updatedVersions);
    localStorage.setItem('documentVersions', JSON.stringify(updatedVersions));

    setTagName('');
    setShowTagModal(false);
    message.success(`Tag "${tagName}" added to version ${version.version}`);
  };

  const exportVersion = (version: DocumentVersion) => {
    const blob = new Blob([version.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-v${version.version}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getVersionsForBranch = (branchName: string): DocumentVersion[] => {
    return versions.filter(v => v.branch === branchName).sort((a, b) => b.timestamp - a.timestamp);
  };

  const currentVersions = getVersionsForBranch(currentBranch);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Branch Management */}
        <Col span={24}>
          <Card 
            title="Branch Management" 
            extra={
              <Space>
                <Button 
                  icon={<BranchesOutlined />} 
                  onClick={() => setShowBranchModal(true)}
                >
                  New Branch
                </Button>
                <Select
                  value={currentBranch}
                  onChange={switchBranch}
                  style={{ width: 200 }}
                >
                  {branches.map(branch => (
                    <Option key={branch.name} value={branch.name}>
                      <Space>
                        <Badge status={branch.isActive ? 'processing' : 'default'} />
                        {branch.name}
                        {branch.isActive && <Tag color="green">Active</Tag>}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Space>
            }
          >
            <Row gutter={16}>
              {branches.map(branch => (
                <Col span={8} key={branch.name}>
                  <Card 
                    size="small" 
                    hoverable
                    style={{ 
                      border: branch.isActive ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      marginBottom: '8px'
                    }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={5} style={{ margin: 0 }}>{branch.name}</Title>
                        {branch.isActive && <Tag color="blue">Active</Tag>}
                      </div>
                      <Text type="secondary">{branch.description}</Text>
                      <div>
                        <Text type="secondary">
                          Latest: {branch.latestVersion} • 
                          Created: {dayjs(branch.createdAt).format('MMM DD, YYYY')}
                        </Text>
                      </div>
                      <div>
                        <Button 
                          size="small" 
                          type="link" 
                          onClick={() => switchBranch(branch.name)}
                          disabled={branch.isActive}
                        >
                          Switch
                        </Button>
                        {branch.name !== 'main' && (
                          <Button 
                            size="small" 
                            type="link" 
                            onClick={() => mergeBranch(branch.name, 'main')}
                          >
                            Merge to main
                          </Button>
                        )}
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Version History */}
        <Col span={16}>
          <Card 
            title={`Version History - ${currentBranch}`}
            extra={
              <Space>
                <Button 
                  icon={<SwapOutlined />} 
                  onClick={() => setShowCompareModal(true)}
                  disabled={compareVersionsState.filter(Boolean).length < 2}
                >
                  Compare Selected
                </Button>
                <Button 
                  icon={<TagOutlined />} 
                  onClick={() => setShowVersionModal(true)}
                >
                  Create Version
                </Button>
              </Space>
            }
          >
            <Timeline>
              {currentVersions.map((version, index) => (
                <Timeline.Item
                  key={version.id}
                  color={index === 0 ? 'green' : 'blue'}
                  dot={
                    <Tooltip title={version.message}>
                      {index === 0 ? <TagOutlined /> : <GitlabOutlined />}
                    </Tooltip>
                  }
                >
                  <Card 
                    size="small" 
                    hoverable
                    style={{ marginBottom: '8px' }}
                    actions={[
                      <Tooltip title="View Details">
                        <Button 
                          size="small" 
                          icon={<EyeOutlined />}
                          onClick={() => setSelectedVersion(version)}
                        />
                      </Tooltip>,
                      <Tooltip title="Compare">
                        <Button 
                          size="small" 
                          icon={<SwapOutlined />}
                          onClick={() => {
                            const newCompare = [...compareVersionsState];
                            if (newCompare[0]?.id === version.id) {
                              newCompare[0] = undefined;
                            } else if (newCompare[1]?.id === version.id) {
                              newCompare[1] = undefined;
                            } else if (!newCompare[0]) {
                              newCompare[0] = version;
                            } else if (!newCompare[1]) {
                              newCompare[1] = version;
                            }
                            setCompareVersionsState(newCompare as [DocumentVersion | undefined, DocumentVersion | undefined]);
                          }}
                          type={compareVersionsState.some(v => v?.id === version.id) ? 'primary' : 'default'}
                        />
                      </Tooltip>,
                      <Tooltip title="Revert">
                        <Button 
                          size="small" 
                          icon={<RollbackOutlined />}
                          onClick={() => revertToVersion(version)}
                          disabled={index === 0}
                        />
                      </Tooltip>,
                      <Tooltip title="Export">
                        <Button 
                          size="small" 
                          icon={<DownloadOutlined />}
                          onClick={() => exportVersion(version)}
                        />
                      </Tooltip>,
                      <Tooltip title="Add Tag">
                        <Button 
                          size="small" 
                          icon={<TagOutlined />}
                          onClick={() => {
                            setSelectedVersion(version);
                            setShowTagModal(true);
                          }}
                        />
                      </Tooltip>
                    ].filter(Boolean)}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Title level={5} style={{ margin: 0 }}>
                            Version {version.version}
                          </Title>
                          <Text type="secondary">{version.message}</Text>
                        </div>
                        <Space>
                          {version.tags.map(tag => (
                            <Tag key={tag} color="blue">{tag}</Tag>
                          ))}
                        </Space>
                      </div>
                      <div>
                        <Space>
                          <Text type="secondary">
                            <UserOutlined /> {version.author}
                          </Text>
                          <Text type="secondary">
                            <ClockCircleOutlined /> {dayjs(version.timestamp).format('MMM DD, YYYY HH:mm')}
                          </Text>
                        </Space>
                      </div>
                      <div>
                        <Space>
                          <Tag color="green">+{version.changes.additions}</Tag>
                          <Tag color="red">-{version.changes.deletions}</Tag>
                          <Tag color="orange">~{version.changes.modifications}</Tag>
                          <Text type="secondary">
                            {version.metadata.wordCount} words • {version.metadata.sections} sections
                          </Text>
                        </Space>
                      </div>
                    </Space>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* Version Details */}
        <Col span={8}>
          <Card 
            title="Version Details"
          >
            {selectedVersion ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Title level={5}>Version {selectedVersion.version}</Title>
                  <Text>{selectedVersion.message}</Text>
                </div>
                <Divider />
                <div>
                  <Text strong>Author:</Text>
                  <Text>{selectedVersion.author}</Text>
                </div>
                <div>
                  <Text strong>Created:</Text>
                  <Text>{dayjs(selectedVersion.timestamp).format('MMM DD, YYYY HH:mm:ss')}</Text>
                </div>
                <div>
                  <Text strong>Branch:</Text>
                  <Tag color="blue">{selectedVersion.branch}</Tag>
                </div>
                <div>
                  <Text strong>Tags:</Text>
                  <div>
                    {selectedVersion.tags.map(tag => (
                      <Tag key={tag} color="green">{tag}</Tag>
                    ))}
                  </div>
                </div>
                <Divider />
                <div>
                  <Text strong>Statistics:</Text>
                  <List size="small">
                    <List.Item>
                      <Text>Words: {selectedVersion.metadata.wordCount}</Text>
                    </List.Item>
                    <List.Item>
                      <Text>Characters: {selectedVersion.metadata.characterCount}</Text>
                    </List.Item>
                    <List.Item>
                      <Text>Sections: {selectedVersion.metadata.sections}</Text>
                    </List.Item>
                  </List>
                </div>
                <Divider />
                <div>
                  <Text strong>Changes:</Text>
                  <Space>
                    <Tag color="green">+{selectedVersion.changes.additions}</Tag>
                    <Tag color="red">-{selectedVersion.changes.deletions}</Tag>
                    <Tag color="orange">~{selectedVersion.changes.modifications}</Tag>
                  </Space>
                </div>
                <Divider />
                <div>
                  <Text strong>Content Preview:</Text>
                  <Paragraph 
                    ellipsis={{ rows: 4, expandable: true }}
                    style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {selectedVersion.content}
                  </Paragraph>
                </div>
              </Space>
            ) : (
              <Text type="secondary">Select a version to view details</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Create Version Modal */}
      <Modal
        title="Create New Version"
        open={showVersionModal}
        onCancel={() => setShowVersionModal(false)}
        onOk={() => {
          // In a real app, get current content from editor
          const content = "Sample content for new version";
          createNewVersion(content, { additions: 10, deletions: 5, modifications: 3 });
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Version Message:</Text>
            <Input.TextArea
              rows={3}
              value={versionMessage}
              onChange={(e) => setVersionMessage(e.target.value)}
              placeholder="Describe the changes in this version..."
            />
          </div>
          <Alert
            message="Version Information"
            description={`New version will be created on branch "${currentBranch}" and will become the latest version.`}
            type="info"
            showIcon
          />
        </Space>
      </Modal>

      {/* Create Branch Modal */}
      <Modal
        title="Create New Branch"
        open={showBranchModal}
        onCancel={() => setShowBranchModal(false)}
        onOk={createBranch}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Branch Name:</Text>
            <Input
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Enter branch name..."
            />
          </div>
          <Alert
            message="Branch Information"
            description={`New branch will be created from "${currentBranch}" with all current history.`}
            type="info"
            showIcon
          />
        </Space>
      </Modal>

      {/* Add Tag Modal */}
      <Modal
        title="Add Tag to Version"
        open={showTagModal}
        onCancel={() => setShowTagModal(false)}
        onOk={() => selectedVersion && addTag(selectedVersion)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Version:</Text>
            <Text>{selectedVersion?.version}</Text>
          </div>
          <div>
            <Text strong>Tag Name:</Text>
            <Input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name..."
            />
          </div>
        </Space>
      </Modal>

      {/* Diff Modal */}
      <Modal
        title="Version Comparison"
        open={showDiffModal}
        onCancel={() => setShowDiffModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDiffModal(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {diffResult && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Comparing: </Text>
              <Text>{diffResult.oldVersion.version} → {diffResult.newVersion.version}</Text>
            </div>
            <div>
              <Space>
                <Tag color="green">+{diffResult.summary.additions} additions</Tag>
                <Tag color="red">-{diffResult.summary.deletions} deletions</Tag>
                <Tag color="orange">~{diffResult.summary.modifications} modifications</Tag>
              </Space>
            </div>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px',
              maxHeight: '400px',
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              {diffResult.changes.map((change, index) => (
                <div key={index} style={{
                  backgroundColor: change.type === 'added' ? '#f6ffed' : 
                                 change.type === 'removed' ? '#fff2f0' : 'transparent',
                  padding: '2px 0'
                }}>
                  {change.newLine && <span style={{ color: '#52c41a' }}>+{change.newLine}</span>}
                  {change.oldLine && <span style={{ color: '#ff4d4f' }}>-{change.oldLine}</span>}
                  {!change.newLine && !change.oldLine && <span>{change.type === 'unchanged' ? '  ' : ''}</span>}
                </div>
              ))}
            </div>
          </Space>
        )}
      </Modal>

      {/* Compare Versions Modal */}
      <Modal
        title="Compare Versions"
        open={showCompareModal}
        onCancel={() => setShowCompareModal(false)}
        onOk={() => {
          if (compareVersionsState[0] && compareVersionsState[1]) {
            handleCompareVersions(compareVersionsState[0], compareVersionsState[1]);
          }
        }}
        okButtonProps={{ disabled: compareVersionsState.filter(Boolean).length < 2 }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Select two versions to compare:</Text>
          </div>
          <div>
            <Text>Version 1: </Text>
            <Select
              style={{ width: 200 }}
              placeholder="Select first version"
              value={compareVersionsState[0]?.id}
              onChange={(value) => {
                const version = versions.find(v => v.id === value);
                setCompareVersionsState([version || undefined, compareVersionsState[1]]);
              }}
            >
              {currentVersions.map(version => (
                <Option key={version.id} value={version.id}>
                  {version.version} - {version.message}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Text>Version 2: </Text>
            <Select
              style={{ width: 200 }}
              placeholder="Select second version"
              value={compareVersionsState[1]?.id}
              onChange={(value) => {
                const version = versions.find(v => v.id === value);
                setCompareVersionsState([compareVersionsState[0], version || undefined]);
              }}
            >
              {currentVersions.map(version => (
                <Option key={version.id} value={version.id}>
                  {version.version} - {version.message}
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default VersionControl;
