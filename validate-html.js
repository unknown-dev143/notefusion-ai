const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all HTML files
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check HTML files for common issues
function checkHtmlFiles() {
  const htmlFiles = findHtmlFiles('.');
  const issues = [];
  
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for common issues
    if (!content.includes('<!DOCTYPE html>')) {
      issues.push(`${file}: Missing DOCTYPE declaration`);
    }
    
    if (!content.includes('<html lang="en">') && !content.includes('<html lang="en"')) {
      issues.push(`${file}: Missing or invalid lang attribute in <html> tag`);
    }
    
    if (!content.includes('<meta charset="UTF-8">') && !content.includes('<meta charset="utf-8">')) {
      issues.push(`${file}: Missing charset meta tag`);
    }
    
    if (!content.includes('viewport')) {
      issues.push(`${file}: Missing viewport meta tag`);
    }
    
    if (!content.includes('<title>') || content.match(/<title>\s*<\/title>/)) {
      issues.push(`${file}: Missing or empty title tag`);
    }
    
    // Check for inline styles
    const inlineStyleMatches = content.match(/style=\s*["'][^"']*["']/g);
    if (inlineStyleMatches && inlineStyleMatches.length > 0) {
      issues.push(`${file}: Found ${inlineStyleMatches.length} inline style(s) - should be moved to external CSS`);
    }
  });
  
  return issues;
}

// Run the check
const issues = checkHtmlFiles();

if (issues.length > 0) {
  console.log('Found the following HTML issues:');
  issues.forEach(issue => console.log(`- ${issue}`));
  process.exit(1);
} else {
  console.log('No HTML validation issues found!');
  process.exit(0);
}
