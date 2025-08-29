const fs = require('fs');
const path = require('path');

console.log('=== Environment Check ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Test file system access
try {
  const testFile = path.join(__dirname, 'test-write.txt');
  fs.writeFileSync(testFile, 'Test write operation');
  console.log('File system write test: SUCCESS');
  fs.unlinkSync(testFile);
} catch (error) {
  console.error('File system write test FAILED:', error.message);
}

// Test environment variables
console.log('\nEnvironment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PATH:', process.env.PATH ? '*** PATH is set ***' : 'PATH is not set');

// Test module resolution
try {
  const react = require.resolve('react');
  console.log('\nReact module found at:', react);
} catch (error) {
  console.error('\nReact module not found:', error.message);
}

console.log('\nEnvironment check completed.');
