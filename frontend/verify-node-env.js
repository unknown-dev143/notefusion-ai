// Simple test to verify Node.js environment
console.log('=== Node.js Environment Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Test basic functionality
try {
  // Test file system operations
  const fs = require('fs');
  const path = require('path');
  
  const testFile = 'test-file-' + Date.now() + '.txt';
  
  // Write to file
  fs.writeFileSync(testFile, 'test content');
  console.log('✅ File write successful');
  
  // Read from file
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✅ File read successful');
  
  // Verify content
  if (content === 'test content') {
    console.log('✅ File content is correct');
  } else {
    console.log('❌ File content is incorrect');
  }
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('✅ File cleanup successful');
  
  // Test module resolution
  const _ = require('lodash');
  console.log('✅ Can require external modules');
  
  console.log('\n✅ All tests passed!');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
