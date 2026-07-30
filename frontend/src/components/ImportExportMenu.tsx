import React, { useRef } from 'react';
import './ImportExportMenu.css';
import { Button, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { 
  ExportOutlined, 
  ImportOutlined, 
  FilePdfOutlined, 
  FileWordOutlined, 
  FileMarkdownOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';
import { 
  exportToPdf, 
  exportToDocx, 
  exportToMarkdown, 
  exportToTxt, 
  importFromFile 
} from '../utils/exportUtils';
import { microsoftService } from '../services/microsoftService';
import { CloudOutlined, WindowsOutlined } from '@ant-design/icons';

interface ImportExportMenuProps {
  content: string;
  title?: string;
  onImport?: (content: string) => void;
  disabled?: boolean;
}

const ImportExportMenu: React.FC<ImportExportMenuProps> = ({ 
  content, 
  title = 'document',
  onImport,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (type: 'pdf' | 'docx' | 'md' | 'txt') => {
    try {
      switch (type) {
        case 'pdf':
          await exportToPdf(content, title);
          break;
        case 'docx':
          await exportToDocx(content, title);
          break;
        case 'md':
          exportToMarkdown(content, title);
          break;
        case 'txt':
          exportToTxt(content, title);
          break;
      }
      message.success(`Exported to ${type.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      message.error(`Failed to export to ${type.toUpperCase()}`);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedContent = await importFromFile(file);
      onImport?.(importedContent);
      message.success('File imported successfully');
    } catch (error) {
      console.error('Import failed:', error);
      message.error('Failed to import file');
    } finally {
      // Reset the input to allow importing the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'export-group',
      type: 'group',
      label: 'Export',
      children: [
        {
          key: 'export-pdf',
          label: 'Export as PDF',
          icon: <FilePdfOutlined />,
          onClick: () => handleExport('pdf')
        },
        {
          key: 'export-docx',
          label: 'Export as Word',
          icon: <FileWordOutlined />,
          onClick: () => handleExport('docx')
        },
        {
          key: 'export-md',
          label: 'Export as Markdown',
          icon: <FileMarkdownOutlined />,
          onClick: () => handleExport('md')
        },
        {
          key: 'export-txt',
          label: 'Export as Text',
          icon: <FileTextOutlined />,
          onClick: () => handleExport('txt')
        },
        {
          key: 'export-onedrive',
          label: 'Save to OneDrive',
          icon: <WindowsOutlined />,
          onClick: () => microsoftService.uploadToOneDrive(title, content)
        },
      ]
    },
    {
      type: 'divider',
    },
    {
      key: 'import',
      label: 'Import File',
      icon: <ImportOutlined />,
      onClick: () => fileInputRef.current?.click()
    },
    {
      key: 'import-onedrive',
      label: 'Import from OneDrive',
      icon: <CloudOutlined />,
      onClick: () => microsoftService.listOneDriveFiles()
    },
  ];

  return (
    <div className="import-export-menu">
      <Dropdown 
        menu={{ items: menuItems }} 
        trigger={['click']} 
        disabled={disabled}
      >
        <Button 
          type="text" 
          icon={<ExportOutlined />} 
          className="export-button"
          aria-label="Open import/export menu"
        />
      </Dropdown>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        className="file-input"
        accept=".md,.txt,.docx"
        onChange={handleImport}
        aria-label="Select file to import"
        title="Select file to import"
      />
    </div>
  );
};

export default ImportExportMenu;
