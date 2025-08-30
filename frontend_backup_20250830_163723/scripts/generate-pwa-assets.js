const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple logo (replace with your actual logo)
async function generateLogo() {
  const width = 512;
  const height = 512;
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#4f46e5"/>
      <text x="50%" y="50%" font-family="Arial" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">NF</text>
    </svg>
  `;
  
  // Generate different icon sizes
  const sizes = [192, 384, 512];
  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `pwa-${size}x${size}.png`));
  }
  
  // Generate favicon
  await sharp(Buffer.from(svg))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
    
  await sharp(Buffer.from(svg))
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
    
  // Generate apple-touch-icon
  await sharp(Buffer.from(svg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
  // Create favicon.ico
  await sharp(Buffer.from(svg))
    .resize(64, 64)
    .toFile(path.join(publicDir, 'favicon.ico'));
}

// Generate manifest file
function generateManifest() {
  const manifest = {
    name: 'NoteFusion AI',
    short_name: 'NoteFusion',
    description: 'AI-powered note taking application',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(publicDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
}

// Generate robots.txt
function generateRobotsTxt() {
  const content = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), content);
}

async function main() {
  try {
    await generateLogo();
    generateManifest();
    generateRobotsTxt();
    console.log('PWA assets generated successfully!');
  } catch (error) {
    console.error('Error generating PWA assets:', error);
    process.exit(1);
  }
}

main();
