// Simple test to verify Vitest setup
console.log('Testing Vitest setup...');

// Import Vitest functions
import { test, expect } from 'vitest';

// Simple test
test('1 + 1 equals 2', () => {
  console.log('Running test: 1 + 1 equals 2');
  expect(1 + 1).toBe(2);
});

console.log('Test file loaded.');
