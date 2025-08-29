// Simple test to verify the testing environment
console.log('=== Testing Environment ===');

// Basic assertions
function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  }
  console.log('✅ PASS:', message);
}

// Test 1: Basic JavaScript
assert(1 + 1 === 2, 'Basic arithmetic works');

// Test 2: Node.js environment
assert(typeof process !== 'undefined', 'Running in Node.js environment');

// Test 3: File system access
try {
  const fs = require('fs');
  const testFile = 'test-temp-file.txt';
  fs.writeFileSync(testFile, 'test');
  const content = fs.readFileSync(testFile, 'utf8');
  fs.unlinkSync(testFile);
  assert(content === 'test', 'File system operations work');
} catch (error) {
  console.error('❌ File system test failed:', error.message);
  process.exit(1);
}

// Test 4: Module resolution
try {
  const path = require('path');
  assert(path.join('a', 'b') === 'a\\b' || path.join('a', 'b') === 'a/b', 'Path module works');
} catch (error) {
  console.error('❌ Module resolution failed:', error.message);
  process.exit(1);
}

console.log('\n✅ All tests passed! Environment is ready for testing.');
