// Simple test to verify Node.js environment
console.log('=== Node.js Environment Test ===');

// Basic info
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Test basic operations
try {
  // Test file system
  const fs = require('fs');
  const testFile = 'test-temp-file.txt';
  
  // Write to file
  fs.writeFileSync(testFile, 'test');
  console.log('✅ File write successful');
  
  // Read from file
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('File content:', content);
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('✅ File cleanup successful');
  
  console.log('\n✅ Environment test passed!');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
