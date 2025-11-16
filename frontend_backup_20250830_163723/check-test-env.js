// Simple script to check the testing environment
console.log('=== Testing Environment Check ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Check for required modules
const requiredModules = [
  'vitest',
  '@testing-library/react',
  'react',
  'react-dom'
];

console.log('\n=== Checking for required modules ===');
let allModulesFound = true;

requiredModules.forEach(moduleName => {
  try {
    const modulePath = require.resolve(moduleName);
    console.log(`✅ Found: ${moduleName} at ${modulePath}`);
  } catch (error) {
    console.error(`❌ Missing: ${moduleName}`);
    allModulesFound = false;
  }
});

if (!allModulesFound) {
  console.log('\n⚠️  Some required modules are missing. Try running: npm install');
  process.exit(1);
}

console.log('\n✅ All required modules are installed!');
console.log('\n=== Running a simple test ===');

// Run a simple test
const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ Test failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Test passed: ${message}`);
};

assert(1 + 1 === 2, 'Basic arithmetic works');

// Test DOM environment
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

document.body.innerHTML = '<div id="test">Hello World</div>';
assert(document.getElementById('test'), 'Can access DOM elements');
assert(document.getElementById('test').textContent === 'Hello World', 'DOM manipulation works');

console.log('\n✅ All tests passed!');
console.log('\nYour testing environment appears to be set up correctly.');
