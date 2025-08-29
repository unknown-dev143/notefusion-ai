const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'frontend/test-browser.html',
  'frontend/test-cmd.html',
  'frontend/test-env.html',
  'frontend/test.html'
];

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {headContent}
</head>
{bodyContent}
</html>`;

htmlFiles.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if we need to add lang attribute to html tag
      if (!/<html[^>]*\s+lang=/.test(content)) {
        content = content.replace(/<html(\s|>)/, '<html lang="en"$1');
      }
      
      // Check if we need to add viewport meta tag
      if (!/<meta[^>]*name=["']viewport["'][^>]*>/.test(content)) {
        content = content.replace('</head>', '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>');
      }
      
      // Check if we need to add charset meta tag
      if (!/<meta[^>]*charset=/.test(content)) {
        content = content.replace('</head>', '  <meta charset="UTF-8">\n</head>');
      }
      
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed ${filePath}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log('HTML files have been updated.');
