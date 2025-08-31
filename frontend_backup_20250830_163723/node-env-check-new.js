// Simple Node.js environment check
console.log('=== Node.js Environment Check ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);

// Test basic operations
console.log('\n1. Testing basic operations:');
console.log('1 + 1 =', 1 + 1);

// Test file system
console.log('\n2. Testing file system...');
const fs = require('fs');
const path = require('path');

try {
  const testFile = 'test-file.txt';
  
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
  
  console.log('\n✅ All tests passed! Node.js environment is working correctly.');
} catch (error) {
  console.error('❌ Test failed:', error.message);
}
