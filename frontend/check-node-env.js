// Simple script to check Node.js environment
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Test basic functionality
try {
  const fs = require('fs');
  const path = require('path');
  
  // Create a test file
  const testFile = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(testFile, 'test content');
  console.log('File system write test: SUCCESS');
  
  // Read the test file
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('File system read test:', content === 'test content' ? 'SUCCESS' : 'FAILED');
  
  // Clean up
  fs.unlinkSync(testFile);
  
  // Test module resolution
  console.log('React path:', require.resolve('react'));
  console.log('Environment check completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Error during environment check:', error);
  process.exit(1);
}
