// Simple environment test using ES modules
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a test file
const testFile = join(__dirname, 'test-env-output.txt');
const testContent = `Environment Test
================
Timestamp: ${new Date().toISOString()}
Node.js: ${process.version}
Platform: ${process.platform} (${process.arch})
`;

try {
  // Test file write
  writeFileSync(testFile, testContent);
  console.log(`✅ Wrote test file to: ${testFile}`);
  
  // Test file read
  const content = readFileSync(testFile, 'utf8');
  console.log('✅ File read test passed');
  console.log('\nFile content:');
  console.log('------------');
  console.log(content);
  
  // Clean up
  unlinkSync(testFile);
  console.log('✅ Test file cleaned up');
  
  console.log('\n✅ Environment test completed successfully!');
  
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
