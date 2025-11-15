import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Card, Input, Typography, Alert, Space, Layout } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  SyncOutlined,
  SendOutlined,
  WifiOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;

type MessageType = 'sent' | 'received' | 'system' | 'error' | 'echo';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: number;
}

const WebSocketTestPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const addMessage = useCallback((content: string, type: MessageType) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: Date.now(),
    };
    setMessages(prev => [newMessage, ...prev].slice(0, 100));
  }, []);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    setError(null);

    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8007';
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setStatus('connected');
        reconnectAttempts.current = 0;
        addMessage('Connected to WebSocket server', 'system');
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addMessage(data.message || 'Received message', data.type || 'received');
        } catch (e) {
          addMessage(event.data, 'received');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setStatus('disconnected');
      };

      ws.current.onclose = () => {
        if (status !== 'disconnected') {
          attemptReconnect();
        } else {
          setStatus('disconnected');
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError('Failed to connect to WebSocket server');
      setStatus('disconnected');
    }
  }, [status, addMessage]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setStatus('disconnected');
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current >= 5) {
      setError('Max reconnection attempts reached');
      setStatus('disconnected');
      return;
    }

    setStatus('reconnecting');
    reconnectAttempts.current += 1;

    reconnectTimeout.current = setTimeout(() => {
      console.log(`Reconnection attempt ${reconnectAttempts.current}`);
      connect();
    }, Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000));
  }, [connect]);

  const sendMessage = () => {
    if (!input.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const message = input.trim();
      ws.current.send(JSON.stringify({ 
        type: 'message', 
        content: message,
        timestamp: Date.now()
      }));
      addMessage(message, 'sent');
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  // Connect to WebSocket on component mount
  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connect]);

  return (
    <Layout style={{ minHeight: '100vh', padding: '24px' }}>
      <Card 
        title={
          <Space>
            <WifiOutlined style={{ 
              color: status === 'connected' ? '#52c41a' : 
                     status === 'connecting' || status === 'reconnecting' ? '#faad14' : '#ff4d4f' 
            }} />
            <span>WebSocket Test</span>
            <Text type="secondary">
              {status === 'connected' ? 'Connected' : 
               status === 'connecting' ? 'Connecting...' : 
               status === 'reconnecting' ? `Reconnecting (${reconnectAttempts.current}/5)...` : 'Disconnected'}
            </Text>
          </Space>
        }
        extra={
          <Button
            type={status === 'connected' ? 'default' : 'primary'}
            danger={status === 'connected'}
            icon={status === 'connected' ? <CloseCircleOutlined /> : <SyncOutlined spin={status === 'connecting' || status === 'reconnecting'} />}
            onClick={status === 'connected' ? disconnect : connect}
          >
            {status === 'connected' ? 'Disconnect' : 'Connect'}
          </Button>
        }
      >
        <div style={{ 
          height: '400px', 
          overflowY: 'auto', 
          border: '1px solid #f0f0f0',
          borderRadius: '4px',
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: '#fafafa'
        }}>
          {messages.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              color: 'rgba(0, 0, 0, 0.45)'
            }}>
              {status === 'connected' ? 'Send a message to begin...' : 'Not connected to WebSocket server'}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: '8px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: 
                    msg.type === 'sent' ? '#e6f7ff' : 
                    msg.type === 'received' || msg.type === 'echo' ? '#f6ffed' : 
                    msg.type === 'error' ? '#fff1f0' : '#fffbe6',
                  borderLeft: `4px solid ${
                    msg.type === 'sent' ? '#1890ff' : 
                    msg.type === 'received' || msg.type === 'echo' ? '#52c41a' : 
                    msg.type === 'error' ? '#ff4d4f' : '#faad14'
                  }`
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: 'rgba(0, 0, 0, 0.45)'
                }}>
                  <span style={{ 
                    fontWeight: 500,
                    color: msg.type === 'sent' ? '#1890ff' : 
                           msg.type === 'received' || msg.type === 'echo' ? '#52c41a' : 
                           msg.type === 'error' ? '#ff4d4f' : '#faad14'
                  }}>
                    {msg.type === 'sent' ? 'You' : 
                     msg.type === 'received' || msg.type === 'echo' ? 'Server' : 
                     msg.type === 'error' ? 'Error' : 'System'}
                  </span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              </div>
            ))
          )}
        </div>

        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={sendMessage}
            disabled={status !== 'connected'}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={sendMessage}
            disabled={status !== 'connected' || !input.trim()}
          >
            Send
          </Button>
        </Space.Compact>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: '16px' }}
            closable
            onClose={() => setError(null)}
          />
        )}
      </Card>
    </Layout>
  );
};

