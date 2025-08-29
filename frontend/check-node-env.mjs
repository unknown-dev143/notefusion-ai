// Simple Node.js environment check
console.log('=== Node.js Environment Check ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Test basic operations
console.log('\nTesting basic operations...');
console.log('1 + 1 =', 1 + 1);
console.log('Type of console:', typeof console);
console.log('Type of process:', typeof process);

// Test file system
console.log('\nTesting file system...');
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFile = join(__dirname, 'test-file.txt');

try {
  await fs.writeFile(testFile, 'test');
  console.log('File created successfully');
  
  const content = await fs.readFile(testFile, 'utf8');
  console.log('File content:', content);
  
  await fs.unlink(testFile);
  console.log('File deleted successfully');
} catch (error) {
  console.error('File system error:', error.message);
}

console.log('\n=== Environment Check Complete ===');
