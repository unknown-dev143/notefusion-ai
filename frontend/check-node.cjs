// Simple CommonJS test file
console.log('=== Node.js Environment Check (CommonJS) ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Test basic operations
console.log('\n1. Testing basic operations:');
console.log('1 + 1 =', 1 + 1);
console.log('Type of console:', typeof console);
console.log('Type of process:', typeof process);

// Test file system
console.log('\n2. Testing file system...');
const fs = require('fs');
const path = require('path');

const testFile = 'test-file.txt';

try {
  // Write to file
  fs.writeFileSync(testFile, 'test');
  console.log('✅ File created successfully');
  
  // Read from file
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✅ File read successfully');
  console.log('File content:', content);
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('✅ File deleted successfully');
} catch (error) {
  console.error('❌ File system error:', error.message);
}

console.log('\n=== Check Complete ===');
