const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('===== Starting Vercel Deployment =====');

// Ensure dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
  console.log('Created dist directory');
}

// Copy files to dist
const filesToCopy = [
  { src: 'simple-test.html', dest: 'index.html' },
  { src: 'simple-sw.js', dest: 'service-worker.js' },
  { src: 'minimal-manifest.json', dest: 'manifest.json' },
  'vercel.json'
];

filesToCopy.forEach(file => {
  const srcFile = typeof file === 'string' ? file : file.src;
  const destFile = typeof file === 'string' ? file : file.dest;
  
  try {
    fs.copyFileSync(
      path.join(__dirname, srcFile),
      path.join(distPath, destFile)
    );
    console.log(`✓ Copied ${srcFile} to dist/${destFile}`);
  } catch (err) {
    console.error(`Error copying ${srcFile}:`, err.message);
  }
});

console.log('\n===== Deployment Files Ready =====');
console.log('Please run the following commands to deploy:');
console.log('1. cd dist');
console.log('2. npx vercel --prod');
console.log('\nOr visit https://vercel.com/new to deploy manually.');
