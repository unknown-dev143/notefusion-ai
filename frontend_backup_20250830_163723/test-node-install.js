const fs = require('fs');
const path = require('path');

// Create a test file
const testFilePath = path.join(__dirname, 'node-test-output.txt');
const testContent = `Node.js Test Output
==================
Timestamp: ${new Date().toISOString()}
Node.js Version: ${process.version}
Platform: ${process.platform}
Architecture: ${process.arch}
`;

try {
  // Write test file
  fs.writeFileSync(testFilePath, testContent);
  console.log(`Test file created at: ${testFilePath}`);
  
  // Read back the file
  const content = fs.readFileSync(testFilePath, 'utf8');
  console.log('File content:');
  console.log('-------------');
  console.log(content);
  
  // Clean up
  fs.unlinkSync(testFilePath);
  console.log('Test file removed');
  
  console.log('\nNode.js test completed successfully!');
} catch (error) {
  console.error('Error during test:', error);
  process.exit(1);
}
