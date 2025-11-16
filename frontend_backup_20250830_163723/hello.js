// Simple test file
console.log('=== Node.js Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Test file system
const fs = require('fs');
try {
  fs.writeFileSync('test.txt', 'Hello, World!');
  console.log('File write: SUCCESS');
  
  const content = fs.readFileSync('test.txt', 'utf8');
  console.log('File read:', content);
  
  fs.unlinkSync('test.txt');
  console.log('File cleanup: SUCCESS');
} catch (error) {
  console.error('File system error:', error.message);
}

console.log('Test completed!');
