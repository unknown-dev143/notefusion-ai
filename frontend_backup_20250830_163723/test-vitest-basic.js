// Simple Vitest test
console.log('Starting Vitest test...');

// Import Vitest
const { test, expect } = require('vitest');

// Simple test
test('1 + 1 equals 2', () => {
  console.log('Running test: 1 + 1 equals 2');
  expect(1 + 1).toBe(2);
  console.log('Test passed!');
});

console.log('Test file loaded successfully.');
