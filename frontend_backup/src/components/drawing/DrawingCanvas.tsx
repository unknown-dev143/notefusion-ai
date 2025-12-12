import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, InputRef, Slider, Space, Popover, ColorPicker } from 'antd';
import {
  BorderInnerOutlined,
  BorderOutlined,
  ClearOutlined,
  CloseOutlined,
  EditOutlined,
  FontColorsOutlined,
  HighlightOutlined,
  LineOutlined,
  RedoOutlined,
  SaveOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import styles from './DrawingCanvas.module.css';

type Point = { x: number; y: number };
type Tool = 'pen' | 'line' | 'rectangle' | 'circle' | 'text' | 'eraser';

interface DrawingAction {
  tool: Tool;
  points: Point[];
  color: string;
  size: number;
  text?: string;
}

interface DrawingCanvasProps {
  width?: number | string;
  height?: number | string;
  initialColor?: string;
  initialSize?: number;
  onSave?: (dataUrl: string) => void;
  onClose?: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width = '100%',
  height = '400px',
  initialColor = '#000000',
  initialSize = 3,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<InputRef>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [color, setColor] = useState(initialColor || '#000000');
  const [size, setSize] = useState(initialSize || 5);
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [history, setHistory] = useState<DrawingAction[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
      redraw();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    actions.forEach((action) => {
      drawAction(ctx, action);
    });
  };

  const drawAction = (ctx: CanvasRenderingContext2D, action: DrawingAction) => {
    const { tool, points, color, size, text } = action;
    if (!points || points.length === 0) return;

    const defaultColor = color || '#000000';
    const defaultSize = size || 5;
    
    // Set drawing styles with type safety
    ctx.strokeStyle = defaultColor;
    ctx.fillStyle = defaultColor;
    ctx.lineWidth = defaultSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (tool) {
      case 'pen':
      case 'eraser':
        if (points.length > 0) {
          ctx.beginPath();
          const firstPoint = points[0];
          if (firstPoint) {
            ctx.moveTo(firstPoint.x, firstPoint.y);
            for (let i = 1; i < points.length; i++) {
              const point = points[i];
              if (point) {
                ctx.lineTo(point.x, point.y);
              }
            }
            ctx.stroke();
          }
        }
        break;

      case 'line':
        if (points.length >= 2) {
          const startPoint = points[0];
          const endPoint = points[points.length - 1];
          if (startPoint && endPoint) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
          }
        }
        break;

      case 'rectangle':
        if (points.length >= 2) {
          const start = points[0];
          const end = points[points.length - 1];
          if (start && end) {
            const width = end.x - start.x;
            const height = end.y - start.y;
            ctx.strokeRect(start.x, start.y, width, height);
          }
        }
        break;

      case 'circle':
        if (points.length >= 2) {
          const start = points[0];
          const end = points[points.length - 1];
          if (start && end) {
            const radius = Math.sqrt(
              Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
            );
            ctx.beginPath();
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }
        break;

      case 'text':
        const textPoint = points[0];
        if (text && textPoint) {
          const fontSize = size ? size * 4 : 16; // Default to 16px if size is not provided
          ctx.font = `${fontSize}px Arial`;
          ctx.fillText(text, textPoint.x, textPoint.y);
        }
        break;
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'text') {
      setTextPosition(getMousePos(e));
      return;
    }

    const point = getMousePos(e);
    const newAction: DrawingAction = {
      tool: currentTool,
      points: [point],
      color: currentTool === 'eraser' ? '#FFFFFF' : color,
      size: currentTool === 'eraser' ? size * 2 : size,
    };

    setActions((prevActions) => [...prevActions, newAction]);
    setIsDrawing(true);

    if (historyIndex < history.length - 1) {
      setHistory((prevHistory) => prevHistory.slice(0, historyIndex + 1));
    }

    setHistory((prev) => [...prev, [...actions, newAction]]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getMousePos(e);
    setActions((prev) => {
      const newActions = [...prev];
      const currentAction = newActions[newActions.length - 1];

      if (currentAction) {
        currentAction.points = [...currentAction.points, point];
      }

      redraw();
      return newActions;
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    redraw();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setActions(history[historyIndex - 1] || []);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setActions(history[historyIndex + 1] || []);
    }
  };

  const handleClear = () => {
    setActions([]);
    setHistory((prev) => [...prev, []]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleTextConfirm = () => {
    if (!textPosition || !textInput.trim()) {
      setTextPosition(null);
      setTextInput('');
      return;
    }

    const newAction: DrawingAction = {
      tool: 'text',
      points: [textPosition],
      color,
      size,
      text: textInput,
    };

    setActions((prev) => [...prev, newAction]);
    setHistory((prev) => [...prev, [...actions, newAction]]);
    setHistoryIndex((prev) => prev + 1);
    setTextPosition(null);
    setTextInput('');
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave?.(dataUrl);
  };

  const tools = [
    { tool: 'pen', icon: <EditOutlined />, label: 'Pen' },
    { tool: 'line', icon: <LineOutlined />, label: 'Line' },
    { tool: 'rectangle', icon: <BorderOutlined />, label: 'Rectangle' },
    { tool: 'circle', icon: <BorderInnerOutlined />, label: 'Circle' },
    { tool: 'text', icon: <FontColorsOutlined />, label: 'Text' },
    { tool: 'eraser', icon: <HighlightOutlined />, label: 'Eraser' },
  ];

  // Canvas dimensions are now handled by CSS modules

  // Set CSS variables for text input modal positioning
  const textInputStyle = textPosition ? {
    '--modal-left': `${textPosition.x}px`,
    '--modal-top': `${textPosition.y}px`,
    display: 'block',
  } : { display: 'none' };

  return (
    <div className={styles['drawingCanvas']}>
      {/* Toolbar */}
      <div className={styles['toolbar']}>
        {/* Tools */}
        <div className={styles['toolsContainer']}>
          {tools.map(({ tool, icon, label }) => (
            <Button
              key={tool}
              type={currentTool === tool ? 'primary' : 'default'}
              icon={icon}
              onClick={() => setCurrentTool(tool as Tool)}
              title={label}
              size="small"
            />
          ))}
        </div>

        {/* Color Picker */}
        <Popover
          content={
            <ColorPicker
              value={color}
              onChange={(color) => setColor(color.toHexString())}
              showText
            />
          }
          trigger="click"
          placement="bottomLeft"
        >
          <Button size="small" style={{ backgroundColor: color }}>
            <div className="w-4 h-4 border border-gray-300" />
          </Button>
        </Popover>

        {/* Size Slider */}
        <div className="w-24">
          <Slider
            min={1}
            max={20}
            value={size}
            onChange={setSize}
            tooltip={{ formatter: (value) => `${value}px` }}
          />
        </div>

        <div className="flex-1" />

        {/* Action Buttons */}
        <Space>
          <Button
            icon={<UndoOutlined />}
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            size="small"
            title="Undo"
          />
          <Button
            icon={<RedoOutlined />}
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            size="small"
            title="Redo"
          />
          <Button
            icon={<ClearOutlined />}
            onClick={handleClear}
            size="small"
            danger
            title="Clear"
          />
          {onSave && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              size="small"
            >
              Save
            </Button>
          )}
          {onClose && (
            <Button
              icon={<CloseOutlined />}
              onClick={onClose}
              size="small"
              danger
            />
          )}
        </Space>
      </div>

      {/* Canvas Container */}
      <div className={styles['canvasContainer']}>
        <canvas
          ref={canvasRef}
          className={styles['canvas']}
          width={typeof width === 'number' ? width : 800} // Default width if not specified
          height={typeof height === 'number' ? height : 600} // Default height if not specified
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Text Input Modal */}
        <div
          className={`${styles['textInputModal']} ${styles['positionedModal']}`}
          style={textInputStyle as React.CSSProperties}
        >
          <Input
            ref={textInputRef}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onPressEnter={handleTextConfirm}
            className={styles['textInput']}
            autoFocus
            placeholder="Enter text..."
          />
          <div className={styles['textInputActions']}>
            <Button
              size="small"
              onClick={() => setTextPosition(null)}
              danger
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={handleTextConfirm}
            >
              Add Text
            </Button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default DrawingCanvas;
