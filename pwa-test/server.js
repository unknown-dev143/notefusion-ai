const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const CACHE_CONTROL = 'public, max-age=31536000, immutable';
const COMPRESSIBLE_TYPES = [
  'text/html',
  'text/css',
  'application/javascript',
  'application/json',
  'application/manifest+json'
];
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/octet-stream'
};

// Helper function to set security headers
const setSecurityHeaders = (res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
};

// Helper function to compress response
const compressResponse = (content, contentType, res) => {
  if (COMPRESSIBLE_TYPES.includes(contentType)) {
    res.setHeader('Content-Encoding', 'gzip');
    return zlib.gzipSync(content);
  }
  return content;
};

const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set security headers for all responses
  setSecurityHeaders(res);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Handle service worker scope
  if (req.url === '/sw.js') {
    serveFile(res, './sw.js', 'text/javascript');
    return;
  }
  
  // Handle manifest
  if (req.url === '/manifest.json') {
    serveFile(res, './manifest.json', 'application/json');
    return;
  }
  
  // Handle offline page
  if (req.url === '/offline.html') {
    serveFile(res, './offline.html', 'text/html');
    return;
  }
  
  // Handle root path
  if (req.url === '/') {
    serveFile(res, './index.html', 'text/html');
    return;
  }
  
  // Serve other static files
  const filePath = `.${req.url}`;
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  serveFile(res, filePath, contentType);
});

const serveFile = async (res, filePath, contentType) => {
  try {
    let content = await fs.readFile(filePath);
    
    // Set cache headers for static assets
    if (filePath.endsWith('.js') || 
        filePath.endsWith('.css') || 
        filePath.endsWith('.png') || 
        filePath.endsWith('.json') ||
        filePath.endsWith('.webmanifest')) {
      res.setHeader('Cache-Control', CACHE_CONTROL);
    }
    
    // Set content type and compress if needed
    res.setHeader('Content-Type', contentType);
    
    // Compress the response if the content type is compressible
    const compressedContent = compressResponse(content, contentType, res);
    res.writeHead(200);
    res.end(compressedContent);
    
  } catch (err) {
    console.error(`Error serving file ${filePath}:`, err);
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Server Error: ${err.code}`);
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Press Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
