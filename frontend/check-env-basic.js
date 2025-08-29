// Basic environment check
console.log('=== Basic Environment Check ===');

// Check Node.js version
console.log('Node.js version:', process.version);

// Check if we can require core modules
try {
  const fs = require('fs');
  const path = require('path');
  console.log('✅ Core modules can be required');
  
  // Test file system access
  const testFile = path.join(__dirname, 'test-temp-file.txt');
  fs.writeFileSync(testFile, 'test');
  const content = fs.readFileSync(testFile, 'utf8');
  fs.unlinkSync(testFile);
  
  if (content === 'test') {
    console.log('✅ File system operations work');
  } else {
    console.log('❌ File system test failed: Unexpected content');
  }
} catch (error) {
  console.error('❌ Core module test failed:', error.message);
}

// Check if we can import from node_modules
try {
  const _ = require('lodash');
  console.log('✅ Can import from node_modules');
} catch (error) {
  console.error('❌ Failed to import from node_modules:', error.message);
}

console.log('\nEnvironment check completed.');
