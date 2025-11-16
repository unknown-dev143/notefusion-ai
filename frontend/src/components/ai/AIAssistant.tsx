import React, { useState, useCallback, useEffect } from 'react';
import { FloatButton, Modal, Tabs, Button } from 'antd';
import { RobotOutlined, FileTextOutlined, TagsOutlined, FolderOutlined } from '@ant-design/icons';
import AIService from '../../services/ai/AIService';
import AISummarizer from './AISummarizer';
import AITagger from './AITagger';
import AIContentGenerator from './AIContentGenerator';
import AINoteOrganizer from './AINoteOrganizer';
import styles from './AIAssistant.module.css';

export type AIAssistantStyles = typeof styles;

// No need to destructure Text if not used
const { TabPane } = Tabs;

interface AIAssistantProps {
  noteId?: string | null | undefined;
  content: string;
  onContentUpdate: (content: string) => void;
  onTagsUpdate: (tags: string[]) => void;
  disabled?: boolean;
  className?: string;
  initialTags: string[];
  defaultTab: string;
  isVisible: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  noteId,
  content,
  onContentUpdate,
  onTagsUpdate,
  disabled = false,
  className = '',
  initialTags,
  defaultTab,
  isVisible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisibleState, setIsVisibleState] = useState(isVisible);

  // Sync with parent visibility state
  useEffect(() => {
    setIsVisibleState(isVisible);
  }, [isVisible]);

  const handleClose = useCallback(() => {
    setIsVisibleState(false);
    onClose();
  }, [onClose]);

  const handleAIAction = useCallback(async (action: string, data?: any) => {
    if (!isVisibleState) return null;
    
    setIsLoading(true);
    try {
      switch (action) {
        case 'summarize':
          return await AIService.summarizeContent(content, data);
        case 'generateTags':
          return await AIService.generateTags(content, data);
        case 'generateContent':
          return await AIService.generateContent(data.prompt, content, data.options);
        case 'getStructure':
          return await AIService.getContentStructure(content);
        case 'generateActionItems':
          return await AIService.generateActionItems(content);
        default:
          throw new Error(`Unknown AI action: ${action}`);
      }
    } catch (error) {
      console.error(`AI ${action} failed:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [content, isVisibleState]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const toggleModal = () => {
    setIsVisibleState(!isVisibleState);
  };

  return (
    <>
      <FloatButton
        type="primary"
        icon={<RobotOutlined />}
        onClick={toggleModal}
        className={`${styles.aiAssistantButton} ${className}`}
        tooltip="AI Assistant"
        disabled={disabled}
      />

      <Modal
        title="AI Assistant"
        open={isVisibleState}
        onCancel={handleClose}
        footer={[
          <Button key="close" onClick={toggleModal}>
            Close
          </Button>
        ]}
        width={800}
        className={styles.aiAssistantModal || ''}
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Generate
              </span>
            }
            key="summarize"
          >
            <AISummarizer
              content={content}
              onSummarize={handleAIAction}
              onApplySummary={onContentUpdate}
              isLoading={isLoading && activeTab === 'summarize'}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <TagsOutlined />
                Tags & Categories
              </span>
            }
            key="tags"
          >
            <AITagger
              content={content}
              onGenerateTags={handleAIAction}
              onApplyTags={onTagsUpdate}
              isLoading={isLoading && activeTab === 'tags'}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Generate Content
              </span>
            }
            key="generate"
          >
            <AIContentGenerator
              content={content}
              onGenerate={handleAIAction}
              onApplyContent={onContentUpdate}
              isLoading={isLoading && activeTab === 'generate'}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <FolderOutlined />
                Organize
              </span>
            }
            key="organize"
          >
            <AINoteOrganizer
              content={content}
              onUpdate={(structure: any) => {
                console.log('Structure updated:', structure);
                // Handle structure updates here if needed
              }}
              initialTags={initialTags}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default AIAssistant;
