import React, { useState } from 'react';
import { Button, Popover, Space, message } from 'antd';
import { PictureOutlined, CloseOutlined } from '@ant-design/icons';
import DrawingCanvas from './DrawingCanvas';

interface DrawingPanelProps {
  onInsert: (imageData: string) => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  className?: string;
}

const DrawingPanel: React.FC<DrawingPanelProps> = ({
  onInsert,
  buttonText = 'Add Drawing',
  buttonIcon = <PictureOutlined />,
  className = '',
}) => {
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [drawingData, setDrawingData] = useState<string | null>(null);

  const handleSave = (data: string) => {
    setDrawingData(data);
    message.success('Drawing saved. Click "Insert" to add to note.');
  };

  const handleInsert = () => {
    if (drawingData) {
      onInsert(drawingData);
      setDrawingData(null);
      setIsDrawingOpen(false);
      message.success('Drawing inserted into note');
    }
  };

  const content = (
    <div className="w-[600px] max-w-full">
      <div className="mb-4">
        <DrawingCanvas
          width="100%"
          height="400px"
          onSave={handleSave}
          onClose={() => setIsDrawingOpen(false)}
        />
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <Button onClick={() => setIsDrawingOpen(false)}>Cancel</Button>
        <Button 
          type="primary" 
          onClick={handleInsert}
          disabled={!drawingData}
        >
          Insert Drawing
        </Button>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <Popover
        content={content}
        title={
          <div className="flex justify-between items-center">
            <span>Create Drawing</span>
            <Button 
              type="text" 
              size="small" 
              icon={<CloseOutlined />} 
              onClick={() => setIsDrawingOpen(false)}
            />
          </div>
        }
        trigger="click"
        open={isDrawingOpen}
        onOpenChange={setIsDrawingOpen}
        overlayStyle={{ width: '650px' }}
        overlayInnerStyle={{ padding: '12px' }}
        placement="bottomRight"
      >
        <Button icon={buttonIcon}>
          {buttonText}
        </Button>
      </Popover>
    </div>
  );
};

export default DrawingPanel;
