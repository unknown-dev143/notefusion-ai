import React, { useState, useCallback } from 'react';
import { Button, Card, Typography, Spin, Alert, Tree, Input, Tag, Tooltip } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { FolderOutlined, FileOutlined, BulbOutlined, CheckOutlined } from '@ant-design/icons';
import type { AIAssistantStyles } from './AIAssistant';

// Import CSS module with proper typing
const styles: AIAssistantStyles = require('./AIAssistant.module.css');

const { Title, Text } = Typography;
const { DirectoryTree } = Tree;
const { Search } = Input;

interface NoteNode extends DataNode {
  title: string;
  key: string;
  type?: 'folder' | 'note';
  tags?: string[];
  lastModified?: string;
}

interface AINoteOrganizerProps {
  content: string;
  onOrganize: (action: string, options?: any) => Promise<{
    structure: any;
    suggestedFolders: string[];
    suggestedTags: string[];
    actionItems: Array<{ action: string; priority: 'high' | 'medium' | 'low' }>;
  }>;
  onApplyOrganization?: (organization: any) => void;
  isLoading?: boolean;
}

const AINoteOrganizer: React.FC<AINoteOrganizerProps> = ({
  content,
  onOrganize,
  onApplyOrganization,
  isLoading = false,
}) => {
  const [structure, setStructure] = useState<NoteNode[]>([]);
  const [suggestedFolders, setSuggestedFolders] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<Array<{ action: string; priority: 'high' | 'medium' | 'low' }>>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const handleOrganize = useCallback(async () => {
    if (!content) {
      setError('No content available to analyze');
      return;
    }

    setError(null);
    try {
      const result = await onOrganize('getStructure', {
        analyzeContent: true,
        suggestOrganization: true,
      });
      
      setStructure(result.structure || []);
      setSuggestedFolders(result.suggestedFolders || []);
      setSuggestedTags(result.suggestedTags || []);
      setActionItems(result.actionItems || []);
      setIsAnalyzed(true);
    } catch (err) {
      setError('Failed to analyze and organize content. Please try again.');
      console.error('Organization error:', err);
    }
  }, [content, onOrganize]);

  const handleApplyOrganization = () => {
    if (onApplyOrganization) {
      onApplyOrganization({
        structure,
        tags: selectedTags,
        actionItems,
      });
    }
  };

  const handleTagSelect = (tag: string, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter(t => t !== tag);
    setSelectedTags(nextSelectedTags);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    // In a real implementation, you would filter the tree based on the search value
  };

  const renderTreeNodes = (nodes: NoteNode[] = []) => {
    return nodes.map(node => {
      const titleNode = node.title.toLowerCase().includes(searchValue.toLowerCase()) ? (
        <span>
          {node.title.split(new RegExp(`(${searchValue})`, 'gi')).map((part, i) =>
            part.toLowerCase() === searchValue.toLowerCase() ? (
              <span key={i} className={styles['highlightedText']}>{part}</span>
            ) : (
              part
            )
          )}
        </span>
      ) : (
        node.title
      );
      
      const title = (

      if (node.children) {
        return (
          <Tree.TreeNode
            key={node.key}
            title={
              <div className={styles.treeNode}>
                <span className={styles.nodeTitle}>
                  {node.type === 'folder' ? <FolderOutlined /> : <FileOutlined />}
                  {title}
                </span>
                {node.tags && node.tags.length > 0 && (
                  <span className={styles.nodeTags}>
                    {node.tags.slice(0, 2).map(tag => (
                      <Tag key={tag} color="blue" size="small">
                        {tag}
                      </Tag>
                    ))}
                    {node.tags.length > 2 && (
                      <Tooltip title={node.tags.slice(2).join(', ')}>
                        <Tag>+{node.tags.length - 2}</Tag>
                      </Tooltip>
                    )}
                  </span>
                )}
              </div>
            }
            icon={null}
          >
            {renderTreeNodes(node.children)}
          </Tree.TreeNode>
        );
      }
      
      return (
        <Tree.TreeNode
          key={node.key}
          title={
            <div className={styles.treeNode}>
              <span className={styles.nodeTitle}>
                {node.type === 'folder' ? <FolderOutlined /> : <FileOutlined />}
                {title}
              </span>
              {node.lastModified && (
                <span className={styles.nodeMeta}>
                  <Text type="secondary" className={styles.nodeMetaText}>
                    {new Date(node.lastModified).toLocaleDateString()}
                  </Text>
                </span>
              )}
            </div>
          }
          icon={null}
          isLeaf={node.isLeaf}
        />
      );
    });
  };

  return (
    <div className={styles.aiFeatureContainer}>
      <div className={styles.controls}>
        <Button
          type="primary"
          icon={<BulbOutlined />}
          onClick={handleOrganize}
          loading={isLoading}
          disabled={!content}
        >
          Analyze & Organize
        </Button>
        
        {onApplyOrganization && (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleApplyOrganization}
            disabled={!isAnalyzed}
            className={styles.applyButton}
          >
            Apply Organization
          </Button>
        )}
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ margin: '16px 0' }}
        />
      )}

      <div className={styles.resultContainer}>
        {isLoading ? (
          <div className={styles.loadingOverlay}>
            <Spin size="large" tip="Analyzing content structure..." />
          </div>
        ) : isAnalyzed ? (
          <div className={styles.organizationContainer}>
            <div className={styles.structurePanel}>
              <Title level={5} style={{ marginBottom: 16 }}>
                Suggested Structure
              </Title>
              <Search
                placeholder="Search in structure..."
                onChange={handleSearch}
                style={{ marginBottom: 16 }}
                allowClear
              />
              <div className={styles.treeContainer}>
                <DirectoryTree
                  showIcon={false}
                  defaultExpandAll
                  className={styles.noteTree}
                >
                  {renderTreeNodes(structure)}
                </DirectoryTree>
              </div>
            </div>

            <div className={styles.sidePanel}>
              {suggestedFolders.length > 0 && (
                <Card
                  size="small"
                  title="Suggested Folders"
                  className={styles.suggestionCard}
                >
                  <div className={styles.tagsContainer}>
                    {suggestedFolders.map((folder, index) => (
                      <Tag key={index} color="blue">
                        {folder}
                      </Tag>
                    ))}
                  </div>
                </Card>
              )}

              {suggestedTags.length > 0 && (
                <Card
                  size="small"
                  title="Suggested Tags"
                  className={styles.suggestionCard}
                >
                  <div className={styles.tagsContainer}>
                    {suggestedTags.map((tag) => (
                      <CheckableTag
                        key={tag}
                        checked={selectedTags.includes(tag)}
                        onChange={(checked) => handleTagSelect(tag, checked)}
                        className={styles.tagItem}
                      >
                        {tag}
                      </CheckableTag>
                    ))}
                  </div>
                </Card>
              )}

              {actionItems.length > 0 && (
                <Card
                  size="small"
                  title="Action Items"
                  className={styles.actionItemsCard}
                >
                  <div className={styles.actionItemsList}>
                    {actionItems.map((item, index) => (
                      <div
                        key={index}
                        className={`${styles.actionItem} ${styles[item.priority]}`}
                      >
                        <span className={styles.actionText}>{item.action}</span>
                        <span className={styles.priorityBadge}>{item.priority}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className={styles.placeholderCard}>
            <div className={styles.placeholder}>
              <FolderOutlined style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 16 }} />
              <Text type="secondary">
                {content
                  ? 'Click "Analyze & Organize" to structure your notes.'
                  : 'No content available to organize.'}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AINoteOrganizer;
