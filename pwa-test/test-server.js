const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002; // Different port to avoid conflicts

const server = http.createServer((req, res) => {
    console.log(`Request received for: ${req.url}`);
    
    // Simple response for any request
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test server is working!');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop the server');
});
