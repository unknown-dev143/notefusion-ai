import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

type Tool = 'select' | 'pen' | 'rectangle' | 'circle' | 'text' | 'eraser' | 'line';
type Color = string;

interface DiagramCanvasProps {
  onSave: (data: string) => void;
  initialData?: string;
  readOnly?: boolean;
  canvasRef?: React.MutableRefObject<fabric.Canvas | null>;
}

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  onSave,
  initialData,
  readOnly = false,
  canvasRef: externalCanvasRef,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const internalCanvasRef = useRef<fabric.Canvas | null>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [color, setColor] = useState<Color>('#000000');
  const [brushWidth, setBrushWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const { currentUser } = useAuth();

  // Initialize canvas
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const canvas = new fabric.Canvas('diagram-canvas', {
      width: canvasContainerRef.current.offsetWidth,
      height: 600,
      isDrawingMode: activeTool === 'pen',
      backgroundColor: '#ffffff',
    });

    // Load initial data if provided
    if (initialData) {
      try {
        canvas.loadFromJSON(JSON.parse(initialData), () => {
          canvas.renderAll();
        });
      } catch (error) {
        console.error('Error loading canvas data:', error);
      }
    }

    // Set up event listeners
    canvas.on('mouse:down', () => {
      if (!readOnly) setIsDrawing(true);
    });

    canvas.on('mouse:up', () => {
      if (isDrawing) {
        setIsDrawing(false);
        handleSave();
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (canvasContainerRef.current) {
        canvas.setWidth(canvasContainerRef.current.offsetWidth);
        canvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    canvasRef.current = canvas;

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [initialData, readOnly]);

  // Update drawing mode when active tool changes
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.isDrawingMode = activeTool === 'pen' && !readOnly;
    
    // Set cursor based on tool
    const cursor = readOnly ? 'default' : 
      activeTool === 'select' ? 'move' :
      activeTool === 'eraser' ? 'crosshair' : 'crosshair';
    
    canvas.defaultCursor = cursor;
    canvas.selection = activeTool === 'select' && !readOnly;
    canvas.forEachObject(obj => {
      obj.selectable = activeTool === 'select' && !readOnly;
    });
    
    canvas.renderAll();
  }, [activeTool, readOnly]);

  // Handle drawing tools
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    if (activeTool === 'pen') {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = brushWidth;
    } else if (activeTool === 'eraser') {
      canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
      canvas.freeDrawingBrush.width = brushWidth * 3; // Make eraser slightly larger
    }
  }, [activeTool, color, brushWidth]);

  // Handle shape creation
  const handleAddShape = useCallback((shape: 'rectangle' | 'circle' | 'line' | 'text') => {
    if (!canvasRef.current || readOnly) return;
    
    const canvas = canvasRef.current;
    let newShape: fabric.Object;
    
    switch (shape) {
      case 'rectangle':
        newShape = new fabric.Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 80,
          fill: 'transparent',
          stroke: color,
          strokeWidth: brushWidth,
          selectable: true,
        });
        break;
        
      case 'circle':
        newShape = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: 'transparent',
          stroke: color,
          strokeWidth: brushWidth,
          selectable: true,
        });
        break;
        
      case 'line':
        newShape = new fabric.Line([50, 50, 200, 200], {
          stroke: color,
          strokeWidth: brushWidth,
          selectable: true,
        });
        break;
        
      case 'text':
        newShape = new fabric.IText('Double click to edit', {
          left: 100,
          top: 100,
          fontFamily: 'Arial',
          fontSize: 20,
          fill: color,
          selectable: true,
        });
        break;
        
      default:
        return;
    }
    
    canvas.add(newShape);
    canvas.setActiveObject(newShape);
    canvas.renderAll();
    handleSave();
  }, [color, brushWidth, readOnly]);

  // Handle canvas save
  const handleSave = useCallback(() => {
    if (!canvasRef.current) return;
    
    const data = JSON.stringify(canvasRef.current.toJSON(['selectable']));
    onSave(data);
  }, [onSave]);

  // Handle clear canvas
  const handleClear = useCallback(() => {
    if (!canvasRef.current || readOnly) return;
    
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      canvasRef.current.clear();
      canvasRef.current.backgroundColor = '#ffffff';
      canvasRef.current.renderAll();
      handleSave();
    }
  }, [handleSave, readOnly]);

  // Handle undo/redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback(() => {
    if (!canvasRef.current) return;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(canvasRef.current.toJSON(['selectable'])));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0 || !canvasRef.current) return;
    
    const newIndex = historyIndex - 1;
    canvasRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      canvasRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !canvasRef.current) return;
    
    const newIndex = historyIndex + 1;
    canvasRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      canvasRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [history, historyIndex]);

  // Set up initial history
  useEffect(() => {
    if (initialData) {
      setHistory([initialData]);
      setHistoryIndex(0);
    }
  }, [initialData]);

  // Save to history on changes
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    const handleObjectModified = () => {
      if (!readOnly) {
        saveToHistory();
        handleSave();
      }
    };
    
    canvas.on('object:modified', handleObjectModified);
    
    return () => {
      canvas.off('object:modified', handleObjectModified);
    };
  }, [saveToHistory, handleSave, readOnly]);

  // Toolbar component
  const Toolbar = () => (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-100 border-b">
      <button
        className={`px-3 py-1 rounded ${activeTool === 'select' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        onClick={() => setActiveTool('select')}
        title="Select"
      >
        <i className="fas fa-mouse-pointer"></i>
      </button>
      <button
        className={`px-3 py-1 rounded ${activeTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        onClick={() => setActiveTool('pen')}
        title="Pen"
      >
        <i className="fas fa-pen"></i>
      </button>
      <button
        className="px-3 py-1 bg-white rounded"
        onClick={() => handleAddShape('rectangle')}
        title="Add Rectangle"
      >
        <i className="far fa-square"></i>
      </button>
      <button
        className="px-3 py-1 bg-white rounded"
        onClick={() => handleAddShape('circle')}
        title="Add Circle"
      >
        <i className="far fa-circle"></i>
      </button>
      <button
        className="px-3 py-1 bg-white rounded"
        onClick={() => handleAddShape('line')}
        title="Add Line"
      >
        <i className="fas fa-minus"></i>
      </button>
      <button
        className="px-3 py-1 bg-white rounded"
        onClick={() => handleAddShape('text')}
        title="Add Text"
      >
        <i className="fas fa-font"></i>
      </button>
      <button
        className={`px-3 py-1 rounded ${activeTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-white'}`}
        onClick={() => setActiveTool('eraser')}
        title="Eraser"
      >
        <i className="fas fa-eraser"></i>
      </button>
      
      <div className="ml-2 flex items-center gap-2">
        <label htmlFor="color-picker" className="text-sm">Color:</label>
        <input
          type="color"
          id="color-picker"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-8 p-0 border-0"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label htmlFor="brush-size" className="text-sm">Size:</label>
        <input
          type="range"
          id="brush-size"
          min="1"
          max="20"
          value={brushWidth}
          onChange={(e) => setBrushWidth(parseInt(e.target.value))}
          className="w-20"
        />
      </div>
      
      <div className="ml-auto flex gap-2">
        <button
          className="px-3 py-1 bg-white rounded disabled:opacity-50"
          onClick={handleUndo}
          disabled={historyIndex <= 0 || readOnly}
          title="Undo"
        >
          <i className="fas fa-undo"></i>
        </button>
        <button
          className="px-3 py-1 bg-white rounded disabled:opacity-50"
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1 || readOnly}
          title="Redo"
        >
          <i className="fas fa-redo"></i>
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded"
          onClick={handleClear}
          disabled={readOnly}
          title="Clear Canvas"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {!readOnly && <Toolbar />}
      <div 
        ref={canvasContainerRef} 
        className="relative"
        style={{ height: '600px' }}
      >
        <canvas id="diagram-canvas" />
        {readOnly && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg">
            View Only Mode
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramCanvas;
