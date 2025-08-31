console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current directory:', process.cwd());

// Try to require vitest
try {
  const vitest = require('vitest');
  console.log('Vitest version:', vitest.version);
} catch (error) {
  console.error('Error loading vitest:', error.message);
}
