// Simple Node.js test script
const fs = require('fs');
const path = require('path');

console.log('=== Node.js Environment Test ===');
console.log(`Node.js Version: ${process.version}`);
console.log(`Platform: ${process.platform} (${process.arch})`);
console.log(`Current Directory: ${process.cwd()}`);

// Test file operations
try {
  const testFile = path.join(process.cwd(), 'test-file.txt');
  fs.writeFileSync(testFile, 'Test content');
  console.log('✅ File write test passed');
  
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✅ File read test passed');
  
  fs.unlinkSync(testFile);
  console.log('✅ File delete test passed');
  
  // Test Electron
  try {
    const electron = require('electron');
    console.log('✅ Electron require test passed');
    console.log(`Electron Version: ${process.versions.electron || 'Not available'}`);
  } catch (e) {
    console.log('ℹ️ Electron not available:', e.message);
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}

console.log('\nAll tests completed!');
