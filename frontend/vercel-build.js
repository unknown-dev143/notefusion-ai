const { execSync } = require('child_process');

console.log('Starting Vercel build...');

// Install dependencies
try {
  console.log('Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Install react-scripts globally to make it available
  console.log('Installing react-scripts...');
  execSync('npm install -g react-scripts', { stdio: 'inherit' });
  
  // Run the build
  console.log('Running build...');
  execSync('npx react-scripts build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
