// Simple test to verify Node.js environment
console.log('Test started');
console.log('Node.js version:', process.version);

// Simple test function
function add(a, b) {
  return a + b;
}

// Test case
const result = add(2, 3);
console.log('2 + 3 =', result);

// Verify the result
if (result === 5) {
  console.log('Test passed!');  process.exit(0);
} else {
  console.error('Test failed!');
  process.exit(1);
}
