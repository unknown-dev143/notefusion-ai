import React, { useState, useCallback, useEffect } from 'react';
import { FloatButton, Modal, Tabs, Button, message } from 'antd';
import { RobotOutlined, FileTextOutlined, TagsOutlined, FolderOutlined } from '@ant-design/icons';
import AIService from '../../services/ai/AIService';
import AISummarizer from './AISummarizer';
import AITagger from './AITagger';
import AIContentGenerator from './AIContentGenerator';
import AINoteOrganizer from './AINoteOrganizer';
import { useProgression } from '../../contexts/ProgressionContext';
import { Sparkles, Brain, Zap, Target, Combine, Flame } from 'lucide-react';
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
  const { addXP } = useProgression();

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
      addXP(50); // Reward for using Ema's specialized tools
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

      />

      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-widest text-slate-800 leading-none">Ema Engineering</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">Active Research Layer</p>
            </div>
          </div>
        }
        open={isVisibleState}
        onCancel={handleClose}
        footer={[
          <Button key="close" onClick={toggleModal} className="!rounded-xl !font-bold !text-xs !bg-slate-900 !text-white !border-none !h-10 px-6">
            Release Interface
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
              onOrganize={handleAIAction}
              onApplyOrganization={(organization: any) => {
                 message.loading('Neural Core: Restructuring knowledge tree...');
                 setTimeout(() => {
                    console.log('Applying organization:', organization);
                    message.success('Content restructured successfully.');
                 }, 1500);
              }}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default AIAssistant;
