import React, { useState, useCallback } from 'react';
import { 
  Button, 
  Card,
  List,
  Space, 
  Tabs, 
  Typography, 
  Select, 
  message,
  Tag
} from 'antd';
import { 
  TagsOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  BookOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { noteAIService, AISummary, Flashcard, AITagSuggestion } from '../../services/noteAIService';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface AIEnhancementPanelProps {
  content: string;
  onApply: (content: string) => void;
  onClose: () => void;
}

type EnhancementType = 'summary' | 'flashcards' | 'studyGuide' | 'tags';

const AIEnhancementPanel: React.FC<AIEnhancementPanelProps> = ({ 
  content, 
  onApply, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<EnhancementType>('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [studyGuide, setStudyGuide] = useState<any>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [summaryOptions, setSummaryOptions] = useState({
    style: 'detailed' as const,
    tone: 'professional' as const,
    length: 'medium' as const,
  });

  const generateSummary = useCallback(async () => {
    if (!content.trim()) {
      message.warning('Please add some content to generate a summary');
      return;
    }

    setIsLoading(true);
    try {
      const result = await noteAIService.generateSummary(content, summaryOptions);
      setSummary(result);
      message.success('Summary generated successfully');
    } catch (error) {
      console.error('Error generating summary:', error);
      message.error('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [content, summaryOptions]);

  const generateFlashcards = useCallback(async () => {
    if (!content.trim()) {
      message.warning('Please add some content to generate flashcards');
      return;
    }

    setIsLoading(true);
    try {
      const result = await noteAIService.generateFlashcards(content, 5);
      setFlashcards(result);
      message.success('Flashcards generated successfully');
    } catch (error) {
      console.error('Error generating flashcards:', error);
      message.error('Failed to generate flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  const generateStudyGuide = useCallback(async () => {
    if (!content.trim()) {
      message.warning('Please add some content to generate a study guide');
      return;
    }

    setIsLoading(true);
    try {
      // For now, we'll use generateSummary as a fallback since generateStudyGuide doesn't exist
      const result = await noteAIService.generateSummary(content, {
        style: 'detailed',
        includeKeyPoints: true,
        includeActionItems: true,
        includeRelatedConcepts: true
      });
      setStudyGuide({
        content: `${result.summary}\n\nKey Points:\n${result.keyPoints.map(p => `• ${p}`).join('\n')}`
      });
      message.success('Study guide generated successfully');
    } catch (error) {
      console.error('Error generating study guide:', error);
      message.error('Failed to generate study guide. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  const suggestTags = useCallback(async () => {
    if (!content.trim()) {
      message.warning('Please add some content to suggest tags');
      return;
    }

    setIsLoading(true);
    try {
      // For now, we'll generate tags from the content directly since suggestTags doesn't exist
      const summary = await noteAIService.generateSummary(content, {
        includeKeyPoints: true
      });
      
      // Create tags from key topics and entities
      const topicTags = summary.topics || [];
      const entityTags = (summary.entities || []).map(e => e.text);
      const keyPointTags = (summary.keyPoints || []).flatMap(point => 
        point.split(/[\s,.!?]+/).filter(word => word.length > 3)
      );
      
      // Combine and deduplicate tags
      const allTags = [...new Set([...topicTags, ...entityTags, ...keyPointTags])];
      
      // Format as AITagSuggestion
      const result: AITagSuggestion = {
        tags: allTags.map(tag => ({
          name: tag,
          category: 'topic',
          confidence: 0.8,
          relevance: 0.8
        })),
        categories: ['topic'],
        confidenceScores: {}
      };
      
      setSuggestedTags(result.tags.map(t => t.name));
      message.success('Tags suggested successfully');
    } catch (error) {
      console.error('Error suggesting tags:', error);
      message.error('Failed to suggest tags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  const handleApplyEnhancement = useCallback((content: string) => {
    onApply(content);
    message.success('Enhancement applied successfully');
  }, [onApply]);

  const renderSummaryTab = () => (
    <div className="p-4">
      <div className="mb-4">
        <Space size="middle">
          <Select
            value={summaryOptions.style}
            onChange={(value) => setSummaryOptions(prev => ({ ...prev, style: value }))}
            style={{ width: 150 }}
          >
            <Option value="concise">Concise</Option>
            <Option value="detailed">Detailed</Option>
            <Option value="bullet-points">Bullet Points</Option>
            <Option value="paragraph">Paragraph</Option>
          </Select>
          
          <Select
            value={summaryOptions.tone}
            onChange={(value) => setSummaryOptions(prev => ({ ...prev, tone: value }))}
            style={{ width: 150 }}
          >
            <Option value="academic">Academic</Option>
            <Option value="professional">Professional</Option>
            <Option value="casual">Casual</Option>
            <Option value="simple">Simple</Option>
          </Select>
          
          <Button 
            type="primary" 
            onClick={generateSummary}
            loading={isLoading && activeTab === 'summary'}
            icon={<RobotOutlined />}
          >
            Generate Summary
          </Button>
        </Space>
      </div>
      
      {summary && (
        <Card 
          title="AI-Generated Summary" 
          className="mt-4"
          extra={[
            <Button 
              key="apply" 
              type="link" 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleApplyEnhancement(summary.summary)}
            >
              Apply Summary
            </Button>
          ]}
        >
          <div className="prose max-w-none">
            <h3>Summary</h3>
            <p>{summary.summary}</p>
            
            <h3 className="mt-4">Key Points</h3>
            <ul>
              {summary.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
            
            {summary.topics && summary.topics.length > 0 && (
              <>
                <h3 className="mt-4">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.topics.map((topic, index) => (
                    <Tag key={index} color="blue">{topic}</Tag>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  const renderFlashcardsTab = () => (
    <div className="p-4">
      <div className="mb-4">
        <Button 
          type="primary" 
          onClick={generateFlashcards}
          loading={isLoading && activeTab === 'flashcards'}
          icon={<RobotOutlined />}
        >
          Generate Flashcards
        </Button>
      </div>
      
      {flashcards.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <Title level={4}>Generated Flashcards</Title>
            <Button 
              type="link" 
              onClick={() => {
                const flashcardsText = flashcards
                  .map((card, index) => 
                    `Flashcard ${index + 1}:\nFront: ${card.front}\nBack: ${card.back}\n`
                  )
                  .join('\n');
                handleApplyEnhancement(flashcardsText);
              }}
            >
              Add All to Note
            </Button>
          </div>
          
          <List
            itemLayout="horizontal"
            dataSource={flashcards}
            renderItem={(card, index) => (
              <List.Item
                actions={[
                  <Button 
                    type="text" 
                    icon={<CheckCircleOutlined />} 
                    onClick={() => 
                      handleApplyEnhancement(`Front: ${card.front}\nBack: ${card.back}`)
                    }
                  />
                ]}
              >
                <List.Item.Meta
                  title={`Flashcard ${index + 1}`}
                  description={
                    <div className="space-y-2">
                      <div><strong>Front:</strong> {card.front}</div>
                      <div><strong>Back:</strong> {card.back}</div>
                      {card.explanation && (
                        <div className="text-gray-500 text-sm">
                          <strong>Explanation:</strong> {card.explanation}
                        </div>
                      )}
                      <div className="flex gap-2">
                        {card.tags?.map((tag, i) => (
                          <Tag key={i} color="blue" className="text-xs">{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );

  const renderStudyGuideTab = () => (
    <div className="p-4">
      <div className="mb-4">
        <Button 
          type="primary" 
          onClick={generateStudyGuide}
          loading={isLoading && activeTab === 'studyGuide'}
          icon={<BookOutlined />}
        >
          Generate Study Guide
        </Button>
      </div>
      
      {studyGuide && (
        <Card 
          title="AI-Generated Study Guide" 
          className="mt-4"
          extra={[
            <Button 
              key="apply" 
              type="link" 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleApplyEnhancement(JSON.stringify(studyGuide, null, 2))}
            >
              Add to Note
            </Button>
          ]}
        >
          <div className="prose max-w-none">
            <h2>{studyGuide.title || 'Study Guide'}</h2>
            <p className="text-lg">{studyGuide.overview}</p>
            
            {studyGuide.sections?.map((section: any, index: number) => (
              <div key={index} className="mt-6">
                <h3>{section.title}</h3>
                <p>{section.content}</p>
                {section.keyPoints && section.keyPoints.length > 0 && (
                  <div className="mt-2">
                    <h4>Key Points:</h4>
                    <ul>
                      {section.keyPoints.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            
            {studyGuide.exercises?.length > 0 && (
              <div className="mt-8">
                <h3>Practice Exercises</h3>
                <ol className="list-decimal pl-5">
                  {studyGuide.exercises.map((ex: any, i: number) => (
                    <li key={i} className="mb-4">
                      <div className="font-medium">{ex.question}</div>
                      <div className="text-gray-600 text-sm mt-1">
                        <strong>Answer:</strong> {ex.answer}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            
            {studyGuide.resources?.length > 0 && (
              <div className="mt-8">
                <h3>Additional Resources</h3>
                <ul className="list-disc pl-5">
                  {studyGuide.resources.map((res: any, i: number) => (
                    <li key={i}>
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {res.title}
                      </a>{' '}
                      <span className="text-gray-500 text-xs">({res.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  const renderTagsTab = () => (
    <div className="p-4">
      <Button
        type="primary"
        icon={<TagsOutlined />}
        onClick={suggestTags}
        loading={isLoading}
        className="mb-4"
      >
        Suggest Tags
      </Button>

      {suggestedTags.length > 0 && (
        <Card title="Suggested Tags" className="mb-4">
          <div style={{ marginBottom: 16 }}>
            {suggestedTags.map((tag: string, i: number) => (
              <Tag
                key={i}
                color="blue"
                style={{ marginBottom: 8, padding: '4px 8px' }}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <Card
      title={
        <div className="d-flex align-items-center">
          <RobotOutlined className="mr-2" />
          <span>AI Enhancement Panel</span>
        </div>
      }
      extra={
        <Button
          type="text"
          icon={<CloseCircleOutlined />}
          onClick={onClose}
        />
      }
      className="ai-enhancement-panel"
    >
      <Tabs activeKey={activeTab} onChange={(key: string) => setActiveTab(key as EnhancementType)}>
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
              Flashcards
            </span>
          }
          key="flashcards"
        >
          {renderFlashcardsTab()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <BookOutlined />
              Study Guide
            </span>
          }
          key="studyGuide"
        >
          {renderStudyGuideTab()}
        </TabPane>

        <TabPane
          tab={
            <span>
              <TagsOutlined />
              Tags
            </span>
          }
          key="tags"
        >
          {renderTagsTab()}
        </TabPane>
      </Tabs>
      <div className="p-4 border-t bg-gray-50 flex justify-end">
        <Button onClick={onClose} className="mr-2">
          Close
        </Button>
      </div>
    </Card>
  );
};

export default AIEnhancementPanel;
