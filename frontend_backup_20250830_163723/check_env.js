import { execSync } from 'child_process';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Polyfill for process.cwd() in ES modules
const cwd = process.cwd();

console.log('=== Environment Check ===');

// Check Node.js and npm versions
try {
  console.log('\n1. Checking Node.js and npm versions:');
  const nodeVersion = execSync('node --version').toString().trim();
  const npmVersion = execSync('npm --version').toString().trim();
  console.log(`- Node.js: ${nodeVersion}`);
  console.log(`- npm: ${npmVersion}`);
} catch (error) {
  console.error('Error checking Node.js/npm versions:', error.message);
}

// Check directory structure
console.log('\n2. Checking project structure:');
const requiredDirs = ['src', 'public', 'node_modules'];
const requiredFiles = ['package.json', 'vite.config.ts', 'tsconfig.json'];

requiredDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  console.log(`- ${dir}: ${fs.existsSync(dirPath) ? '✅ Found' : '❌ Missing'}`);
});

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  console.log(`- ${file}: ${fs.existsSync(filePath) ? '✅ Found' : '❌ Missing'}`);
});

// Check for .env file
console.log('\n3. Environment configuration:');
const envPath = join(cwd, '.env');
if (existsSync(envPath)) {
  console.log('- .env file found');
  // Don't log actual environment variables for security
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n').filter(Boolean);
  console.log(`- Contains ${envVars.length} environment variables`);
} else {
  console.log('- ⚠️ .env file not found. You may need to create one.');
}

// Check for node_modules
console.log('\n4. Dependencies:');
const nodeModulesPath = join(cwd, 'node_modules');
if (existsSync(nodeModulesPath)) {
  const nodeModules = readdirSync(nodeModulesPath);
  console.log(`- node_modules contains ${nodeModules.length} packages`);
  
  // Check for key dependencies
  const keyDeps = ['react', 'react-dom', 'vite', 'vitest'];
  keyDeps.forEach(dep => {
    const depPath = join(nodeModulesPath, dep);
    console.log(`- ${dep}: ${existsSync(depPath) ? '✅ Installed' : '❌ Missing'}`);
  });
} else {
  console.log('- node_modules not found. Run `npm install` to install dependencies.');
}

console.log('\n=== Environment Check Complete ===');
