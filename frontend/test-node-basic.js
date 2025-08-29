// Simple test to verify Node.js is working
console.log('=== Node.js Environment Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Basic file system test
const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, 'test-temp-file.txt');

// Write to file
fs.writeFileSync(testFile, 'test content');
console.log('✅ Successfully wrote to file');

// Read from file
const content = fs.readFileSync(testFile, 'utf8');
console.log('✅ Successfully read from file');
console.log('File content:', content);

// Clean up
fs.unlinkSync(testFile);
console.log('✅ Successfully cleaned up test file');

console.log('\n✅ Node.js environment test completed successfully!');
