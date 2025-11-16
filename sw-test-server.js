const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Parse URL
  const parsedUrl = url.parse(req.url);
  // Extract URL path
  let pathname = path.join(ROOT_DIR, parsedUrl.pathname);
  
  // If the path ends with /, serve index.html
  if (pathname.endsWith('/')) {
    pathname = path.join(pathname, 'sw-test-direct.html');
  }
  
  // Get the file extension
  const ext = path.parse(pathname).ext;
  
  // Read file from file system
  fs.readFile(pathname, (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      // Serve 404 page
      fs.readFile(path.join(ROOT_DIR, '404.html'), (err, notFoundPage) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found\n');
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(notFoundPage);
        }
      });
      return;
    }
    
    // Set the content type based on the file extension
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Set CORS headers to allow service worker registration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Service-Worker-Allowed', '/');
    
    // Write the content of the file to the response
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
  
  // Open the default browser to the test page
  const { exec } = require('child_process');
  const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
  exec(`${start} http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close any other servers using this port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
