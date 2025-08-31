// Simple Node.js environment test
console.log('=== Node.js Environment Test ===');
console.log('Node.js Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current Directory:', process.cwd());
console.log('Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PATH:', process.env.PATH ? 'Set' : 'Not set');
console.log('- ELECTRON_RUN_AS_NODE:', process.env.ELECTRON_RUN_AS_NODE || 'not set');
console.log('================================');

// Test file system access
const fs = require('fs');
const path = require('path');

try {
  const testFile = path.join(process.cwd(), 'test-write.txt');
  fs.writeFileSync(testFile, 'Test write successful!');
  console.log('File system write test: SUCCESS');
  fs.unlinkSync(testFile);
} catch (err) {
  console.error('File system write test: FAILED', err);
}

// Test module resolution
try {
  require('electron');
  console.log('Electron module test: SUCCESS');
} catch (err) {
  console.error('Electron module test: FAILED', err.message);
}

console.log('Test complete. Press any key to exit...');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));
