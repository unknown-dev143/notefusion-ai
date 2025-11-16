// Simple Vitest verification script
console.log('=== Vitest Verification ===');

// Test basic JavaScript
console.log('1. Basic JavaScript test:');
console.log('1 + 1 =', 1 + 1);

// Test async/await
console.log('\n2. Testing async/await...');
const testAsync = async () => {
  return new Promise(resolve => setTimeout(() => resolve('success'), 100));
};

testAsync()
  .then(result => console.log('Async test result:', result))
  .catch(err => console.error('Async test failed:', err));

// Test ES modules
console.log('\n3. Testing ES modules...');
try {
  const fs = await import('fs/promises');
  console.log('fs module imported successfully');
  
  // Test file operations
  const testFile = 'vitest-verify.txt';
  await fs.writeFile(testFile, 'test');
  console.log('File created successfully');
  
  const content = await fs.readFile(testFile, 'utf8');
  console.log('File content:', content);
  
  await fs.unlink(testFile);
  console.log('File deleted successfully');
} catch (error) {
  console.error('File system test failed:', error.message);
}

console.log('\n=== Verification Complete ===');

// Run Vitest tests if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  console.log('\nRunning Vitest tests...');
  const { startVitest } = await import('vitest/node');
  
  startVitest('test', ['--run']).then((hasErrors) => {
    process.exit(hasErrors ? 1 : 0);
  });
}
