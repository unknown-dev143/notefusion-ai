// Simple test to verify Node.js environment
const fs = require('fs');
const path = require('path');

console.log('=== Node.js Environment Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Test file system access
try {
  const testFile = path.join(__dirname, 'test-file.txt');
  
  // Write to file
  fs.writeFileSync(testFile, 'test content');
  console.log('✅ File system write: SUCCESS');
  
  // Read from file
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✅ File system read: SUCCESS');
  console.log('File content:', content);
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('✅ File cleanup: SUCCESS');
  
  console.log('\n✅ Node.js environment test completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error during test:', error.message);
  process.exit(1);
}
