import React, { useState } from 'react';
import { Modal, Radio, Button, Space, Progress, Typography, Checkbox, Card } from 'antd';
import { FilePdfOutlined, FileMarkdownOutlined, FileTextOutlined, FileZipOutlined } from '@ant-design/icons';
import { ExportOptions } from '../services/exportImportService';

const { Text } = Typography;

interface ExportModalProps {
  visible: boolean;
  onCancel: () => void;
  onExport: (options: ExportOptions) => Promise<boolean>;
  selectedCount: number;
  loading?: boolean;
}

const formatOptions = [
  { value: 'pdf', label: 'PDF', icon: <FilePdfOutlined /> },
  { value: 'md', label: 'Markdown', icon: <FileMarkdownOutlined /> },
  { value: 'txt', label: 'Plain Text', icon: <FileTextOutlined /> },
  { value: 'json', label: 'JSON', icon: <FileZipOutlined /> },
];

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onCancel,
  onExport,
  selectedCount,
  loading = false,
}) => {
  const [format, setFormat] = useState<string>('pdf');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const isExporting = loading;

  const handleExport = async () => {
    setProgress(30);
    
    try {
      const success = await onExport({
        format: format as 'pdf' | 'md' | 'txt' | 'json',
        includeMetadata,
      });
      
      if (success) {
        setProgress(100);
        setTimeout(() => {
          onCancel();
          setProgress(0);
        }, 500);
      } else {
        setProgress(0);
      }
    } catch (error) {
      console.error('Export error:', error);
      setProgress(0);
    }
  };

  return (
    <Modal
      title={`Export ${selectedCount} ${selectedCount > 1 ? 'Notes' : 'Note'}`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isExporting}>
          Cancel
        </Button>,
        <Button
          key="export"
          type="primary"
          loading={isExporting}
          onClick={handleExport}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card size="small" title="Export Format">
          <Radio.Group
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {formatOptions.map((option) => (
                <Radio key={option.value} value={option.value} style={{ width: '100%', padding: '8px' }}>
                  <Space>
                    {option.icon}
                    <Text>{option.label}</Text>
                    {option.value === 'json' && selectedCount > 1 && (
                      <Text type="secondary">(Exports all selected notes)</Text>
                    )}
                  </Space>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Card>

        <Card size="small" title="Options">
          <Space direction="vertical">
            <Checkbox
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
            >
              Include metadata (created date, tags, etc.)
            </Checkbox>
          </Space>
        </Card>

        {isExporting && (
          <div>
            <Text>Preparing your export...</Text>
            <Progress percent={progress} status="active" showInfo={false} />
          </div>
        )}

        {selectedCount > 1 && format !== 'json' && (
          <Text type="secondary">
            Note: Multiple notes will be exported as separate files in a ZIP archive
          </Text>
        )}
      </Space>
    </Modal>
  );
};
