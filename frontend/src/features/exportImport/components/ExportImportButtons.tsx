import React, { useState, useCallback } from 'react';
import { Button, Dropdown, MenuProps, Space, message } from 'antd';
import { ExportOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { ExportModal } from './ExportModal';
import { ImportModal } from './ImportModal';
import { useExportImport } from '../hooks/useExportImport';
import { Note } from '../../../types/note';

export interface ExportImportButtonsProps {
  selectedNotes?: any[];
  onExportComplete?: () => void;
  onImportComplete?: (result: any) => void;
  buttonSize?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'dashed' | 'text' | 'link';
  userId: string;
}

export const ExportImportButtons: React.FC<ExportImportButtonsProps> = ({
  selectedNotes = [],
  onExportComplete,
  onImportComplete,
  buttonSize = 'middle',
  type = 'default',
  userId,
}) => {
  const [exportVisible, setExportVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const { exportNote, exportMultiple, importNotes, isExporting, isImporting } = useExportImport();

  const handleExportClick = useCallback(() => {
    if (selectedNotes.length === 0) {
      message.warning('Please select at least one note to export');
      return;
    }
    setExportVisible(true);
  }, [selectedNotes]);

  const handleImportClick = useCallback(() => {
    setImportVisible(true);
  }, []);

  const handleExportComplete = useCallback(() => {
    setExportVisible(false);
    onExportComplete?.();
  }, [onExportComplete]);

  const handleImportComplete = useCallback((result: any) => {
    setImportVisible(false);
    onImportComplete?.(result);
  }, [onImportComplete]);

  const handleExport = useCallback(async (options: any) => {
    try {
      if (selectedNotes.length === 0) {
        message.warning('No notes selected for export');
        return false;
      }

      if (selectedNotes.length === 1) {
        const success = await exportNote(selectedNotes[0], options);
        if (success) {
          handleExportComplete();
        }
        return success;
      }

      // Multiple notes: export as zip for non-json, or json if selected
      const format = options.format === 'json' ? 'json' : 'zip';
      const success = await exportMultiple(selectedNotes as Note[], format);
      if (success) {
        handleExportComplete();
      }
      return success;
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export notes');
      return false;
    }
  }, [selectedNotes, exportNote, exportMultiple, handleExportComplete]);

  const handleImport = useCallback(async (files: File[]) => {
    try {
      if (!userId) {
        message.error('User ID is required for importing notes');
        return null;
      }
      const result = await importNotes(files, userId);
      if (result) {
        handleImportComplete(result);
      }
      return result;
    } catch (error) {
      console.error('Import failed:', error);
      message.error('Failed to import notes');
      return null;
    }
  }, [importNotes, handleImportComplete, userId]);

  // If no notes are selected, show a single import button
  if (selectedNotes.length === 0) {
    return (
      <>
        <Button 
          icon={<UploadOutlined />} 
          onClick={handleImportClick}
          size={buttonSize}
          type={type}
          loading={isImporting}
        >
          Import
        </Button>
        
        <ImportModal
          visible={importVisible}
          onCancel={() => setImportVisible(false)}
          onImport={handleImport}
          loading={isImporting}
        />
      </>
    );
  }

  // For multiple selected notes, show a dropdown with export/import options
  const items: MenuProps['items'] = [
    {
      key: 'export',
      label: `Export ${selectedNotes.length} selected`,
      icon: <DownloadOutlined />,
      onClick: handleExportClick,
    },
    {
      key: 'import',
      label: 'Import',
      icon: <UploadOutlined />,
      onClick: handleImportClick,
    },
  ];

  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']}>
        <Button type={type} size={buttonSize}>
          <Space>
            <ExportOutlined />
            Export/Import
          </Space>
        </Button>
      </Dropdown>

      <ExportModal
        visible={exportVisible}
        onCancel={() => setExportVisible(false)}
        onExport={handleExport}
        selectedCount={selectedNotes.length}
        loading={isExporting}
      />

      <ImportModal
        visible={importVisible}
        onCancel={() => setImportVisible(false)}
        onImport={handleImport}
        loading={isImporting}
      />
    </>
  );
};

export default ExportImportButtons;
