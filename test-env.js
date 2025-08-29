// Simple test script to verify Node.js environment
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// Test file system access
try {
  const fs = require('fs');
  console.log('File system access test:', fs.existsSync('package.json') ? '✅ package.json exists' : '❌ package.json not found');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('Project name:', packageJson.name);
  console.log('Node version required:', packageJson.engines?.node || 'Not specified');
  
  console.log('\n✅ Node.js environment test passed!');
} catch (error) {
  console.error('❌ Error during test:', error.message);
  process.exit(1);
}
