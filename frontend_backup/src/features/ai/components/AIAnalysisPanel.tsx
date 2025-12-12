import React, { useState, useEffect } from 'react';
import { Card, Tag, List, Spin, Alert, Tabs, Typography, Space } from 'antd';
import { BulbOutlined, TagOutlined, LinkOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAIOrganization } from '../context/AIOrganizationContext';
import type { Note, AICategory, AITag, AISummary } from '../../../types/note';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface AIAnalysisPanelProps {
  note: Note;
  onApplyCategories?: (categories: AICategory[]) => void;
  onApplyTags?: (tags: AITag[]) => void;
  onApplySummary?: (summary: AISummary) => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  note,
  onApplyCategories,
  onApplyTags,
  onApplySummary,
}) => {
  const { analyzeNote, isAnalyzing, error } = useAIOrganization();
  const [analysis, setAnalysis] = useState<{
    categories: AICategory[];
    tags: AITag[];
    summary: AISummary;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const result = await analyzeNote(note);
        setAnalysis(result);
      } catch (err) {
        console.error('Failed to analyze note:', err);
      }
    };

    if (note.content) {
      fetchAnalysis();
    }
  }, [note, analyzeNote]);

  const renderSummaryTab = () => (
    <div className="ai-summary-tab">
      <Title level={5} className="mb-4">Key Points</Title>
      <List
        dataSource={analysis?.summary?.keyPoints || []}
        renderItem={(point) => (
          <List.Item>
            <List.Item.Meta
              avatar={<BulbOutlined />}
              description={point}
            />
          </List.Item>
        )}
      />
      {analysis?.summary?.actionItems && analysis.summary.actionItems.length > 0 && (
        <div className="mt-6">
          <Title level={5} className="mb-4">Suggested Actions</Title>
          <List
            dataSource={analysis.summary.actionItems}
            renderItem={(action) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<BulbOutlined style={{ color: '#1890ff' }} />}
                  description={action}
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="ai-categories-tab">
      <div className="mb-4">
        <Text type="secondary">Suggested categories for your note:</Text>
      </div>
      <Space wrap>
        {analysis?.categories?.map((category) => (
          <Tag
            key={category.id}
            color="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => onApplyCategories?.([category])}
          >
            {category.name}
            <span className="ml-1 text-xs opacity-70">
              {Math.round(category.confidence * 100)}%
            </span>
          </Tag>
        ))}
      </Space>
    </div>
  );

  const renderTagsTab = () => (
    <div className="ai-tags-tab">
      <div className="mb-4">
        <Text type="secondary">Suggested tags for better organization:</Text>
      </div>
      <Space wrap>
        {analysis?.tags?.map((tag) => (
          <Tag
            key={tag.id}
            icon={<TagOutlined />}
            onClick={() => onApplyTags?.([tag])}
            style={{ cursor: 'pointer' }}
          >
            {tag.name}
          </Tag>
        ))}
      </Space>
    </div>
  );

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spin tip="Analyzing note content..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  if (!analysis) {
    return <Alert message="No analysis available" type="info" showIcon />;
  }

  return (
    <Card className="ai-analysis-panel">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        className="ai-analysis-tabs"
      >
        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              Summary
            </span>
          }
          key="summary"
        >
          {renderSummaryTab()}
        </TabPane>
        <TabPane
          tab={
            <span>
              <BulbOutlined />
              Categories
            </span>
          }
          key="categories"
        >
          {renderCategoriesTab()}
        </TabPane>
        <TabPane
          tab={
            <span>
              <TagOutlined />
              Tags
            </span>
          }
          key="tags"
        >
          {renderTagsTab()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default AIAnalysisPanel;
