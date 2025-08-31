// Simple Vitest setup check
console.log('Starting Vitest setup check...');

// Test basic JavaScript
console.log('1. Basic JavaScript test:');
console.log('1 + 1 =', 1 + 1);

// Test Node.js built-in modules
try {
  const fs = require('fs');
  console.log('2. Node.js fs module loaded successfully');
  
  // Test file system access
  const testFile = 'test-file.txt';
  fs.writeFileSync(testFile, 'test');
  console.log('3. Test file created successfully');
  
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('4. File content:', content);
  
  fs.unlinkSync(testFile);
  console.log('5. Test file deleted successfully');
  
} catch (error) {
  console.error('Error in Node.js test:', error.message);
}

// Test Vitest
try {
  const { test, expect } = require('vitest');
  console.log('6. Vitest loaded successfully');
  
  test('1 + 1 equals 2', () => {
    expect(1 + 1).toBe(2);
    console.log('7. Vitest test passed!');
  });
  
} catch (error) {
  console.error('Error in Vitest test:', error.message);
}

console.log('Setup check completed.');
