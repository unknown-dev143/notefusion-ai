import { createServer } from 'http';
import { readFile, readdir } from 'fs/promises';
import { join, extname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

const PORT = 3001;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = createServer(async (req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Handle CORS
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
      const files = await readdir('.');
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
      return;
    } catch (error) {
      console.error('Error reading directory:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading directory');
      return;
    }
  }

  // Serve files
  let filePath = resolve('.' + req.url);
  if (filePath === resolve('.')) {
    filePath = resolve('./test.html');
  }
  
  const extname_ = String(extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname_] || 'application/octet-stream';
  
  try {
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      const notFound = await readFile('./404.html').catch(() => 'File not found');
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(notFound, 'utf-8');
    } else {
      res.writeHead(500);
      res.end(`Server Error: ${error.code}`);
    }
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
