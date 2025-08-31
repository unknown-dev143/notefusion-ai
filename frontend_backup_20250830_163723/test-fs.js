// Simple filesystem test
const fs = require('fs');
const path = require('path');

// Test file path
const testFile = path.join(__dirname, 'fs-test.txt');

// Test content
const content = `Filesystem Test
===============
Timestamp: ${new Date().toISOString()}
Node.js Version: ${process.version}
Platform: ${process.platform}
Architecture: ${process.arch}
`;

try {
  // Write test
  fs.writeFileSync(testFile, content);
  console.log(`Test file written to: ${testFile}`);
  
  // Read test
  const readContent = fs.readFileSync(testFile, 'utf8');
  console.log('File content:');
  console.log('-------------');
  console.log(readContent);
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('Test file removed');
  
  console.log('\n✅ Filesystem test passed!');
} catch (error) {
  console.error('❌ Filesystem test failed:', error.message);
  process.exit(1);
}
