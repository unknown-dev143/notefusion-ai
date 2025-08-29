// Simple script to verify Node.js environment
const fs = require('fs');
const path = require('path');

console.log('=== Node.js Environment Verification ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current directory:', process.cwd());

// Test file system access
try {
  const testFile = path.join(__dirname, 'test-verify-node.txt');
  fs.writeFileSync(testFile, 'test content');
  console.log('✓ File system write test: SUCCESS');
  
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✓ File system read test:', content === 'test content' ? 'SUCCESS' : 'FAILED');
  
  fs.unlinkSync(testFile);
  console.log('✓ File system cleanup: SUCCESS');
} catch (error) {
  console.error('File system test failed:', error.message);
}

// Test module loading
try {
  const os = require('os');
  console.log('✓ Core module loading: SUCCESS');
  console.log('  - CPU Cores:', os.cpus().length);
  console.log('  - Total Memory:', Math.round(os.totalmem() / (1024 * 1024)) + 'MB');
} catch (error) {
  console.error('Core module test failed:', error.message);
}

console.log('=== Verification Complete ===');
