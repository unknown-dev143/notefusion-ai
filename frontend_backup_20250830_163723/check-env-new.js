// Script to check Node.js environment and system information
console.log('=== System Information ===');
console.log('Node.js Version:', process.version);
console.log('Platform:', process.platform, process.arch);
console.log('Current Directory:', process.cwd());
console.log('Environment Variables:');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  - PATH:', process.env.PATH);
console.log('  - NVM_HOME:', process.env.NVM_HOME || 'not set');
console.log('  - NODE_PATH:', process.env.NODE_PATH || 'not set');

// Test file system access
try {
  const fs = require('fs');
  const files = fs.readdirSync('.');
  console.log('\nCurrent directory contents:', files);
} catch (error) {
  console.error('Error accessing file system:', error.message);
}

// Test network access
try {
  const http = require('http');
  console.log('\nHTTP module loaded successfully');
} catch (error) {
  console.error('Error loading HTTP module:', error.message);
}

// Test Vite import
try {
  require('vite');
  console.log('Vite is installed');
} catch (error) {
  console.error('Vite is not installed:', error.message);
}

console.log('\nEnvironment check complete.');
