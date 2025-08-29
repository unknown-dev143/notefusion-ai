// Simple Node.js check
console.log('=== Node.js Check ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);

// Test basic operations
console.log('1 + 1 =', 1 + 1);

// Test file system
const fs = require('fs');
const path = require('path');

const testFile = 'test-file.txt';

try {
  // Write to file
  fs.writeFileSync(testFile, 'test');
  console.log('File created successfully');
  
  // Read from file
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('File content:', content);
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('File deleted successfully');
  
  console.log('\n✅ Node.js is working correctly!');
} catch (error) {
  console.error('❌ Error:', error.message);
}
