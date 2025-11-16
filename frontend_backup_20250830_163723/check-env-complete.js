// Environment diagnostic tool
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create a log file for detailed output
const logFile = path.join(__dirname, 'env-check.log');
const logStream = fs.createWriteStream(logFile);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  process.stdout.write(logMessage);
  logStream.write(logMessage);
}

log('=== Environment Diagnostic Tool ===');
log(`Start Time: ${new Date().toISOString()}`);
log(`Current Directory: ${process.cwd()}`);
log(`Node.js Version: ${process.version}`);
log(`Platform: ${process.platform} ${process.arch}`);
log(`NPM Version: ${execSync('npm -v', { stdio: 'pipe' }).toString().trim()}`);

// Check directory structure
log('\n=== Directory Structure ===');
const checkDir = (dir) => {
  try {
    const files = fs.readdirSync(dir);
    log(`Directory exists: ${dir} (${files.length} items)`);
    return true;
  } catch (error) {
    log(`Directory missing: ${dir} (${error.message})`);
    return false;
  }
};

['src', 'public', 'node_modules'].forEach(dir => checkDir(path.join(process.cwd(), dir)));

// Check package.json
log('\n=== Package.json ===');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  log(`Project: ${pkg.name} v${pkg.version}`);
  log(`Type: ${pkg.type || 'commonjs'}`);
  log(`Main: ${pkg.main || 'Not specified'}`);
} catch (error) {
  log(`Error reading package.json: ${error.message}`);
}

// Check node_modules
log('\n=== Dependencies ===');
const checkDeps = ['react', 'react-dom', 'vite', 'vitest'];
checkDeps.forEach(dep => {
  try {
    const depPath = require.resolve(dep);
    const version = require(path.join(depPath.split(dep)[0], dep, 'package.json')).version;
    log(`✓ ${dep} v${version} (${depPath})`);
  } catch (error) {
    log(`✗ ${dep} not found (${error.message})`);
  }
});

// Check environment variables
log('\n=== Environment Variables ===');
['NODE_ENV', 'NODE_OPTIONS', 'PATH'].forEach(envVar => {
  log(`${envVar}: ${process.env[envVar] || 'Not set'}`);
});

// Check file permissions
try {
  const testFile = path.join(process.cwd(), 'test-permission.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  log('\n✓ File system write permission: OK');
} catch (error) {
  log(`\n✗ File system write permission: ${error.message}`);
}

log('\n=== Diagnostic Complete ===');
log(`Log saved to: ${logFile}`);
logStream.end();

// Exit with success code
process.exit(0);
