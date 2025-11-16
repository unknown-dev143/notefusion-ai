// Diagnostic test for Node.js environment
console.log('=== Diagnostic Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());
console.log('Environment variables:', Object.keys(process.env).filter(k => k.startsWith('NODE_') || k.startsWith('NPM_') || k === 'PATH'));

// Test basic file system access
try {
  const files = require('fs').readdirSync('.');
  console.log('\nFiles in current directory:', files);
} catch (error) {
  console.error('File system access error:', error.message);
}

// Test module loading
try {
  const path = require('path');
  console.log('\nPath module loaded successfully');
  console.log('Current file path:', __filename);
  console.log('Current directory path:', __dirname);
} catch (error) {
  console.error('Module loading error:', error.message);
}

console.log('\n=== Diagnostic Test Complete ===');
