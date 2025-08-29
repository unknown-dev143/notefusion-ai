// Test direct Node.js execution
console.log('Node.js Test Output');
console.log('------------------');
console.log('1. Basic test');
console.log('2. 1 + 1 =', 1 + 1);

// Test file system
const fs = require('fs');
const path = require('path');

const testFile = 'node-test-file.txt';

// Write to file
fs.writeFileSync(testFile, 'Node.js test file');
console.log('3. Created test file');

// Read from file
const content = fs.readFileSync(testFile, 'utf8');
console.log('4. Read from file:', content);

// Clean up
fs.unlinkSync(testFile);
console.log('5. Deleted test file');

console.log('Test completed successfully!');
