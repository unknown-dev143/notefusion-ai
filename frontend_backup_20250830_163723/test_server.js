const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('Server is running!');
  process.exit(0);
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  console.log('Server is not running or not accessible');
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Request timed out - server may not be running');
  req.destroy();
  process.exit(1);
});

req.end();
