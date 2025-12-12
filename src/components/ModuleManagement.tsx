import React, { useState } from 'react';
import { Card, Typography, Button, Space, Input, Modal, message, List, Tag, Tabs, Progress, Tree } from 'antd';
import { 
  BookOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FolderOutlined,
  FileOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  contentCount: number;
  completedContent: number;
  estimatedHours: number;
  prerequisites: string[];
  tags: string[];
  status: 'not-started' | 'in-progress' | 'completed';
}

interface Module {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  estimatedHours: number;
  completedHours: number;
  chapters: Chapter[];
  tags: string[];
  status: 'active' | 'completed' | 'archived';
  startDate: string;
  endDate: string;
  instructor: string;
}

const ModuleManagement: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      code: 'CS301',
      title: 'Machine Learning Fundamentals',
      description: 'Introduction to machine learning concepts, algorithms, and applications',
      credits: 3,
      estimatedHours: 120,
      completedHours: 45,
      chapters: [
        {
          id: '1',
          title: 'Introduction to Machine Learning',
          description: 'Basic concepts and terminology',
          order: 1,
          contentCount: 15,
          completedContent: 12,
          estimatedHours: 20,
          prerequisites: [],
          tags: ['basics', 'introduction'],
          status: 'in-progress'
        },
        {
          id: '2',
          title: 'Supervised Learning',
          description: 'Classification and regression algorithms',
          order: 2,
          contentCount: 25,
          completedContent: 8,
          estimatedHours: 30,
          prerequisites: ['1'],
          tags: ['supervised', 'algorithms'],
          status: 'in-progress'
        },
        {
          id: '3',
          title: 'Unsupervised Learning',
          description: 'Clustering and dimensionality reduction',
          order: 3,
          contentCount: 20,
          completedContent: 0,
          estimatedHours: 25,
          prerequisites: ['1'],
          tags: ['unsupervised', 'clustering'],
          status: 'not-started'
        }
      ],
      tags: ['machine-learning', 'ai', 'fundamentals'],
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 86400000).toISOString(),
      instructor: 'Professor Smith'
    },
    {
      id: '2',
      code: 'CS302',
      title: 'Deep Learning Architectures',
      description: 'Advanced neural networks and deep learning techniques',
      credits: 4,
      estimatedHours: 150,
      completedHours: 0,
      chapters: [
        {
          id: '1',
          title: 'Neural Network Basics',
          description: 'Introduction to neural networks',
          order: 1,
          contentCount: 18,
          completedContent: 0,
          estimatedHours: 25,
          prerequisites: [],
          tags: ['neural-networks', 'basics'],
          status: 'not-started'
        }
      ],
      tags: ['deep-learning', 'neural-networks', 'advanced'],
      status: 'active',
      startDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 120 * 86400000).toISOString(),
      instructor: 'Dr. Johnson'
    }
  ]);

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [createModuleModalVisible, setCreateModuleModalVisible] = useState(false);
  const [createChapterModalVisible, setCreateChapterModalVisible] = useState(false);
  const [editModuleModalVisible, setEditModuleModalVisible] = useState(false);
  const [editChapterModalVisible, setEditChapterModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'modules' | 'chapters' | 'progress'>('modules');

  const [moduleForm, setModuleForm] = useState({
    code: '',
    title: '',
    description: '',
    credits: 3,
    estimatedHours: 120,
    tags: [] as string[],
    instructor: '',
    startDate: null as any,
    endDate: null as any
  });

  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
    order: 1,
    estimatedHours: 20,
    prerequisites: [] as string[],
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');

  const statusColors = {
    'not-started': 'default',
    'in-progress': 'blue',
    'completed': 'green',
    'active': 'blue',
    'archived': 'default'
  };

  const createModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      code: moduleForm.code,
      title: moduleForm.title,
      description: moduleForm.description,
      credits: moduleForm.credits,
      estimatedHours: moduleForm.estimatedHours,
      completedHours: 0,
      chapters: [],
      tags: moduleForm.tags,
      status: 'active',
      startDate: moduleForm.startDate?.toISOString() || new Date().toISOString(),
      endDate: moduleForm.endDate?.toISOString() || new Date(Date.now() + 90 * 86400000).toISOString(),
      instructor: moduleForm.instructor
    };

    setModules(prev => [newModule, ...prev]);
    setCreateModuleModalVisible(false);
    resetModuleForm();
    message.success('Module created successfully');
  };

  const updateModule = () => {
    if (!selectedModule) return;

    const updatedModule = {
      ...selectedModule,
      code: moduleForm.code,
      title: moduleForm.title,
      description: moduleForm.description,
      credits: moduleForm.credits,
      estimatedHours: moduleForm.estimatedHours,
      tags: moduleForm.tags,
      instructor: moduleForm.instructor,
      startDate: moduleForm.startDate?.toISOString() || selectedModule.startDate,
      endDate: moduleForm.endDate?.toISOString() || selectedModule.endDate
    };

    setModules(prev => prev.map(module => 
      module.id === selectedModule.id ? updatedModule : module
    ));

    setSelectedModule(updatedModule);
    setEditModuleModalVisible(false);
    resetModuleForm();
    message.success('Module updated successfully');
  };

  const deleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(module => module.id !== moduleId));
    if (selectedModule?.id === moduleId) {
      setSelectedModule(null);
    }
    message.success('Module deleted');
  };

  const createChapter = () => {
    if (!selectedModule) return;

    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: chapterForm.title,
      description: chapterForm.description,
      order: chapterForm.order,
      contentCount: 0,
      completedContent: 0,
      estimatedHours: chapterForm.estimatedHours,
      prerequisites: chapterForm.prerequisites,
      tags: chapterForm.tags,
      status: 'not-started'
    };

    const updatedModule = {
      ...selectedModule,
      chapters: [...selectedModule.chapters, newChapter].sort((a, b) => a.order - b.order)
    };

    setSelectedModule(updatedModule);
    setModules(prev => prev.map(module => 
      module.id === selectedModule.id ? updatedModule : module
    ));

    setCreateChapterModalVisible(false);
    resetChapterForm();
    message.success('Chapter created successfully');
  };

  const updateChapter = () => {
    if (!selectedModule || !selectedChapter) return;

    const updatedChapter = {
      ...selectedChapter,
      title: chapterForm.title,
      description: chapterForm.description,
      order: chapterForm.order,
      estimatedHours: chapterForm.estimatedHours,
      prerequisites: chapterForm.prerequisites,
      tags: chapterForm.tags
    };

    const updatedModule = {
      ...selectedModule,
      chapters: selectedModule.chapters.map(chapter => 
        chapter.id === selectedChapter.id ? updatedChapter : chapter
      ).sort((a, b) => a.order - b.order)
    };

    setSelectedModule(updatedModule);
    setModules(prev => prev.map(module => 
      module.id === selectedModule.id ? updatedModule : module
    ));

    setEditChapterModalVisible(false);
    setSelectedChapter(null);
    resetChapterForm();
    message.success('Chapter updated successfully');
  };

  const deleteChapter = (chapterId: string) => {
    if (!selectedModule) return;

    const updatedModule = {
      ...selectedModule,
      chapters: selectedModule.chapters.filter(chapter => chapter.id !== chapterId)
    };

    setSelectedModule(updatedModule);
    setModules(prev => prev.map(module => 
      module.id === selectedModule.id ? updatedModule : module
    ));

    message.success('Chapter deleted');
  };

  
  const startEditModule = (module: Module) => {
    setSelectedModule(module);
    setModuleForm({
      code: module.code,
      title: module.title,
      description: module.description,
      credits: module.credits,
      estimatedHours: module.estimatedHours,
      tags: module.tags,
      instructor: module.instructor,
      startDate: null,
      endDate: null
    });
    setEditModuleModalVisible(true);
  };

  const startEditChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setChapterForm({
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      estimatedHours: chapter.estimatedHours,
      prerequisites: chapter.prerequisites,
      tags: chapter.tags
    });
    setEditChapterModalVisible(true);
  };

  const resetModuleForm = () => {
    setModuleForm({
      code: '',
      title: '',
      description: '',
      credits: 3,
      estimatedHours: 120,
      tags: [],
      instructor: '',
      startDate: null,
      endDate: null
    });
    setNewTag('');
  };

  const resetChapterForm = () => {
    setChapterForm({
      title: '',
      description: '',
      order: 1,
      estimatedHours: 20,
      prerequisites: [],
      tags: []
    });
    setNewTag('');
    setNewPrerequisite('');
  };

  const addTag = (isModule: boolean = true) => {
    const tagToAdd = isModule ? newTag : newTag;
    const form = isModule ? moduleForm : chapterForm;
    const setForm = isModule ? setModuleForm : setChapterForm;
    
    if (tagToAdd.trim() && !form.tags.includes(tagToAdd.trim())) {
      setForm((prev: any) => ({
        ...prev,
        tags: [...prev.tags, tagToAdd.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string, isModule: boolean = true) => {
    const setForm = isModule ? setModuleForm : setChapterForm;
    setForm((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((tag: any) => tag !== tagToRemove)
    }));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !chapterForm.prerequisites.includes(newPrerequisite.trim())) {
      setChapterForm(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prerequisiteToRemove: string) => {
    setChapterForm(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(prereq => prereq !== prerequisiteToRemove)
    }));
  };

  const generateTreeData = (module: Module): DataNode[] => {
    return module.chapters.map(chapter => ({
      title: (
        <Space>
          <span>{chapter.title}</span>
          <Tag color={statusColors[chapter.status]}>
            {chapter.status}
          </Tag>
          <Progress 
            percent={Math.round((chapter.completedContent / chapter.contentCount) * 100)} 
            size="small" 
            style={{ width: 60 }}
          />
        </Space>
      ),
      key: chapter.id,
      icon: <FileOutlined />,
      children: []
    }));
  };

  const overallProgress = modules.length > 0 
    ? Math.round((modules.reduce((total, module) => total + (module.completedHours / module.estimatedHours), 0) / modules.length) * 100)
    : 0;

  return (
    <Card title="Module & Chapter Management" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* View Mode Selector */}
        <Space>
          <Button 
            type={viewMode === 'modules' ? 'primary' : 'default'}
            icon={<BookOutlined />}
            onClick={() => setViewMode('modules')}
          >
            Modules
          </Button>
          <Button 
            type={viewMode === 'chapters' ? 'primary' : 'default'}
            icon={<FolderOutlined />}
            onClick={() => setViewMode('chapters')}
          >
            Chapters
          </Button>
          <Button 
            type={viewMode === 'progress' ? 'primary' : 'default'}
            icon={<TrophyOutlined />}
            onClick={() => setViewMode('progress')}
          >
            Progress
          </Button>
        </Space>

        {/* Overall Progress */}
        <Card size="small" title="Overall Progress">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Progress 
              percent={overallProgress}
              format={() => `${overallProgress}% Complete`}
            />
            <Text type="secondary">
              {modules.length} modules • {modules.reduce((total, module) => total + module.chapters.length, 0)} chapters
            </Text>
          </Space>
        </Card>

        {/* Modules View */}
        {viewMode === 'modules' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4}>Course Modules</Title>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModuleModalVisible(true)}
              >
                Create Module
              </Button>
            </div>
            
            <List
              dataSource={modules}
              renderItem={(module) => (
                <List.Item
                  actions={[
                    <Button 
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => setSelectedModule(module)}
                    >
                      View
                    </Button>,
                    <Button 
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => startEditModule(module)}
                    >
                      Edit
                    </Button>,
                    <Button 
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteModule(module.id)}
                    >
                      Delete
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<BookOutlined style={{ fontSize: '24px' }} />}
                    title={
                      <Space>
                        {module.code}: {module.title}
                        <Tag color={statusColors[module.status]}>{module.status}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text>{module.description}</Text>
                        <Space>
                          <Text strong>{module.credits} credits</Text>
                          <Text>•</Text>
                          <Text>{module.chapters.length} chapters</Text>
                          <Text>•</Text>
                          <Text>Instructor: {module.instructor}</Text>
                        </Space>
                        <Space>
                          <ClockCircleOutlined />
                          <Text>{module.completedHours}h / {module.estimatedHours}h</Text>
                          <Progress 
                            percent={Math.round((module.completedHours / module.estimatedHours) * 100)} 
                            size="small" 
                            style={{ width: 100 }}
                          />
                        </Space>
                        <Space wrap>
                          {module.tags.map((tag, index) => (
                            <Tag key={index}>{tag}</Tag>
                          ))}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {/* Chapters View */}
        {viewMode === 'chapters' && (
          <div>
            <Title level={4}>All Chapters</Title>
            {modules.map(module => (
              <Card 
                key={module.id}
                size="small" 
                title={`${module.code}: ${module.title}`}
                style={{ marginBottom: 16 }}
              >
                <List
                  dataSource={module.chapters}
                  renderItem={(chapter) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setSelectedModule(module);
                            startEditChapter(chapter);
                          }}
                        >
                          Edit
                        </Button>,
                        <Button 
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            setSelectedModule(module);
                            deleteChapter(chapter.id);
                          }}
                        >
                          Delete
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<FileOutlined />}
                        title={
                          <Space>
                            {chapter.title}
                            <Tag color={statusColors[chapter.status]}>{chapter.status}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Text>{chapter.description}</Text>
                            <Space>
                              <Text>Chapter {chapter.order}</Text>
                              <Text>•</Text>
                              <Text>{chapter.estimatedHours} hours</Text>
                              <Text>•</Text>
                              <Progress 
                                percent={Math.round((chapter.completedContent / chapter.contentCount) * 100)} 
                                size="small" 
                                style={{ width: 80 }}
                              />
                            </Space>
                            <Space wrap>
                              {chapter.tags.map((tag, index) => (
                                <Tag key={index}>{tag}</Tag>
                              ))}
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ))}
          </div>
        )}

        {/* Progress View */}
        {viewMode === 'progress' && (
          <div>
            <Title level={4}>Learning Progress</Title>
            {modules.map(module => (
              <Card 
                key={module.id}
                size="small" 
                title={`${module.code}: ${module.title}`}
                style={{ marginBottom: 16 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Module Progress:</Text>
                    <Progress 
                      percent={Math.round((module.completedHours / module.estimatedHours) * 100)}
                      format={() => `${module.completedHours}h / ${module.estimatedHours}h`}
                    />
                  </div>
                  
                  <div>
                    <Text strong>Chapter Progress:</Text>
                    {module.chapters.map(chapter => (
                      <div key={chapter.id} style={{ marginBottom: 8 }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Text>{chapter.title}</Text>
                          <Tag color={statusColors[chapter.status]}>{chapter.status}</Tag>
                        </Space>
                        <Progress 
                          percent={Math.round((chapter.completedContent / chapter.contentCount) * 100)}
                          format={() => `${chapter.completedContent}/${chapter.contentCount}`}
                          size="small"
                        />
                      </div>
                    ))}
                  </div>
                </Space>
              </Card>
            ))}
          </div>
        )}

        {/* Selected Module Detail */}
        {selectedModule && (
          <Card 
            title={`${selectedModule.code}: ${selectedModule.title}`}
            extra={
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateChapterModalVisible(true)}
              >
                Add Chapter
              </Button>
            }
          >
            <Tabs defaultActiveKey="overview">
              <TabPane tab="Overview" key="overview">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Paragraph>{selectedModule.description}</Paragraph>
                  <Space>
                    <Text strong>Credits:</Text>
                    <Text>{selectedModule.credits}</Text>
                  </Space>
                  <Space>
                    <Text strong>Instructor:</Text>
                    <Text>{selectedModule.instructor}</Text>
                  </Space>
                  <Space>
                    <CalendarOutlined />
                    <Text>
                      {new Date(selectedModule.startDate).toLocaleDateString()} - {new Date(selectedModule.endDate).toLocaleDateString()}
                    </Text>
                  </Space>
                  <Space wrap>
                    {selectedModule.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </Space>
                </Space>
              </TabPane>
              
              <TabPane tab="Chapters" key="chapters">
                <Tree
                  showLine
                  treeData={generateTreeData(selectedModule)}
                  defaultExpandAll
                />
              </TabPane>
            </Tabs>
          </Card>
        )}

        {/* Create Module Modal */}
        <Modal
          title="Create Module"
          open={createModuleModalVisible}
          onOk={createModule}
          onCancel={() => {
            setCreateModuleModalVisible(false);
            resetModuleForm();
          }}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Module Code (e.g., CS301)"
              value={moduleForm.code}
              onChange={(e) => setModuleForm(prev => ({ ...prev, code: e.target.value }))}
            />
            <Input
              placeholder="Module Title"
              value={moduleForm.title}
              onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextArea
              placeholder="Description"
              value={moduleForm.description}
              onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Space style={{ width: '100%' }}>
              <Input
                placeholder="Credits"
                type="number"
                value={moduleForm.credits}
                onChange={(e) => setModuleForm(prev => ({ ...prev, credits: parseInt(e.target.value) || 3 }))}
              />
              <Input
                placeholder="Estimated Hours"
                type="number"
                value={moduleForm.estimatedHours}
                onChange={(e) => setModuleForm(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 120 }))}
              />
            </Space>
            <Input
              placeholder="Instructor"
              value={moduleForm.instructor}
              onChange={(e) => setModuleForm(prev => ({ ...prev, instructor: e.target.value }))}
            />
            
            <div>
              <Text strong>Tags:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onPressEnter={() => addTag(true)}
                />
                <Button onClick={() => addTag(true)}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {moduleForm.tags.map((tag, index) => (
                  <Tag key={index} closable onClose={() => removeTag(tag, true)}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>

        {/* Edit Module Modal */}
        <Modal
          title="Edit Module"
          open={editModuleModalVisible}
          onOk={updateModule}
          onCancel={() => {
            setEditModuleModalVisible(false);
            resetModuleForm();
          }}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Module Code (e.g., CS301)"
              value={moduleForm.code}
              onChange={(e) => setModuleForm(prev => ({ ...prev, code: e.target.value }))}
            />
            <Input
              placeholder="Module Title"
              value={moduleForm.title}
              onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextArea
              placeholder="Description"
              value={moduleForm.description}
              onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Space style={{ width: '100%' }}>
              <Input
                placeholder="Credits"
                type="number"
                value={moduleForm.credits}
                onChange={(e) => setModuleForm(prev => ({ ...prev, credits: parseInt(e.target.value) || 3 }))}
              />
              <Input
                placeholder="Estimated Hours"
                type="number"
                value={moduleForm.estimatedHours}
                onChange={(e) => setModuleForm(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 120 }))}
              />
            </Space>
            <Input
              placeholder="Instructor"
              value={moduleForm.instructor}
              onChange={(e) => setModuleForm(prev => ({ ...prev, instructor: e.target.value }))}
            />
            
            <div>
              <Text strong>Tags:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onPressEnter={() => addTag(true)}
                />
                <Button onClick={() => addTag(true)}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {moduleForm.tags.map((tag, index) => (
                  <Tag key={index} closable onClose={() => removeTag(tag, true)}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>

        {/* Create Chapter Modal */}
        <Modal
          title="Create Chapter"
          open={createChapterModalVisible}
          onOk={createChapter}
          onCancel={() => {
            setCreateChapterModalVisible(false);
            resetChapterForm();
          }}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Chapter Title"
              value={chapterForm.title}
              onChange={(e) => setChapterForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextArea
              placeholder="Description"
              value={chapterForm.description}
              onChange={(e) => setChapterForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Space style={{ width: '100%' }}>
              <Input
                placeholder="Chapter Order"
                type="number"
                value={chapterForm.order}
                onChange={(e) => setChapterForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
              />
              <Input
                placeholder="Estimated Hours"
                type="number"
                value={chapterForm.estimatedHours}
                onChange={(e) => setChapterForm(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 20 }))}
              />
            </Space>
            
            <div>
              <Text strong>Prerequisites:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add prerequisite chapter ID"
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  onPressEnter={addPrerequisite}
                />
                <Button onClick={addPrerequisite}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {chapterForm.prerequisites.map((prereq, index) => (
                  <Tag key={index} closable onClose={() => removePrerequisite(prereq)}>
                    {prereq}
                  </Tag>
                ))}
              </Space>
            </div>
            
            <div>
              <Text strong>Tags:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onPressEnter={() => addTag(false)}
                />
                <Button onClick={() => addTag(false)}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {chapterForm.tags.map((tag, index) => (
                  <Tag key={index} closable onClose={() => removeTag(tag, false)}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>

        {/* Edit Chapter Modal */}
        <Modal
          title="Edit Chapter"
          open={editChapterModalVisible}
          onOk={updateChapter}
          onCancel={() => {
            setEditChapterModalVisible(false);
            setSelectedChapter(null);
            resetChapterForm();
          }}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Chapter Title"
              value={chapterForm.title}
              onChange={(e) => setChapterForm(prev => ({ ...prev, title: e.target.value }))}
            />
            <TextArea
              placeholder="Description"
              value={chapterForm.description}
              onChange={(e) => setChapterForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <Space style={{ width: '100%' }}>
              <Input
                placeholder="Chapter Order"
                type="number"
                value={chapterForm.order}
                onChange={(e) => setChapterForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
              />
              <Input
                placeholder="Estimated Hours"
                type="number"
                value={chapterForm.estimatedHours}
                onChange={(e) => setChapterForm(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 20 }))}
              />
            </Space>
            
            <div>
              <Text strong>Prerequisites:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add prerequisite chapter ID"
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  onPressEnter={addPrerequisite}
                />
                <Button onClick={addPrerequisite}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {chapterForm.prerequisites.map((prereq, index) => (
                  <Tag key={index} closable onClose={() => removePrerequisite(prereq)}>
                    {prereq}
                  </Tag>
                ))}
              </Space>
            </div>
            
            <div>
              <Text strong>Tags:</Text>
              <Space style={{ marginTop: 8, width: '100%' }}>
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onPressEnter={() => addTag(false)}
                />
                <Button onClick={() => addTag(false)}>Add</Button>
              </Space>
              <Space wrap style={{ marginTop: 8 }}>
                {chapterForm.tags.map((tag, index) => (
                  <Tag key={index} closable onClose={() => removeTag(tag, false)}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Modal>
      </Space>
    </Card>
  );
};

export default ModuleManagement;
