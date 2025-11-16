// Environment test script
const fs = require('fs');
const path = require('path');

// Test file path
const testFile = path.join(__dirname, 'test-env.txt');

// Test content
const content = `Environment Test
===============
Timestamp: ${new Date().toISOString()}
Node.js Version: ${process.version}
Platform: ${process.platform}
Architecture: ${process.arch}
Current Directory: ${__dirname}
`;

console.log('=== Starting Environment Test ===');
console.log(content);

try {
  // Test file write
  console.log('Testing file write...');
  fs.writeFileSync(testFile, content);
  console.log('✅ File write test passed');
  
  // Test file read
  console.log('Testing file read...');
  const readContent = fs.readFileSync(testFile, 'utf8');
  console.log('✅ File read test passed');
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('✅ File cleanup test passed');
  
  // Test Electron require
  console.log('Testing Electron require...');
  const electron = require('electron');
  console.log('✅ Electron require test passed');
  
  console.log('\n✅ All tests passed!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('Please install the required dependencies:');
    console.error('npm install electron --save-dev');
  }
  process.exit(1);
}
