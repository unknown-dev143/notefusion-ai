// Simple Vitest debug file
console.log('Starting Vitest debug...');

try {
  // Test basic Node.js functionality
  console.log('1. Basic Node.js test:');
  console.log('1 + 1 =', 1 + 1);
  console.log('process.version:', process.version);

  // Test require
  console.log('\n2. Testing require:');
  const path = require('path');
  console.log('Path module loaded:', !!path);
  console.log('Current directory:', process.cwd());

  // Test ES modules
  console.log('\n3. Testing ES modules:');
  import('node:fs').then(fs => {
    console.log('FS module loaded via ESM');
  }).catch(err => {
    console.error('Failed to load FS module via ESM:', err.message);
  });

  // Test Vitest
  console.log('\n4. Testing Vitest:');
  import('vitest').then(({ test, expect }) => {
    console.log('Vitest loaded successfully');
    test('1 + 1 equals 2', () => {
      expect(1 + 1).toBe(2);
      console.log('Test passed!');
    });
  }).catch(err => {
    console.error('Failed to load Vitest:', err.message);
  });

} catch (error) {
  console.error('Error in test:', error);
}
