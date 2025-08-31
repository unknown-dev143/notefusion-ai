import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Yarn test script running');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Test file system access
try {
  const testFile = join(__dirname, 'yarn-test-file.txt');
  writeFileSync(testFile, 'test');
  console.log('File write successful');
  
  const content = readFileSync(testFile, 'utf8');
  console.log('File content:', content);
  
  unlinkSync(testFile);
  console.log('File cleanup successful');
} catch (error) {
  console.error('Error:', error.message);
}
