const http = require('http');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const server = http.createServer((req, res) => {
    // Serve the test page
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'test-cmd.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading test page');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
    // Handle command execution
    else if (req.method === 'POST' && req.url === '/api/run-command') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { command } = JSON.parse(body);
                console.log('Executing command:', command);
                
                exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
                    if (error) {
                        res.writeHead(500);
                        return res.end(`Error: ${error.message}`);
                    }
                    if (stderr) {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        return res.end(stderr);
                    }
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(stdout || 'Command executed successfully (no output)');
                });
            } catch (e) {
                res.writeHead(400);
                res.end('Invalid request');
            }
        });
    }
    // Handle other routes
    else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Open http://localhost:3000 in your browser to test commands');
});
