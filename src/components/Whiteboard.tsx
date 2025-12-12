import React, { useRef, useState, useEffect } from 'react';
import { Button, Card, Space, Select, ColorPicker, Divider, Switch } from 'antd';
import { 
  EditOutlined, 
  ClearOutlined, 
  SaveOutlined,
  UndoOutlined,
  RedoOutlined
} from '@ant-design/icons';

interface DrawingAction {
  type: 'draw' | 'erase' | 'rectangle' | 'circle' | 'line' | 'bar-chart' | 'line-chart' | 'pie-chart' | 'scatter-chart' | 'area-chart' | 'text' | 'arrow' | 'triangle' | 'star' | 'image' | 'sticky-note';
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  color: string;
  lineWidth: number;
  data?: number[][];
  chartBounds?: { x: number; y: number; width: number; height: number };
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  imageData?: string;
  noteColor?: string;
  id?: string;
  author?: string;
  timestamp?: string;
  x?: number;
  y?: number;
}

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'draw' | 'erase' | 'rectangle' | 'circle' | 'line' | 'bar-chart' | 'line-chart' | 'pie-chart' | 'scatter-chart' | 'area-chart'>('draw');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState<DrawingAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw history
    history.slice(0, historyIndex + 1).forEach(action => {
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.lineWidth;
      ctx.lineCap = 'round';

      if (action.type === 'draw' && action.points) {
        ctx.beginPath();
        action.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      } else if (action.type === 'erase' && action.points) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        action.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      } else if (action.type === 'rectangle' && action.startX !== undefined) {
        ctx.beginPath();
        ctx.rect(action.startX, action.startY!, action.endX! - action.startX, action.endY! - action.startY!);
        ctx.stroke();
      } else if (action.type === 'circle' && action.startX !== undefined) {
        const radius = Math.sqrt(
          Math.pow(action.endX! - action.startX, 2) + 
          Math.pow(action.endY! - action.startY!, 2)
        );
        ctx.beginPath();
        ctx.arc(action.startX, action.startY!, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (action.type === 'line' && action.startX !== undefined) {
        ctx.beginPath();
        ctx.moveTo(action.startX, action.startY!);
        ctx.lineTo(action.endX!, action.endY!);
        ctx.stroke();
      } else if (action.type === 'bar-chart' && action.data && action.chartBounds) {
        drawBarChart(ctx, action.data, action.chartBounds, action.color);
      } else if (action.type === 'line-chart' && action.data && action.chartBounds) {
        drawLineChart(ctx, action.data, action.chartBounds, action.color);
      } else if (action.type === 'pie-chart' && action.data && action.chartBounds) {
        drawPieChart(ctx, action.data, action.chartBounds);
      } else if (action.type === 'scatter-chart' && action.data && action.chartBounds) {
        drawScatterChart(ctx, action.data, action.chartBounds, action.color);
      } else if (action.type === 'area-chart' && action.data && action.chartBounds) {
        drawAreaChart(ctx, action.data, action.chartBounds, action.color);
      }
    });

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }
  }, [history, historyIndex, showGrid]);

  // Chart drawing functions
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    const gridSize = 20;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawBarChart = (ctx: CanvasRenderingContext2D, data: number[][], bounds: { x: number; y: number; width: number; height: number }, color: string) => {
    const { x, y, width, height } = bounds;
    const barWidth = width / data.length;
    const maxValue = Math.max(...data.map(d => d[1]));

    ctx.fillStyle = color;
    data.forEach((point, index) => {
      const barHeight = (point[1] / maxValue) * height;
      const barX = x + index * barWidth;
      const barY = y + height - barHeight;
      ctx.fillRect(barX, barY, barWidth * 0.8, barHeight);
    });
  };

  const drawLineChart = (ctx: CanvasRenderingContext2D, data: number[][], bounds: { x: number; y: number; width: number; height: number }, color: string) => {
    const { x, y, width, height } = bounds;
    const maxValue = Math.max(...data.map(d => d[1]));

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const pointX = x + (index / (data.length - 1)) * width;
      const pointY = y + height - (point[1] / maxValue) * height;
      
      if (index === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    });
    ctx.stroke();
  };

  const drawPieChart = (ctx: CanvasRenderingContext2D, data: number[][], bounds: { x: number; y: number; width: number; height: number }) => {
    const { x, y, width, height } = bounds;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;
    const total = data.reduce((sum, point) => sum + point[1], 0);
    let currentAngle = -Math.PI / 2;

    const colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

    data.forEach((point, index) => {
      const sliceAngle = (point[1] / total) * 2 * Math.PI;
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      currentAngle += sliceAngle;
    });
  };

  const drawScatterChart = (ctx: CanvasRenderingContext2D, data: number[][], bounds: { x: number; y: number; width: number; height: number }, color: string) => {
    const { x, y, width, height } = bounds;
    const maxX = Math.max(...data.map(d => d[0]));
    const maxY = Math.max(...data.map(d => d[1]));

    ctx.fillStyle = color;
    data.forEach(point => {
      const pointX = x + (point[0] / maxX) * width;
      const pointY = y + height - (point[1] / maxY) * height;
      ctx.beginPath();
      ctx.arc(pointX, pointY, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawAreaChart = (ctx: CanvasRenderingContext2D, data: number[][], bounds: { x: number; y: number; width: number; height: number }, color: string) => {
    const { x, y, width, height } = bounds;
    const maxValue = Math.max(...data.map(d => d[1]));

    ctx.fillStyle = color + '40';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const pointX = x + (index / (data.length - 1)) * width;
      const pointY = y + height - (point[1] / maxValue) * height;
      
      if (index === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    });
    
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });

    if (currentTool === 'draw' || currentTool === 'erase') {
      const newAction: DrawingAction = {
        type: currentTool,
        points: [{ x, y }],
        color: currentTool === 'erase' ? 'white' : currentColor,
        lineWidth: currentTool === 'erase' ? lineWidth * 3 : lineWidth
      };
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newAction);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'draw' || currentTool === 'erase') {
      const newHistory = [...history];
      const currentAction = newHistory[historyIndex];
      
      if (currentAction && currentAction.points) {
        currentAction.points.push({ x, y });
        setHistory(newHistory);
      }
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line' || currentTool.includes('chart')) {
      if (currentTool.includes('chart')) {
        // Generate sample data for chart
        const sampleData = generateSampleData(currentTool);
        const chartBounds = {
          x: startPoint!.x - 50,
          y: startPoint!.y - 50,
          width: Math.abs(x - startPoint!.x) + 100,
          height: Math.abs(y - startPoint!.y) + 100
        };

        const newAction: DrawingAction = {
          type: currentTool as any,
          data: sampleData,
          chartBounds,
          color: currentColor,
          lineWidth
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newAction);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      } else {
        const newAction: DrawingAction = {
        type: currentTool,
        startX: startPoint?.x,
        startY: startPoint?.y,
        endX: x,
        endY: y,
        color: currentColor,
        lineWidth
      };

      const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newAction);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const generateSampleData = (chartType: string): number[][] => {
    switch (chartType) {
      case 'bar-chart':
        return [[0, 30], [1, 50], [2, 80], [3, 40], [4, 70], [5, 60]];
      case 'line-chart':
        return [[0, 20], [1, 35], [2, 45], [3, 30], [4, 60], [5, 75]];
      case 'pie-chart':
        return [[0, 30], [1, 25], [2, 20], [3, 15], [4, 10]];
      case 'scatter-chart':
        return [[10, 20], [25, 35], [40, 30], [55, 45], [70, 60], [85, 50]];
      case 'area-chart':
        return [[0, 15], [1, 25], [2, 35], [3, 30], [4, 45], [5, 55]];
      default:
        return [[0, 50], [1, 60], [2, 40], [3, 70], [4, 55]];
    }
  };

  const clearCanvas = () => {
    setHistory([]);
    setHistoryIndex(-1);
  };

  const undo = () => {
    if (historyIndex > -1) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const saveWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Card 
      title={
        <Space>
          <EditOutlined />
          <span>Whiteboard</span>
        </Space>
      }
      style={{ height: '100%' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Toolbar */}
        <Space wrap>
          <Select
            value={currentTool}
            onChange={setCurrentTool}
            style={{ width: 140 }}
          >
            <Select.Option value="draw">Pen</Select.Option>
            <Select.Option value="erase">Eraser</Select.Option>
            <Select.Option value="rectangle">Rectangle</Select.Option>
            <Select.Option value="circle">Circle</Select.Option>
            <Select.Option value="line">Line</Select.Option>
            <Select.Option value="bar-chart">Bar Chart</Select.Option>
            <Select.Option value="line-chart">Line Chart</Select.Option>
            <Select.Option value="pie-chart">Pie Chart</Select.Option>
            <Select.Option value="scatter-chart">Scatter</Select.Option>
            <Select.Option value="area-chart">Area Chart</Select.Option>
          </Select>

          <ColorPicker
            value={currentColor}
            onChange={(color) => setCurrentColor(color.toHexString())}
            disabled={currentTool === 'erase'}
          />

          <Select
            value={lineWidth}
            onChange={setLineWidth}
            style={{ width: 100 }}
          >
            <Select.Option value={1}>Thin</Select.Option>
            <Select.Option value={2}>Medium</Select.Option>
            <Select.Option value={4}>Thick</Select.Option>
            <Select.Option value={8}>Extra Thick</Select.Option>
          </Select>

          <Divider type="vertical" />

          <Switch
            checked={showGrid}
            onChange={setShowGrid}
            checkedChildren="Grid"
            unCheckedChildren="No Grid"
          />

          <Divider type="vertical" />

          <Button icon={<UndoOutlined />} onClick={undo} disabled={historyIndex < 0}>
            Undo
          </Button>
          <Button icon={<RedoOutlined />} onClick={redo} disabled={historyIndex >= history.length - 1}>
            Redo
          </Button>
          <Button icon={<ClearOutlined />} onClick={clearCanvas}>
            Clear
          </Button>
          <Button icon={<SaveOutlined />} onClick={saveWhiteboard} type="primary">
            Save
          </Button>
        </Space>

        {/* Canvas */}
        <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}>
          <canvas
            ref={canvasRef}
            style={{ 
              width: '100%', 
              height: '500px',
              cursor: currentTool === 'erase' ? 'grab' : 'crosshair'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </Space>
    </Card>
  );
};

export default Whiteboard;
