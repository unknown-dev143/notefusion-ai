console.log('Starting debug server...');

// Load environment variables first
require('dotenv').config();
console.log('Environment variables loaded');

const http = require('http');
const PORT = 3000;

console.log('Creating server instance...');
const server = http.createServer((req, res) => {
    console.log(`\n--- New Request ---`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);
    
    // Simple response
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Debug server is running');
});

// Start the server
console.log(`Starting server on port ${PORT}...`);
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is now running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});

// Error handling
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
    } else {
        console.error('Unexpected error:', error);
    }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});

console.log('Debug server setup complete');
