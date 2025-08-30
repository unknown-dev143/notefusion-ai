// Simple HTTP server for testing
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle root URL
    if (req.url === '/') {
        try {
            const files = await fs.readdir('.');
            const fileList = files.map(file => `<li><a href="/${file}">${file}</a></li>`).join('\n');
            const html = `
                <!DOCTYPE html>
                <html>
                <head><title>Directory Listing</title></head>
                <body>
                    <h1>Directory Listing</h1>
                    <ul>${fileList}</ul>
                </body>
                </html>
            `;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } catch (error) {
            console.error('Error reading directory:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading directory');
        }
        return;
    }

    // Serve files
    let filePath = path.join(__dirname, req.url);
    
    try {
        const data = await fs.readFile(filePath);
        res.writeHead(200);
        res.end(data);
    } catch (error) {
        console.error('Error serving file:', error);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1><p>The requested file was not found on this server.</p>');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');});

process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});
