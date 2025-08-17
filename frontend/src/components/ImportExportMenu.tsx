import React, { useRef } from 'react';
import { Button, Dropdown, Menu, message } from 'antd';
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
} from '@/utils/exportUtils';

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

  const menu = (
    <Menu>
      <Menu.ItemGroup title="Export">
        <Menu.Item 
          key="export-pdf" 
          icon={<FilePdfOutlined />}
          onClick={() => handleExport('pdf')}
        >
          Export as PDF
        </Menu.Item>
        <Menu.Item 
          key="export-docx" 
          icon={<FileWordOutlined />}
          onClick={() => handleExport('docx')}
        >
          Export as Word
        </Menu.Item>
        <Menu.Item 
          key="export-md" 
          icon={<FileMarkdownOutlined />}
          onClick={() => handleExport('md')}
        >
          Export as Markdown
        </Menu.Item>
        <Menu.Item 
          key="export-txt" 
          icon={<FileTextOutlined />}
          onClick={() => handleExport('txt')}
        >
          Export as Text
        </Menu.Item>
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.Item 
        key="import" 
        icon={<ImportOutlined />}
        onClick={() => fileInputRef.current?.click()}
      >
        Import File
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={menu} trigger={['click']} disabled={disabled}>
        <Button type="text" icon={<ExportOutlined />} />
      </Dropdown>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".md,.txt,.docx"
        onChange={handleImport}
      />
    </>
  );
};

export default ImportExportMenu;
