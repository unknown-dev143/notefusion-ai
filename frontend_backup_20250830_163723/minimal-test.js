// Minimal test file
console.log('Minimal test is running!');
process.stdout.write('Standard output test\n');
process.stderr.write('Standard error test\n');

// Write to a file
const fs = require('fs');
fs.writeFileSync('minimal-test-output.txt', 'Test file created successfully!');

console.log('Test file created: minimal-test-output.txt');
process.exit(0);
