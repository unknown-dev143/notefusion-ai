// Simple script to verify Node.js setup with ES modules
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a test file
const testFile = join(__dirname, 'node-verification-test.txt');
const testContent = `Node.js Verification Test
=====================
Timestamp: ${new Date().toISOString()}
Node.js Version: ${process.version}
Platform: ${process.platform}
Architecture: ${process.arch}
`;

try {
  // Write test
  writeFileSync(testFile, testContent);
  console.log(`✅ Test file created at: ${testFile}`);

  // Read test
  const content = readFileSync(testFile, 'utf8');
  console.log('✅ File read test passed');
  console.log('File content:');
  console.log('------------');
  console.log(content);

  // Clean up
  unlinkSync(testFile);
  console.log('✅ Test file cleaned up');

  // Check Electron
  console.log('\nChecking for Electron...');
  try {
    const electron = await import('electron');
    console.log('✅ Electron is installed');
    console.log(`Electron version: ${process.versions.electron || 'Not available'}`);
  } catch (error) {
    console.log('ℹ️ Electron not available:', error.message);
  }

  console.log('\n✅ Node.js environment verification complete!');
} catch (error) {
  console.error('❌ Error during verification:', error);
  process.exit(1);
}
