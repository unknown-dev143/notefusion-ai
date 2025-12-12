import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Button, Space, Input, ColorPicker, message, Modal, Row, Col } from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined,
  SaveOutlined,
  ShareAltOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  BranchesOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface MindNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  children: string[];
  parent: string | null;
  level: number;
}

interface MindMap {
  id: string;
  title: string;
  nodes: MindNode[];
  connections: { from: string; to: string }[];
  createdAt: string;
  lastModified: string;
}

const MindMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mindMaps] = useState<MindMap[]>([
    {
      id: '1',
      title: 'AI Concepts',
      nodes: [
        {
          id: '1',
          text: 'Artificial Intelligence',
          x: 400,
          y: 300,
          color: '#1890ff',
          fontSize: 16,
          children: ['2', '3', '4'],
          parent: null,
          level: 0
        },
        {
          id: '2',
          text: 'Machine Learning',
          x: 200,
          y: 200,
          color: '#52c41a',
          fontSize: 14,
          children: ['5', '6'],
          parent: '1',
          level: 1
        },
        {
          id: '3',
          text: 'Neural Networks',
          x: 400,
          y: 150,
          color: '#fa8c16',
          fontSize: 14,
          children: [],
          parent: '1',
          level: 1
        },
        {
          id: '4',
          text: 'Natural Language Processing',
          x: 600,
          y: 200,
          color: '#722ed1',
          fontSize: 14,
          children: [],
          parent: '1',
          level: 1
        }
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '1', to: '3' },
        { from: '1', to: '4' }
      ],
      createdAt: '2024-01-15',
      lastModified: '2024-01-16'
    }
  ]);

  const [currentMap, setCurrentMap] = useState<MindMap | null>(mindMaps[0]);
  const [selectedNode, setSelectedNode] = useState<MindNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [nodeColor, setNodeColor] = useState('#1890ff');
  const [nodeSize, setNodeSize] = useState(14);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nodeText, setNodeText] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectStart, setConnectStart] = useState<string | null>(null);

  useEffect(() => {
    drawMindMap();
  }, [currentMap, selectedNode, zoom]);

  const drawMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentMap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw connections
    ctx.strokeStyle = '#d9d9d9';
    ctx.lineWidth = 2;
    currentMap.connections.forEach(connection => {
      const fromNode = currentMap.nodes.find(n => n.id === connection.from);
      const toNode = currentMap.nodes.find(n => n.id === connection.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    currentMap.nodes.forEach(node => {
      // Node circle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fill();

      // Node border if selected
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#1890ff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node text
      ctx.fillStyle = '#ffffff';
      ctx.font = `${node.fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wrap text if too long
      const maxWidth = 80;
      const words = node.text.split(' ');
      let line = '';
      let y = node.y;

      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && line !== '') {
          ctx.fillText(line, node.x, y);
          line = word + ' ';
          y += node.fontSize + 2;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, node.x, y);
    });

    ctx.restore();
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  const findNodeAtPosition = (x: number, y: number): MindNode | null => {
    if (!currentMap) return null;

    return currentMap.nodes.find(node => {
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      return distance <= 20;
    }) || null;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const node = findNodeAtPosition(pos.x, pos.y);

    if (isConnecting) {
      if (connectStart && node && node.id !== connectStart) {
        // Create connection
        const connection = { from: connectStart, to: node.id };
        
        setCurrentMap(prev => prev ? {
          ...prev,
          connections: [...prev.connections, connection],
          lastModified: new Date().toISOString()
        } : null);

        // Update parent-child relationships
        setCurrentMap(prev => prev ? {
          ...prev,
          nodes: prev.nodes.map(n => {
            if (n.id === connectStart) {
              return { ...n, children: [...n.children, node.id] };
            }
            if (n.id === node.id) {
              return { ...n, parent: connectStart };
            }
            return n;
          })
        } : null);

        message.success('Connection created');
      }
      
      setIsConnecting(false);
      setConnectStart(null);
    } else {
      setSelectedNode(node);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const node = findNodeAtPosition(pos.x, pos.y);

    if (node && !isConnecting) {
      setIsDragging(true);
      setDragOffset({
        x: pos.x - node.x,
        y: pos.y - node.y
      });
      setSelectedNode(node);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedNode || !currentMap) return;

    const pos = getMousePos(e);
    const newX = pos.x - dragOffset.x;
    const newY = pos.y - dragOffset.y;

    setCurrentMap(prev => prev ? {
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === selectedNode.id
          ? { ...node, x: newX, y: newY }
          : node
      ),
      lastModified: new Date().toISOString()
    } : null);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const addNode = () => {
    if (!currentMap) return;

    const newNode: MindNode = {
      id: Date.now().toString(),
      text: 'New Node',
      x: 400 + Math.random() * 200 - 100,
      y: 300 + Math.random() * 200 - 100,
      color: nodeColor,
      fontSize: nodeSize,
      children: [],
      parent: selectedNode?.id || null,
      level: selectedNode ? selectedNode.level + 1 : 0
    };

    setCurrentMap(prev => prev ? {
      ...prev,
      nodes: [...prev.nodes, newNode],
      lastModified: new Date().toISOString()
    } : null);

    // Create connection if parent exists
    if (selectedNode) {
      setCurrentMap(prev => prev ? {
        ...prev,
        connections: [...prev.connections, { from: selectedNode.id, to: newNode.id }],
        nodes: prev.nodes.map(node =>
          node.id === selectedNode.id
            ? { ...node, children: [...node.children, newNode.id] }
            : node
        )
      } : null);
    }

    message.success('Node added');
  };

  const deleteNode = () => {
    if (!selectedNode || !currentMap) return;

    // Remove connections
    setCurrentMap(prev => prev ? {
      ...prev,
      connections: prev.connections.filter(
        conn => conn.from !== selectedNode.id && conn.to !== selectedNode.id
      ),
      nodes: prev.nodes.filter(node => node.id !== selectedNode.id),
      lastModified: new Date().toISOString()
    } : null);

    setSelectedNode(null);
    message.success('Node deleted');
  };

  const editNode = () => {
    if (!selectedNode) return;
    
    setNodeText(selectedNode.text);
    setEditModalVisible(true);
  };

  const saveNodeEdit = () => {
    if (!selectedNode || !currentMap) return;

    setCurrentMap(prev => prev ? {
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === selectedNode.id
          ? { ...node, text: nodeText }
          : node
      ),
      lastModified: new Date().toISOString()
    } : null);

    setEditModalVisible(false);
    message.success('Node updated');
  };

  const startConnection = () => {
    if (!selectedNode) {
      message.warning('Please select a node to connect from');
      return;
    }
    
    setIsConnecting(true);
    setConnectStart(selectedNode.id);
    message.info('Click another node to create a connection');
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const saveMindMap = () => {
    if (!currentMap) return;
    
    message.success('Mind map saved successfully!');
  };

  const exportMindMap = () => {
    if (!currentMap) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${currentMap.title}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    message.success('Mind map exported as image');
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      <Title level={2}>Mind Mapping</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card
            title={currentMap?.title || 'Mind Map'}
            extra={
              <Space>
                <Button icon={<ZoomOutOutlined />} onClick={zoomOut} />
                <Text>{Math.round(zoom * 100)}%</Text>
                <Button icon={<ZoomInOutlined />} onClick={zoomIn} />
                <Button icon={<ReloadOutlined />} onClick={resetZoom} />
              </Space>
            }
          >
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 500,
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                cursor: isConnecting ? 'crosshair' : 'default'
              }}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="Node Tools">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addNode}
                  block
                >
                  Add Node
                </Button>
                
                <Button
                  icon={<BranchesOutlined />}
                  onClick={startConnection}
                  disabled={!selectedNode || isConnecting}
                  block
                >
                  {isConnecting ? 'Connecting...' : 'Connect Nodes'}
                </Button>

                <Button
                  icon={<EditOutlined />}
                  onClick={editNode}
                  disabled={!selectedNode}
                  block
                >
                  Edit Node
                </Button>

                <Button
                  icon={<DeleteOutlined />}
                  onClick={deleteNode}
                  disabled={!selectedNode}
                  danger
                  block
                >
                  Delete Node
                </Button>
              </Space>
            </Card>

            <Card title="Node Style">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Color:</Text>
                  <ColorPicker
                    value={nodeColor}
                    onChange={(color) => setNodeColor(color.toHexString())}
                    style={{ marginLeft: 8 }}
                  />
                </div>

                <div>
                  <Text>Size:</Text>
                  <input
                    type="range"
                    min="10"
                    max="20"
                    value={nodeSize}
                    onChange={(e) => setNodeSize(parseInt(e.target.value))}
                    style={{ width: '100%', marginTop: 4 }}
                    title="Node Size"
                    placeholder="Node Size"
                  />
                </div>
              </Space>
            </Card>

            <Card title="Actions">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  icon={<SaveOutlined />}
                  onClick={saveMindMap}
                  block
                >
                  Save Mind Map
                </Button>

                <Button
                  icon={<ShareAltOutlined />}
                  onClick={exportMindMap}
                  block
                >
                  Export as Image
                </Button>
              </Space>
            </Card>

            {selectedNode && (
              <Card title="Selected Node">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>{selectedNode.text}</Text>
                  <Text type="secondary">
                    Level: {selectedNode.level}
                  </Text>
                  <Text type="secondary">
                    Children: {selectedNode.children.length}
                  </Text>
                  <Text type="secondary">
                    Position: ({Math.round(selectedNode.x)}, {Math.round(selectedNode.y)})
                  </Text>
                </Space>
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      <Modal
        title="Edit Node"
        open={editModalVisible}
        onOk={saveNodeEdit}
        onCancel={() => setEditModalVisible(false)}
      >
        <TextArea
          value={nodeText}
          onChange={(e) => setNodeText(e.target.value)}
          placeholder="Enter node text..."
          rows={3}
        />
      </Modal>
    </div>
  );
};

export default MindMap;
