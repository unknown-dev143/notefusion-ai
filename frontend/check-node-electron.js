// Simple script to check Node.js and Electron setup
console.log('=== Node.js and Electron Setup Check ===');

// Check Node.js version
console.log('Node.js Version:', process.version);

// Check if we can require Electron
try {
  const electron = require('electron');
  console.log('Electron is installed!');
  console.log('Electron Version:', process.versions.electron || 'Not available');
  console.log('Chrome Version:', process.versions.chrome || 'Not available');
} catch (error) {
  console.error('Error requiring Electron:', error.message);
  console.error('Please make sure Electron is installed in your project.');
  console.log('Try running: npm install electron --save-dev');
}

// Check environment variables
console.log('\n=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('ELECTRON_RUN_AS_NODE:', process.env.ELECTRON_RUN_AS_NODE || 'Not set');

// Check file system access
const fs = require('fs');
const path = require('path');
try {
  const testFile = path.join(__dirname, 'test-write.txt');
  fs.writeFileSync(testFile, 'Test write successful!');
  console.log('File system write test: SUCCESS');
  fs.unlinkSync(testFile);
} catch (error) {
  console.error('File system write test: FAILED', error.message);
}

console.log('\nCheck complete. Press any key to exit...');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => process.exit(0));
