import React, { useRef, useState, useEffect } from 'react';
import { Button, Card, Space, ColorPicker, Input, Modal, message, Upload, Typography } from 'antd';
import { 
  EditOutlined, 
  ClearOutlined, 
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  FontSizeOutlined,
  ShareAltOutlined,
  TeamOutlined,
  PictureOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface DrawingAction {
  type: 'draw' | 'erase' | 'rectangle' | 'circle' | 'line' | 'text' | 'image';
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  color: string;
  lineWidth: number;
  text?: string;
  fontSize?: number;
  imageData?: string;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
  actions: DrawingAction[];
}

const AdvancedWhiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text' | 'text' | 'image'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState<DrawingAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Layer 1', visible: true, opacity: 1, locked: false, actions: [] }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('1');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [collaborators] = useState<string[]>(['Alice', 'Bob']);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    redrawCanvas();
  }, [history, historyIndex, layers, backgroundColor]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear and set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all visible layers
    layers.filter(layer => layer.visible).forEach(layer => {
      if (layer.locked) return;
      
      ctx.globalAlpha = layer.opacity;
      
      layer.actions.forEach(action => {
        drawAction(ctx, action);
      });
    });

    ctx.globalAlpha = 1;
  };

  const drawAction = (ctx: CanvasRenderingContext2D, action: DrawingAction) => {
    ctx.strokeStyle = action.color;
    ctx.lineWidth = action.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (action.type) {
      case 'draw':
        if (action.points && action.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          action.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case 'erase':
        if (action.points && action.points.length > 0) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          action.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';
        }
        break;

      case 'rectangle':
        if (action.startX !== undefined && action.startY !== undefined && 
            action.endX !== undefined && action.endY !== undefined) {
          ctx.beginPath();
          ctx.rect(
            action.startX, 
            action.startY, 
            action.endX - action.startX, 
            action.endY - action.startY
          );
          ctx.stroke();
        }
        break;

      case 'circle':
        if (action.startX !== undefined && action.startY !== undefined && 
            action.endX !== undefined && action.endY !== undefined) {
          const radius = Math.sqrt(
            Math.pow(action.endX - action.startX, 2) + 
            Math.pow(action.endY - action.startY, 2)
          );
          ctx.beginPath();
          ctx.arc(action.startX, action.startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;

      case 'line':
        if (action.startX !== undefined && action.startY !== undefined && 
            action.endX !== undefined && action.endY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(action.startX, action.startY);
          ctx.lineTo(action.endX, action.endY);
          ctx.stroke();
        }
        break;

      case 'text':
        if (action.text && action.startX !== undefined && action.startY !== undefined) {
          ctx.font = `${action.fontSize}px Arial`;
          ctx.fillStyle = action.color;
          ctx.fillText(action.text, action.startX, action.startY);
        }
        break;

      case 'image':
        if (action.imageData && action.startX !== undefined && action.startY !== undefined) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, action.startX!, action.startY!, 100, 100);
          };
          img.src = action.imageData;
        }
        break;
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    if (currentTool === 'text') {
      setTextPosition(pos);
      setTextModalVisible(true);
      return;
    }

    setIsDrawing(true);
    setStartPoint(pos);

    if (currentTool === 'pen' || currentTool === 'eraser') {
      const action: DrawingAction = {
        type: currentTool === 'pen' ? 'draw' : 'erase',
        points: [pos],
        color: currentColor,
        lineWidth: currentTool === 'eraser' ? lineWidth * 3 : lineWidth
      };
      
      addToHistory(action);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      const lastAction = history[historyIndex];
      if (lastAction && (lastAction.type === 'draw' || lastAction.type === 'erase')) {
        const updatedAction = {
          ...lastAction,
          points: [...(lastAction.points || []), pos]
        };
        
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[historyIndex] = updatedAction;
          return newHistory;
        });
      }
    } else {
      // Preview shapes
      redrawCanvas();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = lineWidth;
      
      if (currentTool === 'rectangle') {
        ctx.beginPath();
        ctx.rect(startPoint.x, startPoint.y, pos.x - startPoint.x, pos.y - startPoint.y);
        ctx.stroke();
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - startPoint.x, 2) + Math.pow(pos.y - startPoint.y, 2));
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (currentTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const pos = getMousePos(e);
    
    if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line') {
      const action: DrawingAction = {
        type: currentTool,
        startX: startPoint.x,
        startY: startPoint.y,
        endX: pos.x,
        endY: pos.y,
        color: currentColor,
        lineWidth: lineWidth
      };
      
      addToHistory(action);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };

  const addToHistory = (action: DrawingAction) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(action);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
    
    // Add to active layer
    setLayers(prev => prev.map(layer => 
      layer.id === activeLayerId 
        ? { ...layer, actions: [...layer.actions, action] }
        : layer
    ));
  };

  const addText = () => {
    if (!textInput.trim() || !textPosition) return;
    
    const action: DrawingAction = {
      type: 'text',
      startX: textPosition.x,
      startY: textPosition.y,
      text: textInput,
      color: currentColor,
      fontSize: fontSize,
      lineWidth: lineWidth
    };
    
    addToHistory(action);
    setTextModalVisible(false);
    setTextInput('');
    setTextPosition(null);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  };

  const clearCanvas = () => {
    setHistory([]);
    setHistoryIndex(-1);
    setLayers(prev => prev.map(layer => ({ ...layer, actions: [] })));
  };

  const saveWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
    message.success('Whiteboard saved successfully!');
  };

  const addLayer = () => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      locked: false,
      actions: []
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const action: DrawingAction = {
        type: 'image',
        startX: 50,
        startY: 50,
        imageData: e.target?.result as string,
        color: currentColor,
        lineWidth: lineWidth
      };
      addToHistory(action);
      message.success('Image added to whiteboard!');
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Advanced Whiteboard</Title>
      
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Main Canvas Area */}
        <div style={{ flex: 1 }}>
          <Card title="Canvas" extra={
            <Space>
              {isCollaborating && (
                <Space>
                  <TeamOutlined />
                  <Text>{collaborators.length} collaborators</Text>
                </Space>
              )}
              <Button icon={<ShareAltOutlined />} onClick={() => setIsCollaborating(!isCollaborating)}>
                {isCollaborating ? 'Stop' : 'Share'}
              </Button>
            </Space>
          }>
            <canvas
              ref={canvasRef}
              style={{ 
                width: '100%', 
                height: 500, 
                border: '1px solid #d9d9d9',
                cursor: currentTool === 'text' ? 'text' : 'crosshair'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </Card>
        </div>

        {/* Tools Panel */}
        <div style={{ width: 300 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Drawing Tools */}
            <Card title="Tools">
              <Space wrap>
                <Button 
                  type={currentTool === 'pen' ? 'primary' : 'default'}
                  icon={<EditOutlined />}
                  onClick={() => setCurrentTool('pen')}
                >
                  Pen
                </Button>
                <Button 
                  type={currentTool === 'eraser' ? 'primary' : 'default'}
                  icon={<ClearOutlined />}
                  onClick={() => setCurrentTool('eraser')}
                >
                  Eraser
                </Button>
                <Button 
                  type={currentTool === 'rectangle' ? 'primary' : 'default'}
                  onClick={() => setCurrentTool('rectangle')}
                >
                  Rectangle
                </Button>
                <Button 
                  type={currentTool === 'circle' ? 'primary' : 'default'}
                  onClick={() => setCurrentTool('circle')}
                >
                  Circle
                </Button>
                <Button 
                  type={currentTool === 'line' ? 'primary' : 'default'}
                  onClick={() => setCurrentTool('line')}
                >
                  Line
                </Button>
                <Button 
                  type={currentTool === 'text' ? 'primary' : 'default'}
                  icon={<FontSizeOutlined />}
                  onClick={() => setCurrentTool('text')}
                >
                  Text
                </Button>
              </Space>
            </Card>

            {/* Color and Style */}
            <Card title="Style">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Color:</Text>
                  <ColorPicker 
                    value={currentColor} 
                    onChange={(color) => setCurrentColor(color.toHexString())}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                
                <div>
                  <Text>Line Width: {lineWidth}px</Text>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(parseInt(e.target.value))}
                    style={{ width: '100%', marginTop: 4 }}
                    title="Line Width"
                    placeholder="Line Width"
                  />
                </div>

                {currentTool === 'text' && (
                  <div>
                    <Text>Font Size: {fontSize}px</Text>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      style={{ width: '100%', marginTop: 4 }}
                      title="Font Size"
                      placeholder="Font Size"
                    />
                  </div>
                )}

                <div>
                  <Text>Background:</Text>
                  <ColorPicker 
                    value={backgroundColor} 
                    onChange={(color) => setBackgroundColor(color.toHexString())}
                    style={{ marginLeft: 8 }}
                  />
                </div>
              </Space>
            </Card>

            {/* Layers */}
            <Card title="Layers" extra={
              <Button size="small" onClick={addLayer}>
                Add Layer
              </Button>
            }>
              <Space direction="vertical" style={{ width: '100%' }}>
                {layers.map((layer) => (
                  <div 
                    key={layer.id}
                    style={{
                      padding: 8,
                      border: activeLayerId === layer.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      borderRadius: 4,
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveLayerId(layer.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong={activeLayerId === layer.id}>{layer.name}</Text>
                      <Space>
                        <Button
                          size="small"
                          type={layer.visible ? 'default' : 'primary'}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerVisibility(layer.id);
                          }}
                        >
                          {layer.visible ? 'Hide' : 'Show'}
                        </Button>
                        <Button
                          size="small"
                          type={layer.locked ? 'primary' : 'default'}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerLock(layer.id);
                          }}
                        >
                          {layer.locked ? 'Unlock' : 'Lock'}
                        </Button>
                      </Space>
                    </div>
                  </div>
                ))}
              </Space>
            </Card>

            {/* Actions */}
            <Card title="Actions">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Button icon={<UndoOutlined />} onClick={undo} disabled={historyIndex < 0}>
                    Undo
                  </Button>
                  <Button icon={<RedoOutlined />} onClick={redo} disabled={historyIndex >= history.length - 1}>
                    Redo
                  </Button>
                </Space>
                
                <Upload
                  accept="image/*"
                  beforeUpload={handleImageUpload}
                  showUploadList={false}
                >
                  <Button icon={<PictureOutlined />} block>
                    Add Image
                  </Button>
                </Upload>

                <Button icon={<SaveOutlined />} type="primary" onClick={saveWhiteboard} block>
                  Save Whiteboard
                </Button>
                
                <Button icon={<ClearOutlined />} danger onClick={clearCanvas} block>
                  Clear All
                </Button>
              </Space>
            </Card>
          </Space>
        </div>
      </div>

      {/* Text Input Modal */}
      <Modal
        title="Add Text"
        open={textModalVisible}
        onOk={addText}
        onCancel={() => {
          setTextModalVisible(false);
          setTextInput('');
          setTextPosition(null);
        }}
      >
        <TextArea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enter your text here..."
          rows={3}
        />
      </Modal>
    </div>
  );
};

export default AdvancedWhiteboard;
