import React, { useState } from 'react';
import { Modal, Tree, Button } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { FolderOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { Folder } from '../types/folder';

interface MoveFolderDialogProps {
  visible: boolean;
  onCancel: () => void;
  onMove: (targetParentId: string | null) => Promise<void>;
  folders: Folder[];
  currentFolderId: string | null;
}

const MoveFolderDialog: React.FC<MoveFolderDialogProps> = ({
  visible,
  onCancel,
  onMove,
  folders,
  currentFolderId,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // Build tree data for the folder selector
  const buildTreeData = (folders: Folder[], parentId: string | null = null): DataNode[] => {
    return folders
      .filter(folder => folder.parentId === parentId && folder.id !== currentFolderId)
      .map(folder => {
        const children = buildTreeData(folders, folder.id);
        const node: DataNode = {
          key: folder.id,
          title: folder.name,
          children: children.length > 0 ? children : undefined,
        };
        return node;
      });
  };

  const handleMove = async () => {
    if (selectedKey === undefined) return;
    
    try {
      setIsMoving(true);
      await onMove(selectedKey || null);
      onCancel();
    } finally {
      setIsMoving(false);
    }
  };

  const handleSelect = (selectedKeys: React.Key[]) => {
    setSelectedKey(selectedKeys.length > 0 ? selectedKeys[0].toString() : null);
  };

  const handleCancel = () => {
    setSelectedKey(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      title="Move Folder"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="move"
          type="primary"
          onClick={handleMove}
          disabled={selectedKey === undefined}
          loading={isMoving}
        >
          Move Here
        </Button>,
      ]}
      width={400}
    >
      <div style={{ marginBottom: 16 }}>
        Select a destination folder or "Root" to move to the top level
      </div>
      <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: 4, padding: 8 }}>
        <Tree
          showIcon
          defaultExpandAll
          onSelect={handleSelect}
          treeData={[
            {
              key: 'root',
              title: 'Root',
              icon: <FolderOutlined />,
              children: buildTreeData(folders),
            },
          ]}
          selectedKeys={selectedKey ? [selectedKey] : []}
          icon={({ expanded }) => expanded ? <FolderOpenOutlined /> : <FolderOutlined />}
        />
      </div>
    </Modal>
  );
};

export default MoveFolderDialog;
