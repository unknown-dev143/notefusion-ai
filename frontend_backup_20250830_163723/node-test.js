console.log('Node.js test started');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, process.arch);
console.log('Current directory:', process.cwd());

// Test file system access
const fs = require('fs');
const path = require('path');

try {
  const files = fs.readdirSync('.');
  console.log('\nFiles in current directory:');
  files.forEach(file => {
    const stats = fs.statSync(file);
    console.log(`- ${file} (${stats.isDirectory() ? 'dir' : 'file'}, ${stats.size} bytes)`);
  });
} catch (error) {
  console.error('Error reading directory:', error.message);
}

console.log('\nNode.js test completed');
