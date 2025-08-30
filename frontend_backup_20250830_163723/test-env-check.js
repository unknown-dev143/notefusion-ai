// Simple test to verify the test environment
console.log('=== Test Environment Check ===');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Test basic functionality
try {
  const fs = require('fs');
  console.log('File system access: OK');
  
  // Create a test file
  const testFile = 'test-env-check.txt';
  fs.writeFileSync(testFile, 'test content');
  console.log('File write: OK');
  
  // Read the test file
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('File read:', content === 'test content' ? 'OK' : 'FAILED');
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('File cleanup: OK');
  
  console.log('=== Test Environment Check Completed ===');
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}
