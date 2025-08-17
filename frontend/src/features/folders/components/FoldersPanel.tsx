import React, { useState, useEffect } from 'react';
import { Tree, Button, Input, Modal, message, Menu } from 'antd';
import type { MenuProps } from 'antd';
import type { DataNode, EventDataNode } from 'antd/es/tree';
import { 
  FolderOutlined, 
  FolderOpenOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined
} from '@ant-design/icons';
import MoveFolderDialog from './MoveFolderDialog';
import { Folder } from '../types/folder';

export interface FoldersPanelProps {
  folders: Folder[];
  selectedFolderId?: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (folder: { name: string; parentId: string | null }) => Promise<void>;
  onRenameFolder: (folderId: string, newName: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onMoveFolder: (folderId: string, newParentId: string | null) => Promise<void>;
}

const FoldersPanel: React.FC<FoldersPanelProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder: _onMoveFolder,
}) => {
  // Remove unused user from props
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<{id: string, name: string} | null>(null);
  const [contextMenuFolder, setContextMenuFolder] = useState<Folder | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{x: number, y: number} | null>(null);

  // Expand all folders by default
  useEffect(() => {
    if (folders.length > 0) {
      setExpandedKeys(prev => {
        const folderKeys = folders.map(f => f.id);
        return [...new Set([...prev, ...folderKeys])];
      });
    }
  }, [folders]);

  // Build tree data nodes from folders
  const buildTreeData = (folders: Folder[]): DataNode[] => {
    return folders.map(folder => ({
      key: folder.id,
      title: renderTitle(folder),
      children: folder.subfolders ? buildTreeData(folder.subfolders) : [],
      isLeaf: !folder.subfolders?.length
    }));
  };

  // Handle folder selection
  const handleSelect = (selectedKeys: React.Key[]) => {
    onSelectFolder(selectedKeys[0] as string);
  };

  // Handle folder expand/collapse
  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  // Handle right-click context menu
  const handleContextMenu = (info: { event: React.MouseEvent; node: EventDataNode<DataNode> }) => {
    info.event.preventDefault();
    const folder = findFolderById(folders, info.node.key as string);
    if (folder) {
      setContextMenuFolder(folder);
      setContextMenuPosition({
        x: info.event.clientX,
        y: info.event.clientY
      });
    }
  };

  // Find folder by ID in the folder tree
  const findFolderById = (folderList: Folder[], id: string): Folder | null => {
    for (const folder of folderList) {
      if (folder.id === id) return folder;
      if (folder.subfolders?.length) {
        const found = findFolderById(folder.subfolders, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await onCreateFolder({
        name: newFolderName.trim(),
        parentId: contextMenuFolder?.id || null
      });
      setNewFolderName('');
      setIsModalVisible(false);
      message.success('Folder created successfully');
    } catch (error) {
      console.error('Failed to create folder:', error);
      message.error('Failed to create folder');
    }
  };

  const handleRenameFolder = async () => {
    if (!editingFolder || !editingFolder.name.trim()) return;
    
    try {
      await onRenameFolder(editingFolder.id, editingFolder.name.trim());
      setEditingFolder(null);
      message.success('Folder renamed successfully');
    } catch (error) {
      console.error('Failed to rename folder:', error);
      message.error('Failed to rename folder');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    Modal.confirm({
      title: 'Delete Folder',
      content: 'Are you sure you want to delete this folder? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await onDeleteFolder(folderId);
          message.success('Folder deleted successfully');
        } catch (error) {
          console.error('Failed to delete folder:', error);
          message.error('Failed to delete folder');
        }
      },
    });
  };

  const handleAddSubfolder = (folder: Folder) => {
    setContextMenuFolder(folder);
    setNewFolderName('');
    setIsModalVisible(true);
  };

  const renderTitle = (folder: Folder) => {

    if (editingFolder?.id === folder.id) {
      return (
        <div className="folder-item">
          <Input
            autoFocus
            value={editingFolder.name}
            onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})}
            onPressEnter={handleRenameFolder}
            onBlur={handleRenameFolder}
            size="small"
            style={{ width: '80%' }}
          />
        </div>
      );
    }

    return (
      <div 
        className={`folder-item ${selectedFolderId === folder.id ? 'selected' : ''}`}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenuFolder(folder);
          setContextMenuPosition({ x: e.clientX, y: e.clientY });
        }}
      >
        <span className="folder-name">
          {expandedKeys.includes(folder.id) ? <FolderOpenOutlined /> : <FolderOutlined />}
          <span>{folder.name}</span>
        </span>
        <span className="folder-actions">
          <Button 
            type="text" 
            size="small" 
            icon={<PlusOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              handleAddSubfolder(folder);
            }}
          />
        </span>
      </div>
    );
  };

  const contextMenuItems: MenuProps['items'] = [
    {
      key: 'new',
      label: 'New Subfolder',
      icon: <PlusOutlined />,
      onClick: () => contextMenuFolder && handleAddSubfolder(contextMenuFolder)
    },
    {
      key: 'move',
      label: 'Move to...',
      icon: <SwapOutlined />,
      onClick: () => {
        if (contextMenuFolder) {
          setMoveTargetId(contextMenuFolder.id);
          setShowMoveDialog(true);
        }
      }
    },
    {
      type: 'divider',
    },
    {
      key: 'rename',
      label: 'Rename',
      icon: <EditOutlined />,
      onClick: () => contextMenuFolder && setEditingFolder({ id: contextMenuFolder.id, name: contextMenuFolder.name })
    },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      icon: <DeleteOutlined />,
      onClick: () => contextMenuFolder && handleDeleteFolder(contextMenuFolder.id)
    },
  ] as MenuProps['items'];
  
  const handleMoveFolder = async (targetParentId: string | null) => {
    if (!moveTargetId) return;
    
    try {
      await _onMoveFolder(moveTargetId, targetParentId);
      message.success('Folder moved successfully');
      setShowMoveDialog(false);
      setMoveTargetId(null);
    } catch (error) {
      console.error('Failed to move folder:', error);
      message.error('Failed to move folder');
    }
  };

  return (
    <div className="folders-panel">
      <div className="folders-header">
        <h3>Folders</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="small"
          onClick={() => {
            setContextMenuFolder(null);
            setNewFolderName('');
            setIsModalVisible(true);
          }}
        >
          New Folder
        </Button>
      </div>
      
      <div className="folders-tree">
        <Tree
          showIcon
          expandedKeys={expandedKeys}
          selectedKeys={selectedFolderId ? [selectedFolderId] : []}
          onExpand={handleExpand}
          onSelect={handleSelect}
          onRightClick={handleContextMenu}
          treeData={buildTreeData(folders)}
        />
      </div>

      <Modal
        title={contextMenuFolder ? 'Create Subfolder' : 'Create New Folder'}
        open={isModalVisible}
        onOk={handleCreateFolder}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onPressEnter={handleCreateFolder}
          autoFocus
        />
      </Modal>

      {contextMenuPosition && (
        <div
          className="folder-context-menu"
          style={{
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            zIndex: 1000,
            backgroundColor: 'white', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: '4px',
            padding: '4px 0',
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Menu 
            items={contextMenuItems} 
            mode="vertical"
            selectable={false}
            style={{ border: 'none', boxShadow: 'none' }}
          />
        </div>
      )}

      {contextMenuPosition && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setContextMenuPosition(null)}
        />
      )}

      <MoveFolderDialog
        visible={showMoveDialog}
        onCancel={() => setShowMoveDialog(false)}
        onMove={handleMoveFolder}
        folders={folders}
        currentFolderId={moveTargetId}
      />

      <style>{`
        .folders-panel {
          padding: 16px;
          border-right: 1px solid #f0f0f0;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .folders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .folders-tree {
          flex: 1;
          overflow-y: auto;
        }
        .folder-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          width: 100%;
        }
        .folder-item:hover {
          background: #f5f5f5;
        }
        .folder-item.selected {
          background: #e6f7ff;
        }
        .folder-name {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .folder-actions {
          visibility: hidden;
        }
        .folder-item:hover .folder-actions {
          visibility: visible;
        }
        .context-menu-item:hover {
          background: #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default FoldersPanel;