export default WebSocketTestPage;
              id: result.data.id.toString() 
            });
            setIsAuthenticated(true);
          } else {
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const result = await authService.login({
        email: loginForm.email,
        password: loginForm.password
      });

      if (result.success && result.data) {
        message.success('Login successful!');
        setUser({ 
          email: loginForm.email, 
          id: result.data.user_id || 'anonymous' 
        });
        setIsAuthenticated(true);
        // Connect to WebSocket after successful login
        connect();
      } else {
        message.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('An error occurred during login');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    disconnect(true);
    navigate('/login');
  };

  const wsConfig: WebSocketConfig = {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8006/ws/v1',
    reconnectInterval: 1000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    retryPolicy: {
      maxRetryAttempts: 3,
      initialDelay: 1000,
      maxDelay: 5000
    }
  };

  const getAuthToken = async (): Promise<string> => {
    // Get token from secure storage or authentication context
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token available');
    }
    return token;
  };

  const addMessage = useCallback((content: string, type: MessageType) => {
    setMessages(prev => [...prev, { 
      id: crypto.randomUUID(),
      content, 
      type,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const clearReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current as NodeJS.Timeout);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current as NodeJS.Timeout);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const setupHeartbeat = useCallback(() => {
    clearHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        lastPingRef.current = Date.now();
        try {
          ws.current.send(JSON.stringify({ type: 'heartbeat' }));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
        }
      }
    }, wsConfig.heartbeatInterval);
  }, [clearHeartbeat]);

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current < wsConfig.maxReconnectAttempts) {
      const baseDelay = wsConfig.reconnectInterval;
      const maxDelay = wsConfig.retryPolicy.maxDelay;
      const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts.current), maxDelay);
      
      reconnectAttempts.current += 1;
      setStatus('reconnecting');
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Reconnection attempt ${reconnectAttempts.current}`);
        connect();
      }, delay);
    } else {
      setError('Max reconnection attempts reached');
      setStatus('disconnected');
    }
  }, [wsConfig.reconnectInterval, wsConfig.maxReconnectAttempts, wsConfig.retryPolicy.maxDelay]);

  const connect = useCallback(async () => {
    // Get WebSocket token from auth service
    const token = authService.getWsToken();
    if (!token) {
      setError('No authentication token available. Please log in again.');
      return;
    }
    setStatus('connecting');
    setError(null);
    
    try {
      const token = await getAuthToken();
      const url = new URL(wsConfig.url);
      url.searchParams.append('token', token);
      const wsUrl = url.toString();
      
      ws.current = new WebSocket(wsUrl);
      ws.current.binaryType = 'arraybuffer';
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setStatus('connected');
        reconnectAttempts.current = 0;
        clearReconnect();
        setupHeartbeat();
        
        if (messageQueue.length > 0) {
          const messagesToSend = [...messageQueue];
          setMessageQueue([]);
          messagesToSend.forEach(msg => {
            if (ws.current?.readyState === WebSocket.OPEN) {
              try {
                ws.current.send(JSON.stringify({ content: msg.content }));
              } catch (error) {
                console.error('Error sending queued message:', error);
              }
            }
          });
        }
      };

      ws.current.onmessage = (event) => {
        try {
          let data;
          if (event.data instanceof ArrayBuffer) {
            const decoder = new TextDecoder();
            const text = decoder.decode(event.data);
            data = JSON.parse(text);
          } else {
            data = JSON.parse(event.data);
          }
          
          if (data.type === 'pong') {
            const latency = Date.now() - lastPingRef.current;
            const quality = Math.max(0, 100 - Math.min(latency / 10, 90));
            setConnectionQuality(Math.round(quality));
          } else if (data.content) {
            addMessage(data.content, 'received');
          }
        } catch (e) {
          console.error('Error processing message:', e);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
        handleReconnect();
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setStatus('disconnected');
        handleReconnect();
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating WebSocket:', errorMessage);
      setError(`Failed to connect to WebSocket server: ${errorMessage}`);
      handleReconnect();
    }
  }, [messageQueue, clearReconnect, setupHeartbeat, handleReconnect, addMessage]);

  const disconnect = useCallback(() => {
    clearReconnect();
    clearHeartbeat();
    if (ws.current) {
      try {
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'disconnect' }));
          setTimeout(() => {
            ws.current?.close();
          }, 100);
        } else {
          ws.current.close();
        }
      } catch (error) {
        console.error('Error during disconnect:', error);
      } finally {
        ws.current = null;
      }
    }
    setStatus('disconnected');
    reconnectAttempts.current = 0;
  }, [clearReconnect, clearHeartbeat]);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    
    const message = { 
      content: input,
      metadata: {
        timestamp: new Date().toISOString(),
        messageId: crypto.randomUUID(),
      }
    };
    
    try {
      if (status === 'connected' && ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
        addMessage(input, 'sent');
        setInput('');
      } else {
        setMessageQueue(prev => [...prev, { content: input }]);
        if (status !== 'connecting' && status !== 'reconnecting') {
          connect();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  }, [input, status, connect, addMessage]);

  useEffect(() => {
    connect();
    
    return () => {
      clearReconnect();
      clearHeartbeat();
      if (ws.current) {
        try {
          if (ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'disconnect' }));
            setTimeout(() => {
              ws.current?.close();
            }, 100);
          } else {
            ws.current.close();
          }
        } catch (error) {
          console.error('Error during cleanup:', error);
        } finally {
          ws.current = null;
        }
      }
    };
  }, [connect, clearReconnect, clearHeartbeat]);

  useEffect(() => {
    if (status !== 'connected') {
      setConnectionQuality(0);
      return;
    }

    const interval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const now = Date.now();
        const latency = now - lastPingRef.current;
        const quality = Math.max(0, 100 - Math.min(latency / 10, 90));
        setConnectionQuality(Math.round(quality));
      }
    }, 5000);

if (!isAuthenticated || !user) {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Content style={{ padding: '24px' }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 24 }}>Login</Title>
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
            style={{ marginBottom: 16 }}
          />
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
            onPressEnter={handleLogin}
            style={{ marginBottom: 24 }}
          />
          <Button 
            type="primary" 
            onClick={handleLogin}
            style={{ width: '100%' }}
            loading={status === 'connecting'}
          >
            Log in
          </Button>
        </Card>
      </Content>
    </Layout>
  );
}

return (
  <Layout style={{ minHeight: '100vh' }}>
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 24px'
      }}>
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          WebSocket Test ({user.email})
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          {status === 'connected' ? (
            <>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: connectionQuality > 70 ? '#52c41a' : connectionQuality > 30 ? '#faad14' : '#f5222d'
                  size="small"
                  style={{ marginLeft: 8 }}
                >
                  Disconnect
                </Button>
              </>
            ) : (
                  connectionQuality > 30 ? '#faad14' : '#f5222d',
              }} />
              <span>Connected ({connectionQuality}%)</span>
              <Button 
                type="primary" 
                danger 
                icon={<CloseCircleOutlined />} 
                onClick={disconnect}
                size="small"
                style={{ marginLeft: 8 }}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              type="primary" 
              icon={status === 'reconnecting' ? <SyncOutlined spin /> : <CheckCircleOutlined />} 
              onClick={connect}
              loading={status === 'connecting' || status === 'reconnecting'}
            >
              {status === 'reconnecting' ? 'Reconnecting...' : 'Connect'}
            </Button>
          )}
          <Button 
            type="text" 
            danger 
            icon={<CloseCircleOutlined />} 
            onClick={handleLogout}
            style={{ color: 'white', marginLeft: 16 }}
          >
            Logout
          </Button>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError(null)}
          />
        )}
        
        <Card>
          <div style={{ 
            height: '60vh', 
            overflowY: 'auto', 
            marginBottom: 16,
            padding: 16,
            border: '1px solid #f0f0f0',
            borderRadius: 4
          }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                style={{ 
                  textAlign: msg.type === 'sent' ? 'right' : 'left',
                  marginBottom: 8
                }}
              >
                <div 
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: 4,
                    backgroundColor: msg.type === 'sent' ? '#e6f7ff' : '#f5f5f5',
                    border: '1px solid #d9d9d9'
                  }}
                >
                  {msg.content}
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#8c8c8c',
                    marginTop: 4
                  }}>
                    {new Date(msg.timestamp || '').toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              autoSize={{ minRows: 2, maxRows: 6 }}
              disabled={status !== 'connected'}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              style={{ flex: 1 }}
            />
            <Button 
              type="primary" 
              onClick={sendMessage}
              disabled={status !== 'connected' || !input.trim()}
              style={{ height: 'auto' }}
            >
              Send
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WebSocketTestPage;
