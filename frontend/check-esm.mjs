// Test ES Module environment
console.log('=== ESM Environment Test ===');

// Basic info
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Test file system operations
import { writeFileSync, readFileSync, unlinkSync } from 'fs';

try {
  const testFile = 'test-temp-file.txt';
  
  // Write to file
  writeFileSync(testFile, 'test content');
  console.log('✅ File write successful');
  
  // Read from file
  const content = readFileSync(testFile, 'utf8');
  console.log('File content:', content);
  
  // Clean up
  unlinkSync(testFile);
  console.log('✅ File cleanup successful');
  
  console.log('\n✅ ESM Environment test passed!');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
}
