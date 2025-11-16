// Node.js Environment Diagnostic Tool
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const log = [];

function logMessage(message, data = '') {
  const entry = `[${new Date().toISOString()}] ${message} ${data}`.trim();
  log.push(entry);
  console.log(entry);
}

// Basic system info
logMessage('=== Node.js Environment Diagnostic ===');
logMessage('Node.js version:', process.version);
logMessage('Platform:', process.platform);
logMessage('Architecture:', process.arch);
logMessage('Current directory:', process.cwd());

// Check environment variables
logMessage('\n=== Environment Variables ===');
['PATH', 'NODE_PATH', 'NVM_HOME', 'NVM_SYMLINK'].forEach(envVar => {
  logMessage(`${envVar}:`, process.env[envVar] || 'Not set');
});

// Check Node.js installation
logMessage('\n=== Node.js Installation ===');
try {
  const nodePath = execSync('where node').toString().trim();
  logMessage('Node.js path:', nodePath);
  
  const npmPath = execSync('where npm').toString().trim();
  logMessage('npm path:', npmPath);
  
  // Check file system access
  const testFile = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(testFile, 'test content');
  logMessage('File system write test: SUCCESS');
  
  const content = fs.readFileSync(testFile, 'utf8');
  logMessage('File system read test:', content === 'test content' ? 'SUCCESS' : 'FAILED');
  
  fs.unlinkSync(testFile);
  logMessage('File system cleanup: SUCCESS');
} catch (error) {
  logMessage('Error during tests:', error.message);
}

// Save log to file
const logFile = path.join(__dirname, 'node-diagnostic.log');
fs.writeFileSync(logFile, log.join('\n'));
logMessage('\nDiagnostic log saved to:', logFile);
