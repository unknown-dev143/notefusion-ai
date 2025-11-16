// Simple test to verify Node.js environment
const fs = require('fs');
const path = require('path');

console.log('=== Simple Node.js Test ===');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Test file system access
try {
  const testFile = path.join(__dirname, 'test-file.txt');
  
  // Write to file
  fs.writeFileSync(testFile, 'test content');
  console.log('File write: SUCCESS');
  
  // Read from file
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('File read: SUCCESS');
  console.log('File content:', content);
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('File cleanup: SUCCESS');
  
  console.log('\n✅ Test completed successfully!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
}
