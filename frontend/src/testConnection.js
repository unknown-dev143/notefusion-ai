// Test environment variables and WebSocket connection
console.log('Testing environment variables and WebSocket connection...');

// Log environment variables
console.log('Environment variables:', window._env_);
console.log('API_BASE_URL:', window._env_?.REACT_APP_API_URL || 'Not set');
console.log('WS_BASE_URL:', window._env_?.REACT_APP_WS_URL || 'Not set');

// Test WebSocket connection
function testWebSocket() {
  const wsUrl = window._env_?.REACT_APP_WS_URL || 'ws://localhost:8000';
  const clientId = `test-client-${Math.random().toString(36).substr(2, 9)}`;
  const ws = new WebSocket(`${wsUrl}/ws/${clientId}`);

  ws.onopen = () => {
    console.log('WebSocket connection established');
    
    // Send authentication message
    const authMsg = {
      type: 'AUTH',
      token: 'test_token',
      user_id: 'test_user'
    };
    ws.send(JSON.stringify(authMsg));
    console.log('Sent AUTH message:', authMsg);
    
    // Send a test message after a short delay
    setTimeout(() => {
      const testMsg = {
        type: 'ECHO',
        message: 'Hello, WebSocket!',
        timestamp: Date.now()
      };
      ws.send(JSON.stringify(testMsg));
      console.log('Sent test message:', testMsg);
    }, 1000);
  };

  ws.onmessage = (event) => {
    console.log('Received message:', event.data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = (event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
  };
  
  return ws;
}

// Run the test
const wsConnection = testWebSocket();

// Close the connection after 10 seconds
setTimeout(() => {
  console.log('Closing test WebSocket connection');
  wsConnection.close();
}, 10000);
