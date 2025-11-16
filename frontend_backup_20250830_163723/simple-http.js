const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3002;

const server = http.createServer(async (req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    // Serve index.html for the root path
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    
    try {
        const content = await fs.readFile(filePath);
        res.writeHead(200);
        res.end(content);
    } catch (error) {
        console.error('Error:', error);
        res.writeHead(404);
        res.end('File not found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});

process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});
