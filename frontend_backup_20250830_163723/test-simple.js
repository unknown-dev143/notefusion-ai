// Simple test to verify Node.js environment
console.log('=== Node.js Environment Test ===');

// Test basic JavaScript
console.log('1. Testing basic operations:');
console.log('1 + 1 =', 1 + 1);

// Test Node.js specific globals
console.log('\n2. Testing Node.js globals:');
console.log('process.version:', process.version);
console.log('process.platform:', process.platform);
console.log('__dirname:', __dirname);

// Test file system
console.log('\n3. Testing file system access...');
const fs = require('fs');
const path = require('path');

try {
  const testFile = path.join(__dirname, 'test-file.txt');
  
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
  process.exit(1);
}

console.log('All tests passed!');
