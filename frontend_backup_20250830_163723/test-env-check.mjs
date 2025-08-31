// Simple test to verify the test environment using ES modules
console.log('=== Test Environment Check (ESM) ===');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Test basic functionality
try {
  import { writeFileSync, readFileSync, unlinkSync } from 'fs';
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';

  console.log('File system access: OK');
  
  // Create a test file
  const testFile = 'test-env-check.txt';
  writeFileSync(testFile, 'test content');
  console.log('File write: OK');
  
  // Read the test file
  const content = readFileSync(testFile, 'utf8');
  console.log('File read:', content === 'test content' ? 'OK' : 'FAILED');
  
  // Clean up
  unlinkSync(testFile);
  console.log('File cleanup: OK');
  
  console.log('=== Test Environment Check Completed ===');
} catch (error) {
  console.error('Test failed:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
}
