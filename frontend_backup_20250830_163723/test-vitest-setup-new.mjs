// Simple Vitest test file
console.log('Starting Vitest test...');

// Test basic JavaScript
console.log('1 + 1 =', 1 + 1);

// Test async/await
const testAsync = async () => {
  return new Promise(resolve => setTimeout(() => resolve('done'), 100));
};

testAsync().then(result => {
  console.log('Async test:', result);
  
  // Run Vitest test
  runTests();
}).catch(console.error);

function runTests() {
  const { test, expect } = require('vitest');
  
  test('1 + 1 equals 2', () => {
    console.log('Running test: 1 + 1 equals 2');
    expect(1 + 1).toBe(2);
    console.log('Test passed!');
  });
  
  test('simple object test', () => {
    const obj = { a: 1 };
    obj.b = 2;
    expect(obj).toEqual({ a: 1, b: 2 });
  });
  
  console.log('All tests completed');
}
