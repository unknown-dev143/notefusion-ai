import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const sizes = [192, 512];
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#4f46e5"/>
  <path d="M512 128c-212 0-384 172-384 384s172 384 384 384 384-172 384-384-172-384-384-384zm0 672c-159 0-288-129-288-288s129-288 288-288 288 129 288 288-129 288-288 288z" fill="#ffffff"/>
  <path d="M512 256c-141 0-256 115-256 256s115 256 256 256 256-115 256-256-115-256-256-256zm0 448c-106 0-192-86-192-192s86-192 192-192 192 86 192 192-86 192-192 192z" fill="#4f46e5"/>
  <path d="M512 320c-106 0-192 86-192 192s86 192 192 192 192-86 192-192-86-192-192-192zm0 320c-71 0-128-57-128-128s57-128 128-128 128 57 128 128-57 128-128 128z" fill="#ffffff"/>
</svg>`;

async function generateIcons() {
  try {
    // Create icons directory if it doesn't exist
    await fs.mkdir(path.join(publicDir, 'icons'), { recursive: true });

    // Generate app icons
    for (const size of sizes) {
      const iconPath = path.join(publicDir, `pwa-${size}x${size}.png`);
      await sharp(Buffer.from(iconSvg))
        .resize(size, size)
        .png()
        .toFile(iconPath);
      console.log(`Generated icon: ${iconPath}`);
    }

    // Generate favicon
    await sharp(Buffer.from(iconSvg))
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    
    await sharp(Buffer.from(iconSvg))
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));

    // Generate apple touch icon
    await sharp(Buffer.from(iconSvg))
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    // Generate safari pinned tab icon
    await sharp(Buffer.from(iconSvg))
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'safari-pinned-tab.svg'));

    console.log('✅ PWA assets generated successfully!');
  } catch (error) {
    console.error('❌ Error generating PWA assets:', error);
    process.exit(1);
  }
}

generateIcons();
