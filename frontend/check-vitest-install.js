// Simple script to check if Vitest is installed and accessible
console.log('=== Checking Vitest Installation ===');

try {
  // Try to require Vitest
  const vitest = require('vitest');
  console.log('✅ Vitest is installed');
  console.log('Version:', vitest.version);
  
  // Check if we can access test utilities
  console.log('\n=== Test Utilities ===');
  console.log('test function:', typeof vitest.test === 'function' ? '✅ Available' : '❌ Missing');
  console.log('expect function:', typeof vitest.expect === 'function' ? '✅ Available' : '❌ Missing');
  
  // Check if we can access common matchers
  console.log('\n=== Common Matchers ===');
  console.log('toBe:', typeof vitest.expect(1).toBe === 'function' ? '✅ Available' : '❌ Missing');
  console.log('toEqual:', typeof vitest.expect({}).toEqual === 'function' ? '✅ Available' : '❌ Missing');
  
} catch (error) {
  console.error('❌ Error checking Vitest installation:', error.message);
  console.log('\nTry running: npm install -D vitest');
  process.exit(1);
}

console.log('\n✅ Vitest installation check complete!');
