console.log('Test environment is working!');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

try {
  const fs = require('fs');
  const files = fs.readdirSync('.');
  console.log('Files in current directory:', files);
} catch (error) {
  console.error('Error reading directory:', error.message);
}
