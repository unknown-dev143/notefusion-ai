import React, { useRef, useState, useEffect } from 'react';
import { Card, Button, Space, Select, ColorPicker, Divider, Switch, Input, InputNumber, Dropdown, Menu, message } from 'antd';
import { 
  EditOutlined, 
  ClearOutlined, 
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  FontSizeOutlined,
  GlobalOutlined,
  TeamOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  FullscreenOutlined,
  StarOutlined,
  HeartOutlined,
  BulbOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

interface DrawingAction {
  type: 'draw' | 'erase' | 'rectangle' | 'circle' | 'line' | 'bar-chart' | 'line-chart' | 'pie-chart' | 'scatter-chart' | 'area-chart' | 'text' | 'arrow' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'heart' | 'cloud' | 'comment';
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
  backgroundColor?: string;
  author?: string;
  timestamp?: string;
}

interface CollaborativeUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'draw' | 'erase' | 'rectangle' | 'circle' | 'line' | 'bar-chart' | 'line-chart' | 'pie-chart' | 'scatter-chart' | 'area-chart' | 'text' | 'arrow' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'heart' | 'cloud' | 'comment'>('draw');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [history, setHistory] = useState<DrawingAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [language, setLanguage] = useState('en');
  const [collaborativeMode, setCollaborativeMode] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const collaborativeUsers: CollaborativeUser[] = [
    { id: '1', name: 'You', color: '#1890ff' },
    { id: '2', name: 'Alice', color: '#52c41a' },
    { id: '3', name: 'Bob', color: '#fa8c16' }
  ];

  const translations = {
    en: {
      title: 'Whiteboard',
      pen: 'Pen',
      eraser: 'Eraser',
      rectangle: 'Rectangle',
      circle: 'Circle',
      line: 'Line',
      text: 'Text',
      arrow: 'Arrow',
      triangle: 'Triangle',
      pentagon: 'Pentagon',
      hexagon: 'Hexagon',
      star: 'Star',
      heart: 'Heart',
      cloud: 'Cloud',
      comment: 'Comment',
      barChart: 'Bar Chart',
      lineChart: 'Line Chart',
      pieChart: 'Pie Chart',
      scatterChart: 'Scatter',
      areaChart: 'Area Chart',
      thin: 'Thin',
      medium: 'Medium',
      thick: 'Thick',
      extraThick: 'Extra Thick',
      grid: 'Grid',
      noGrid: 'No Grid',
      undo: 'Undo',
      redo: 'Redo',
      clear: 'Clear',
      save: 'Save',
      export: 'Export',
      import: 'Import',
      share: 'Share',
      zoom: 'Zoom',
      fullscreen: 'Fullscreen',
      collaborative: 'Collaborative',
      backgroundColor: 'Background',
      fontSize: 'Font Size',
      fontFamily: 'Font Family',
      enterText: 'Enter text here...'
    },
    es: {
      title: 'Pizarra',
      pen: 'Lápiz',
      eraser: 'Borrador',
      rectangle: 'Rectángulo',
      circle: 'Círculo',
      line: 'Línea',
      text: 'Texto',
      arrow: 'Flecha',
      triangle: 'Triángulo',
      pentagon: 'Pentágono',
      hexagon: 'Hexágono',
      star: 'Estrella',
      heart: 'Corazón',
      cloud: 'Nube',
      comment: 'Comentario',
      barChart: 'Gráfico de Barras',
      lineChart: 'Gráfico de Líneas',
      pieChart: 'Gráfico Circular',
      scatterChart: 'Dispersión',
      areaChart: 'Gráfico de Área',
      thin: 'Delgado',
      medium: 'Medio',
      thick: 'Grueso',
      extraThick: 'Muy Grueso',
      grid: 'Cuadrícula',
      noGrid: 'Sin Cuadrícula',
      undo: 'Deshacer',
      redo: 'Rehacer',
      clear: 'Limpiar',
      save: 'Guardar',
      export: 'Exportar',
      import: 'Importar',
      share: 'Compartir',
      zoom: 'Zoom',
      fullscreen: 'Pantalla Completa',
      collaborative: 'Colaborativo',
      backgroundColor: 'Fondo',
      fontSize: 'Tamaño de Fuente',
      fontFamily: 'Tipo de Fuente',
      enterText: 'Ingrese texto aquí...'
    },
    fr: {
      title: 'Tableau Blanc',
      pen: 'Stylo',
      eraser: 'Gomme',
      rectangle: 'Rectangle',
      circle: 'Cercle',
      line: 'Ligne',
      text: 'Texte',
      arrow: 'Flèche',
      triangle: 'Triangle',
      pentagon: 'Pentagone',
      hexagon: 'Hexagone',
      star: 'Étoile',
      heart: 'Cœur',
      cloud: 'Nuage',
      comment: 'Commentaire',
      barChart: 'Graphique en Barres',
      lineChart: 'Graphique Linéaire',
      pieChart: 'Graphique Circulaire',
      scatterChart: 'Nuage de Points',
      areaChart: 'Graphique en Aire',
      thin: 'Fin',
      medium: 'Moyen',
      thick: 'Épais',
      extraThick: 'Très Épais',
      grid: 'Grille',
      noGrid: 'Sans Grille',
      undo: 'Annuler',
      redo: 'Refaire',
      clear: 'Effacer',
      save: 'Sauvegarder',
      export: 'Exporter',
      import: 'Importer',
      share: 'Partager',
      zoom: 'Zoom',
      fullscreen: 'Plein Écran',
      collaborative: 'Collaboratif',
      backgroundColor: 'Arrière-plan',
      fontSize: 'Taille de Police',
      fontFamily: 'Police de Caractère',
      enterText: 'Entrez le texte ici...'
    },
    zh: {
      title: '白板',
      pen: '画笔',
      eraser: '橡皮擦',
      rectangle: '矩形',
      circle: '圆形',
      line: '直线',
      text: '文本',
      arrow: '箭头',
      triangle: '三角形',
      pentagon: '五边形',
      hexagon: '六边形',
      star: '星形',
      heart: '心形',
      cloud: '云朵',
      comment: '评论',
      barChart: '柱状图',
      lineChart: '折线图',
      pieChart: '饼图',
      scatterChart: '散点图',
      areaChart: '面积图',
      thin: '细',
      medium: '中',
      thick: '粗',
      extraThick: '特粗',
      grid: '网格',
      noGrid: '无网格',
      undo: '撤销',
      redo: '重做',
      clear: '清空',
      save: '保存',
      export: '导出',
      import: '导入',
      share: '分享',
      zoom: '缩放',
      fullscreen: '全屏',
      collaborative: '协作',
      backgroundColor: '背景色',
      fontSize: '字体大小',
      fontFamily: '字体',
      enterText: '在此输入文本...'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    redrawCanvas(ctx);
  }, [backgroundColor, showGrid, zoom]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    const gridSize = 20 * (zoom / 100);
    
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

  const redrawCanvas = (ctx: CanvasRenderingContext2D) => {
    const actionsToRender = history.slice(0, historyIndex + 1);
    
    actionsToRender.forEach(action => {
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.lineWidth;
      ctx.fillStyle = action.color;
      
      if (action.backgroundColor) {
        ctx.fillStyle = action.backgroundColor;
      }

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
          
        case 'text':
          if (action.text) {
            ctx.font = `${action.fontSize}px ${action.fontFamily}`;
            ctx.fillStyle = action.color;
            ctx.fillText(action.text, action.startX || 0, action.startY || 0);
          }
          break;
          
        case 'arrow':
          if (action.startX && action.startY && action.endX && action.endY) {
            drawArrow(ctx, action.startX, action.startY, action.endX, action.endY);
          }
          break;
          
        case 'star':
          if (action.startX && action.startY && action.endX && action.endY) {
            drawStar(ctx, action.startX, action.startY, action.endX, action.endY);
          }
          break;
          
        case 'heart':
          if (action.startX && action.startY && action.endX && action.endY) {
            drawHeart(ctx, action.startX, action.startY, action.endX, action.endY);
          }
          break;
          
        case 'cloud':
          if (action.startX && action.startY && action.endX && action.endY) {
            drawCloud(ctx, action.startX, action.startY, action.endX, action.endY);
          }
          break;
      }
    });
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => {
    const headLength = 15;
    const angle = Math.atan2(endY - startY, endX - startX);
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, ex: number, ey: number) => {
    const radius = Math.sqrt(Math.pow(ex - cx, 2) + Math.pow(ey - cy, 2));
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius / 2;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + height / 4);
    ctx.quadraticCurveTo(x, y, x + width / 4, y);
    ctx.quadraticCurveTo(x + width / 2, y, x + width / 2, y + height / 4);
    ctx.quadraticCurveTo(x + width / 2, y, x + width * 3/4, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + height / 4);
    ctx.quadraticCurveTo(x + width, y + height / 2, x + width * 3/4, y + height * 3/4);
    ctx.lineTo(x + width / 2, y + height);
    ctx.lineTo(x + width / 4, y + height * 3/4);
    ctx.quadraticCurveTo(x, y + height / 2, x, y + height / 4);
    ctx.fill();
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.beginPath();
    ctx.arc(x + width * 0.3, y + height * 0.5, height * 0.3, 0, Math.PI * 2);
    ctx.arc(x + width * 0.5, y + height * 0.3, height * 0.4, 0, Math.PI * 2);
    ctx.arc(x + width * 0.7, y + height * 0.5, height * 0.3, 0, Math.PI * 2);
    ctx.arc(x + width * 0.5, y + height * 0.7, height * 0.35, 0, Math.PI * 2);
    ctx.fill();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (100 / zoom);
    const y = (e.clientY - rect.top) * (100 / zoom);
    
    if (currentTool === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
      return;
    }
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    
    if (currentTool === 'draw' || currentTool === 'erase') {
      const newAction: DrawingAction = {
        type: currentTool,
        points: [{ x, y }],
        color: currentColor,
        lineWidth: currentTool === 'erase' ? lineWidth * 3 : lineWidth,
        author: collaborativeMode ? 'You' : undefined,
        timestamp: new Date().toISOString()
      };
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newAction);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (100 / zoom);
    const y = (e.clientY - rect.top) * (100 / zoom);
    
    if (currentTool === 'draw' || currentTool === 'erase') {
      const newHistory = [...history];
      const currentAction = newHistory[historyIndex];
      
      if (currentAction && currentAction.points) {
        currentAction.points.push({ x, y });
        setHistory(newHistory);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (showGrid) {
          drawGrid(ctx, canvas.width, canvas.height);
        }
        
        redrawCanvas(ctx);
      }
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left) * (100 / zoom);
    const endY = (e.clientY - rect.top) * (100 / zoom);
    
    if (currentTool !== 'draw' && currentTool !== 'erase' && currentTool !== 'text') {
      const newAction: DrawingAction = {
        type: currentTool,
        startX: startPoint.x,
        startY: startPoint.y,
        endX,
        endY,
        color: currentColor,
        lineWidth,
        author: collaborativeMode ? 'You' : undefined,
        timestamp: new Date().toISOString()
      };
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newAction);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleTextSubmit = () => {
    if (!textInput || !textPosition) return;
    
    const newAction: DrawingAction = {
      type: 'text',
      text: textInput,
      startX: textPosition.x,
      startY: textPosition.y,
      color: currentColor,
      lineWidth: 1,
      fontSize,
      fontFamily,
      author: collaborativeMode ? 'You' : undefined,
      timestamp: new Date().toISOString()
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAction);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setTextInput('');
    setShowTextInput(false);
    setTextPosition(null);
  };

  const undo = () => {
    if (historyIndex >= 0) {
      setHistoryIndex(historyIndex - 1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          if (showGrid) {
            drawGrid(ctx, canvas.width, canvas.height);
          }
          
          redrawCanvas(ctx);
        }
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          if (showGrid) {
            drawGrid(ctx, canvas.width, canvas.height);
          }
          
          redrawCanvas(ctx);
        }
      }
    }
  };

  const clearCanvas = () => {
    setHistory([]);
    setHistoryIndex(-1);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (showGrid) {
          drawGrid(ctx, canvas.width, canvas.height);
        }
      }
    }
  };

  const saveWhiteboard = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const exportWhiteboard = (format: 'png' | 'svg' | 'pdf') => {
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        message.error('Canvas not found');
        return;
      }

      let dataUrl = '';
      let filename = '';

      switch (format) {
        case 'png':
          dataUrl = canvas.toDataURL('image/png');
          filename = 'whiteboard.png';
          break;
        case 'svg':
          // Convert canvas to SVG (simplified version)
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
              <rect width="100%" height="100%" fill="white"/>
              <!-- Simplified SVG export - would need to track all drawing operations -->
            </svg>`;
            dataUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
            filename = 'whiteboard.svg';
          }
          break;
        case 'pdf':
          // For PDF export, we'd need a library like jsPDF
          message.warning('PDF export requires additional library. Exporting as PNG instead.');
          dataUrl = canvas.toDataURL('image/png');
          filename = 'whiteboard.pdf';
          break;
      }

      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success(`Whiteboard exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export whiteboard');
    }
  };

  const shareWhiteboard = () => {
    if (navigator.share) {
      navigator.share({
        title: t.title,
        text: 'Check out my whiteboard!',
        url: window.location.href
      });
    }
  };

  const languageMenu = (
    <Menu onClick={(e) => setLanguage(e.key as string)}>
      <Menu.Item key="en">English</Menu.Item>
      <Menu.Item key="es">Español</Menu.Item>
      <Menu.Item key="fr">Français</Menu.Item>
      <Menu.Item key="zh">中文</Menu.Item>
    </Menu>
  );

  const exportMenu = (
    <Menu onClick={(e) => exportWhiteboard(e.key as 'png' | 'svg' | 'pdf')}>
      <Menu.Item key="png" icon={<DownloadOutlined />}>PNG</Menu.Item>
      <Menu.Item key="svg" icon={<DownloadOutlined />}>SVG</Menu.Item>
      <Menu.Item key="pdf" icon={<DownloadOutlined />}>PDF</Menu.Item>
    </Menu>
  );

  return (
    <Card 
      title={
        <Space>
          <EditOutlined />
          <span>{t.title}</span>
          {collaborativeMode && (
            <Space>
              <TeamOutlined />
              <span>({collaborativeUsers.length} users)</span>
            </Space>
          )}
        </Space>
      }
      extra={
        <Space>
          <Dropdown overlay={languageMenu} trigger={['click']}>
            <Button icon={<GlobalOutlined />}>
              {language.toUpperCase()}
            </Button>
          </Dropdown>
          
          <Switch
            checked={collaborativeMode}
            onChange={setCollaborativeMode}
            checkedChildren={<TeamOutlined />}
            unCheckedChildren={<EditOutlined />}
          />
        </Space>
      }
      style={{ height: '100%' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Collaborative Users */}
        {collaborativeMode && (
          <div style={{ padding: 8, backgroundColor: '#f0f2f5', borderRadius: 4 }}>
            <Space wrap>
              {collaborativeUsers.map(user => (
                <div key={user.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4 
                }}>
                  <div style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: user.color 
                  }} />
                  <span style={{ fontSize: 12 }}>{user.name}</span>
                </div>
              ))}
            </Space>
          </div>
        )}

        {/* Toolbar */}
        <Space wrap>
          <Select
            value={currentTool}
            onChange={setCurrentTool}
            style={{ width: 140 }}
          >
            <Select.Option value="draw">{t.pen}</Select.Option>
            <Select.Option value="erase">{t.eraser}</Select.Option>
            <Select.Option value="rectangle">{t.rectangle}</Select.Option>
            <Select.Option value="circle">{t.circle}</Select.Option>
            <Select.Option value="line">{t.line}</Select.Option>
            <Select.Option value="text">{t.text}</Select.Option>
            <Select.Option value="arrow">{t.arrow}</Select.Option>
            <Select.Option value="triangle">{t.triangle}</Select.Option>
            <Select.Option value="pentagon">{t.pentagon}</Select.Option>
            <Select.Option value="hexagon">{t.hexagon}</Select.Option>
            <Select.Option value="star" icon={<StarOutlined />}>{t.star}</Select.Option>
            <Select.Option value="heart" icon={<HeartOutlined />}>{t.heart}</Select.Option>
            <Select.Option value="cloud" icon={<BulbOutlined />}>{t.cloud}</Select.Option>
            <Select.Option value="comment">{t.comment}</Select.Option>
            <Select.Option value="bar-chart">{t.barChart}</Select.Option>
            <Select.Option value="line-chart">{t.lineChart}</Select.Option>
            <Select.Option value="pie-chart">{t.pieChart}</Select.Option>
            <Select.Option value="scatter-chart">{t.scatterChart}</Select.Option>
            <Select.Option value="area-chart">{t.areaChart}</Select.Option>
          </Select>

          <ColorPicker
            value={currentColor}
            onChange={(color) => setCurrentColor(color.toHexString())}
            disabled={currentTool === 'erase'}
          />

          <ColorPicker
            value={backgroundColor}
            onChange={(color) => setBackgroundColor(color.toHexString())}
          />

          {currentTool === 'text' && (
            <>
              <InputNumber
                value={fontSize}
                onChange={(value) => setFontSize(value || 16)}
                min={8}
                max={72}
                prefix={<FontSizeOutlined />}
                style={{ width: 100 }}
              />
              
              <Select
                value={fontFamily}
                onChange={setFontFamily}
                style={{ width: 120 }}
              >
                <Select.Option value="Arial">Arial</Select.Option>
                <Select.Option value="Times New Roman">Times</Select.Option>
                <Select.Option value="Courier New">Courier</Select.Option>
                <Select.Option value="Georgia">Georgia</Select.Option>
                <Select.Option value="Verdana">Verdana</Select.Option>
              </Select>
            </>
          )}

          <Select
            value={lineWidth}
            onChange={setLineWidth}
            style={{ width: 100 }}
          >
            <Select.Option value={1}>{t.thin}</Select.Option>
            <Select.Option value={2}>{t.medium}</Select.Option>
            <Select.Option value={4}>{t.thick}</Select.Option>
            <Select.Option value={8}>{t.extraThick}</Select.Option>
          </Select>

          <Divider type="vertical" />

          <Switch
            checked={showGrid}
            onChange={setShowGrid}
            checkedChildren={t.grid}
            unCheckedChildren={t.noGrid}
          />

          <Divider type="vertical" />

          <Button icon={<UndoOutlined />} onClick={undo} disabled={historyIndex < 0}>
            {t.undo}
          </Button>
          <Button icon={<RedoOutlined />} onClick={redo} disabled={historyIndex >= history.length - 1}>
            {t.redo}
          </Button>
          <Button icon={<ClearOutlined />} onClick={clearCanvas}>
            {t.clear}
          </Button>
          <Button icon={<SaveOutlined />} onClick={saveWhiteboard} type="primary">
            {t.save}
          </Button>

          <Dropdown overlay={exportMenu} trigger={['click']}>
            <Button icon={<DownloadOutlined />}>
              {t.export}
            </Button>
          </Dropdown>

          <Button icon={<ShareAltOutlined />} onClick={shareWhiteboard}>
            {t.share}
          </Button>

          <Button 
            icon={<ZoomInOutlined />} 
            onClick={() => setZoom(Math.min(zoom + 10, 200))}
          >
            {t.zoom} {zoom}%
          </Button>

          <Button 
            icon={<FullscreenOutlined />}
            onClick={() => document.documentElement.requestFullscreen()}
          >
            {t.fullscreen}
          </Button>
        </Space>

        {/* Canvas */}
        <div style={{ 
          border: '1px solid #d9d9d9', 
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <canvas
            ref={canvasRef}
            style={{ 
              width: '100%', 
              height: '500px',
              cursor: currentTool === 'erase' ? 'grab' : 'crosshair',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {/* Text Input Modal */}
          {showTextInput && textPosition && (
            <div
              style={{
                position: 'absolute',
                left: textPosition.x * (zoom / 100),
                top: textPosition.y * (zoom / 100),
                backgroundColor: 'white',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                padding: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <TextArea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={t.enterText}
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{ width: 200, marginBottom: 8 }}
              />
              <Space>
                <Button type="primary" size="small" onClick={handleTextSubmit}>
                  Add
                </Button>
                <Button size="small" onClick={() => {
                  setShowTextInput(false);
                  setTextInput('');
                  setTextPosition(null);
                }}>
                  Cancel
                </Button>
              </Space>
            </div>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default Whiteboard;
