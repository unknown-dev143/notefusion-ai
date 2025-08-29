const fs = require('fs');
const { createCanvas } = require('canvas');

// Create output directory if it doesn't exist
if (!fs.existsSync('icons')) {
  fs.mkdirSync('icons');
}

// Function to generate a simple icon with text
function generateIcon(size, name) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#1677ff';
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = '#ffffff';
  const fontSize = size / 4;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NF', size/2, size/2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icons/${name}`, buffer);
  
  console.log(`Generated: icons/${name}`);
}

// Generate required icons
generateIcon(192, 'icon-192x192.png');
generateIcon(512, 'icon-512x512.png');
generateIcon(144, 'icon-144x144.png');
generateIcon(152, 'icon-152x152.png');

console.log('Icons generated successfully!');
