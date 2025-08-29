// Simple Node.js environment check
console.log('=== Node.js Environment Check ===');

// Basic info
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Test basic operations
console.log('\n1. Testing basic operations:');
console.log('1 + 1 =', 1 + 1);
console.log('Type of console:', typeof console);
console.log('Type of process:', typeof process);

// Test ES modules
console.log('\n2. Testing ES modules...');
try {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  console.log('✅ fs and path modules imported successfully');
  
  // Test file operations
  const testFile = 'test-file.txt';
  await fs.writeFile(testFile, 'test');
  console.log('✅ File created successfully');
  
  const content = await fs.readFile(testFile, 'utf8');
  console.log('✅ File read successfully');
  console.log('File content:', content);
  
  await fs.unlink(testFile);
  console.log('✅ File deleted successfully');
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n=== Environment Check Complete ===');
