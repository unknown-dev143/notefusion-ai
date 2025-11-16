import React, { useState, useRef, useEffect, useCallback } from 'react';
// @ts-ignore - fabric types
import { Canvas, Rect, Circle, Line, IText, Group } from 'fabric';
import { ref, set, onValue } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { getStripe } from '../config/stripe';
import toast from 'react-hot-toast';
import { whiteboardService } from '../services/firebaseService';
import { googleDriveService } from '../services/googleService';

type Tool = 'pen' | 'rectangle' | 'circle' | 'line' | 'text' | 'eraser' | 'select';

interface WhiteboardState {
  tool: Tool;
  color: string;
  lineWidth: number;
  fillColor: string;
  fontSize: number;
  fontFamily: string;
}

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [state, setState] = useState<WhiteboardState>({
    tool: 'pen',
    color: '#000000',
    lineWidth: 2,
    fillColor: '#ffffff',
    fontSize: 20,
    fontFamily: 'Arial'
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isCollaborative, setIsCollaborative] = useState(true); // Enabled by default
  const [isPremium, setIsPremium] = useState(true); // All features free
  const [layers, setLayers] = useState<Group[]>([]);
  const [currentLayer, setCurrentLayer] = useState(0);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: canvasRef.current.offsetWidth,
      height: 600,
      backgroundColor: '#ffffff'
    });

    fabricCanvasRef.current = canvas;

    // Set up drawing tools
    setupDrawingTools(canvas);

    // Load from Firebase if collaborative mode
    if (isCollaborative) {
      loadFromFirebase();
    }

    // Save history on object added
    canvas.on('object:added', saveHistory);
    canvas.on('object:modified', saveHistory);
    canvas.on('object:removed', saveHistory);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Setup drawing tools
  const setupDrawingTools = (canvas: Canvas) => {
    canvas.isDrawingMode = state.tool === 'pen';
    canvas.freeDrawingBrush.width = state.lineWidth;
    canvas.freeDrawingBrush.color = state.color;

    // Handle different tools
    canvas.on('mouse:down', (options: any) => {
      const pointer = canvas.getPointer(options.e);
      
      switch (state.tool) {
        case 'rectangle':
          const rect = new Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: state.fillColor,
            stroke: state.color,
            strokeWidth: state.lineWidth
          });
          canvas.add(rect);
          break;

        case 'circle':
          const circle = new Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 0,
            fill: state.fillColor,
            stroke: state.color,
            strokeWidth: state.lineWidth
          });
          canvas.add(circle);
          break;

        case 'line':
          const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: state.color,
            strokeWidth: state.lineWidth
          });
          canvas.add(line);
          break;

        case 'text':
          const text = new IText('Click to edit', {
            left: pointer.x,
            top: pointer.y,
            fontSize: state.fontSize,
            fontFamily: state.fontFamily,
            fill: state.color
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          break;
      }
    });
  };

  // Save history for undo/redo
  const saveHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0 && fabricCanvasRef.current) {
      const newIndex = historyIndex - 1;
      fabricCanvasRef.current.loadFromJSON(history[newIndex], () => {
        fabricCanvasRef.current?.renderAll();
      });
      setHistoryIndex(newIndex);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1 && fabricCanvasRef.current) {
      const newIndex = historyIndex + 1;
      fabricCanvasRef.current.loadFromJSON(history[newIndex], () => {
        fabricCanvasRef.current?.renderAll();
      });
      setHistoryIndex(newIndex);
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = '#ffffff';
      saveHistory();
    }
  };

  // Download canvas
  const downloadCanvas = () => {
    if (!fabricCanvasRef.current) return;
    
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1
    });
    
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = dataURL;
    link.click();
  };

  // Save to Firebase
  const saveToFirebase = async () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      const canvasData = fabricCanvasRef.current.toJSON();
      await whiteboardService.saveWhiteboard('default', canvasData);
      toast.success('Saved to cloud!');
    } catch (error) {
      // Gracefully handle - Firebase is optional
      const canvasData = fabricCanvasRef.current.toJSON();
      toast('Firebase not configured. Saving locally instead.', { icon: 'ℹ️' });
      // Save to localStorage as fallback
      localStorage.setItem('whiteboard_backup', JSON.stringify(canvasData));
      console.error(error);
    }
  };

  // Load from Firebase
  const loadFromFirebase = async () => {
    if (!fabricCanvasRef.current || !isCollaborative) return;
    
    try {
      whiteboardService.loadWhiteboard('default', (data) => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.loadFromJSON(data, () => {
            fabricCanvasRef.current?.renderAll();
          });
        }
      });
    } catch (error) {
      console.error('Failed to load from Firebase:', error);
    }
  };

  // Save to Google Drive
  const saveToGoogleDrive = async () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      const canvasData = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1
      });

      // Convert data URL to blob
      const response = await fetch(canvasData);
      const blob = await response.blob();

      // Create file from blob
      const file = new File([blob], `Whiteboard_${Date.now()}.png`, { type: 'image/png' });

      // Upload to Google Drive
      const link = await googleDriveService.uploadFile(file, file.name);
      toast.success('Saved to Google Drive!');
      window.open(link, '_blank');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save to Google Drive');
      console.error(error);
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!fabricCanvasRef.current) return;
    
    // This would require a PDF library like jsPDF
    toast('PDF export feature coming soon!', { icon: 'ℹ️' });
  };

  // Handle premium upgrade
  const handleUpgrade = async () => {
    try {
      const stripe = await getStripe();
      if (!stripe) {
        toast.error('Stripe not initialized');
        return;
      }

      // Create checkout session (this would be done on your backend)
      toast('Redirecting to payment...', { icon: '💳' });
      // In production, you would redirect to Stripe Checkout
      window.location.href = '/payment';
    } catch (error) {
      toast.error('Failed to initialize payment');
      console.error(error);
    }
  };

  // Update tool
  const updateTool = (tool: Tool) => {
    setState(prev => ({ ...prev, tool }));
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = tool === 'pen';
      setupDrawingTools(fabricCanvasRef.current);
    }
  };

  // Update color
  const updateColor = (color: string) => {
    setState(prev => ({ ...prev, color }));
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.freeDrawingBrush.color = color;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Interactive Whiteboard</h1>
            <p className="text-gray-600 mt-1">Professional drawing and collaboration tool</p>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg">
            ✨ All Features Free & Accessible
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
          {/* Tools */}
          <div className="flex items-center space-x-2 border-r pr-4">
            <span className="text-sm font-medium text-gray-700">Tools:</span>
            {(['pen', 'rectangle', 'circle', 'line', 'text', 'eraser', 'select'] as Tool[]).map((tool) => (
              <button
                key={tool}
                onClick={() => updateTool(tool)}
                className={`px-3 py-2 rounded-lg transition-all ${
                  state.tool === tool
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                title={tool.charAt(0).toUpperCase() + tool.slice(1)}
              >
                {tool === 'pen' && '✏️'}
                {tool === 'rectangle' && '▭'}
                {tool === 'circle' && '○'}
                {tool === 'line' && '─'}
                {tool === 'text' && 'T'}
                {tool === 'eraser' && '🧹'}
                {tool === 'select' && '↖️'}
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="flex items-center space-x-2 border-r pr-4">
            <label className="text-sm font-medium text-gray-700">Stroke:</label>
            <input
              type="color"
              value={state.color}
              onChange={(e) => updateColor(e.target.value)}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <label className="text-sm font-medium text-gray-700">Fill:</label>
            <input
              type="color"
              value={state.fillColor}
              onChange={(e) => setState(prev => ({ ...prev, fillColor: e.target.value }))}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>

          {/* Line Width */}
          <div className="flex items-center space-x-2 border-r pr-4">
            <label className="text-sm font-medium text-gray-700">Width:</label>
            <input
              type="range"
              min="1"
              max="50"
              value={state.lineWidth}
              onChange={(e) => {
                const width = Number(e.target.value);
                setState(prev => ({ ...prev, lineWidth: width }));
                if (fabricCanvasRef.current) {
                  fabricCanvasRef.current.freeDrawingBrush.width = width;
                }
              }}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-8">{state.lineWidth}px</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              ↷ Redo
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-inner">
          <canvas ref={canvasRef} className="w-full" />
        </div>

        {/* Save Options */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={downloadCanvas}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            💾 Download PNG
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📄 Export PDF
          </button>
          <button
            onClick={saveToFirebase}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            ☁️ Save to Cloud
          </button>
          <button
            onClick={saveToGoogleDrive}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            📁 Save to Google Drive
          </button>
          <button
            onClick={() => setIsCollaborative(!isCollaborative)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isCollaborative
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {isCollaborative ? '👥 Collaboration ON' : '👤 Collaboration OFF'}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tips:</strong> Use different tools to create shapes, add text, and draw freely. 
            Enable collaboration for real-time sync. Premium users get unlimited cloud storage and advanced features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
