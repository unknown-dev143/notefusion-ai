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
  type: 'draw' | 'erase' | 'rectangle' | 'circle' | 'line' | 'bar-chart' | 'line-chart' | 'pie-chart' | 'scatter-chart' | 'area-chart' | 'text' | 'arrow' | 'triangle' | 'star' | 'image' | 'sticky-note' | 'recognized-shape';
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
  recognizedShape?: string;
  confidence?: number;
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
  const [enableShapeRecognition, setEnableShapeRecognition] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  // Shape recognition algorithms
  const recognizeShape = (points: { x: number; y: number }[]): { shape: string; confidence: number; bounds?: any } => {
    if (points.length < 3) return { shape: 'unknown', confidence: 0 };

    const bounds = getBoundingBox(points);
    const aspectRatio = bounds.width / bounds.height;
    const closedShape = isClosedShape(points);
    const corners = detectCorners(points);
    
    // Check for rectangle
    if (closedShape && corners.length === 4 && isRectangular(corners)) {
      return { shape: 'rectangle', confidence: 0.9, bounds };
    }
    
    // Check for square
    if (closedShape && corners.length === 4 && Math.abs(aspectRatio - 1) < 0.2) {
      return { shape: 'square', confidence: 0.85, bounds };
    }
    
    // Check for circle
    if (closedShape && isCircular(points, bounds)) {
      return { shape: 'circle', confidence: 0.8, bounds };
    }
    
    // Check for triangle
    if (closedShape && corners.length === 3) {
      return { shape: 'triangle', confidence: 0.75, bounds };
    }
    
    // Check for line
    if (!closedShape && isLinear(points)) {
      return { shape: 'line', confidence: 0.85, bounds };
    }
    
    // Check for arrow
    if (!closedShape && isArrow(points)) {
      return { shape: 'arrow', confidence: 0.7, bounds };
    }
    
    return { shape: 'freehand', confidence: 0.5 };
  };

  const getBoundingBox = (points: { x: number; y: number }[]) => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
      centerX: (Math.min(...xs) + Math.max(...xs)) / 2,
      centerY: (Math.min(...ys) + Math.max(...ys)) / 2
    };
  };

  const isClosedShape = (points: { x: number; y: number }[]): boolean => {
    if (points.length < 3) return false;
    const first = points[0];
    const last = points[points.length - 1];
    const distance = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2));
    return distance < 30; // Threshold for closed shape
  };

  const detectCorners = (points: { x: number; y: number }[]): { x: number; y: number }[] => {
    const corners: { x: number; y: number }[] = [];
    const angleThreshold = 45; // degrees
    
    for (let i = 1; i < points.length - 1; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const p3 = points[i + 1];
      
      const angle = getAngle(p1, p2, p3);
      if (angle < 180 - angleThreshold) {
        corners.push(p2);
      }
    }
    
    return corners;
  };

  const getAngle = (p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }): number => {
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = Math.abs(angle1 - angle2) * (180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  const isRectangular = (corners: { x: number; y: number }[]): boolean => {
    if (corners.length !== 4) return false;
    
    // Check if corners form approximately right angles
    let rightAngles = 0;
    for (let i = 0; i < 4; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      const p3 = corners[(i + 2) % 4];
      
      const angle = getAngle(p1, p2, p3);
      if (Math.abs(angle - 90) < 20) {
        rightAngles++;
      }
    }
    
    return rightAngles >= 3;
  };

  const isCircular = (points: { x: number; y: number }[], bounds: any): boolean => {
    const centerX = bounds.centerX;
    const centerY = bounds.centerY;
    const avgRadius = (bounds.width + bounds.height) / 4;
    
    let variance = 0;
    points.forEach(point => {
      const distance = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2));
      variance += Math.pow(distance - avgRadius, 2);
    });
    
    variance /= points.length;
    return variance < avgRadius * avgRadius * 0.1; // Threshold for circularity
  };

  const isLinear = (points: { x: number; y: number }[]): boolean => {
    if (points.length < 2) return false;
    
    const p1 = points[0];
    const p2 = points[points.length - 1];
    
    let totalDeviation = 0;
    points.forEach(point => {
      const deviation = pointToLineDistance(point, p1, p2);
      totalDeviation += deviation;
    });
    
    const avgDeviation = totalDeviation / points.length;
    return avgDeviation < 10; // Threshold for linearity
  };

  const pointToLineDistance = (point: { x: number; y: number }, lineStart: { x: number; y: number }, lineEnd: { x: number; y: number }): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }
    
    const dx = point.x - xx;
    const dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  };

  const isArrow = (points: { x: number; y: number }[]): boolean => {
    if (points.length < 5) return false;
    
    // Check if the last few points form an arrowhead
    const lastPoints = points.slice(-5);
    const angleThreshold = 30;
    
    // Check for V-shape at the end
    const p1 = lastPoints[0];
    const p2 = lastPoints[2]; // Potential arrow tip
    const p3 = lastPoints[4];
    
    const angle = getAngle(p1, p2, p3);
    return angle < 180 - angleThreshold;
  };

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
      } else if (action.type === 'recognized-shape' && action.recognizedShape && action.startX !== undefined) {
        // Draw recognized shapes
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.lineWidth;
        ctx.lineCap = 'round';
        
        switch (action.recognizedShape) {
          case 'rectangle':
          case 'square':
            ctx.beginPath();
            ctx.rect(action.startX, action.startY!, action.endX! - action.startX, action.endY! - action.startY!);
            ctx.stroke();
            break;
          case 'circle':
            const radius = Math.sqrt(
              Math.pow(action.endX! - action.startX, 2) + 
              Math.pow(action.endY! - action.startY!, 2)
            );
            ctx.beginPath();
            ctx.arc(action.startX, action.startY!, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(action.startX + (action.endX! - action.startX) / 2, action.startY!);
            ctx.lineTo(action.startX, action.endY!);
            ctx.lineTo(action.endX!, action.endY!);
            ctx.closePath();
            ctx.stroke();
            break;
          case 'line':
            ctx.beginPath();
            ctx.moveTo(action.startX, action.startY!);
            ctx.lineTo(action.endX!, action.endY!);
            ctx.stroke();
            break;
          case 'arrow':
            // Draw arrow line
            ctx.beginPath();
            ctx.moveTo(action.startX, action.startY!);
            ctx.lineTo(action.endX!, action.endY!);
            ctx.stroke();
            
            // Draw arrowhead
            const headLength = 15;
            const angle = Math.atan2(action.endY! - action.startY!, action.endX! - action.startX);
            ctx.beginPath();
            ctx.moveTo(action.endX!, action.endY!);
            ctx.lineTo(action.endX! - headLength * Math.cos(angle - Math.PI / 6), action.endY! - headLength * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(action.endX!, action.endY!);
            ctx.lineTo(action.endX! - headLength * Math.cos(angle + Math.PI / 6), action.endY! - headLength * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
            break;
        }
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
    
    if (enableShapeRecognition && currentTool === 'draw') {
      setCurrentPoints([{ x, y }]);
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
      
      // Track points for shape recognition
      if (enableShapeRecognition && currentTool === 'draw') {
        setCurrentPoints(prev => [...prev, { x, y }]);
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

    // Apply shape recognition if enabled
    if (enableShapeRecognition && currentTool === 'draw' && currentPoints.length > 2) {
      const recognized = recognizeShape(currentPoints);
      
      if (recognized.confidence > 0.7 && recognized.shape !== 'freehand') {
        // Replace the freehand drawing with recognized shape
        const newHistory = history.slice(0, historyIndex);
        const shapeAction: DrawingAction = {
          type: 'recognized-shape',
          recognizedShape: recognized.shape,
          confidence: recognized.confidence,
          color: currentColor,
          lineWidth: lineWidth,
          startX: recognized.bounds?.minX,
          startY: recognized.bounds?.minY,
          endX: recognized.bounds?.maxX,
          endY: recognized.bounds?.maxY
        };
        
        newHistory.push(shapeAction);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setCurrentPoints([]);
        setIsDrawing(false);
        return;
      }
    }

    // Regular drawing logic
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

          <Switch
            checked={enableShapeRecognition}
            onChange={setEnableShapeRecognition}
            checkedChildren="Shape AI"
            unCheckedChildren="Manual"
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
