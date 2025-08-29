// Simple Node.js test (CommonJS)
console.log('=== Node.js Test (CommonJS) ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);

// Test file system
const fs = require('fs');
const path = require('path');

const testFile = 'test-file.txt';

try {
  // Write to file
  fs.writeFileSync(testFile, 'test');
  console.log('✅ File created');
  
  // Read from file
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✅ File read:', content);
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('✅ File deleted');
  
  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
