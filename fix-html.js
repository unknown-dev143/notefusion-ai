const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{TITLE}}</title>
</head>
<body>
{{BODY}}
</body>
</html>`;

async function processFile(filePath) {
    try {
        const content = await readFile(filePath, 'utf8');
        
        // Extract title and body content
        const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Document';
        
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1].trim() : content.trim();
        
        // Create new HTML with proper structure
        const newContent = HTML_TEMPLATE
            .replace('{{TITLE}}', title)
            .replace('{{BODY}}', bodyContent);
        
        await writeFile(filePath, newContent, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

async function findHtmlFiles(dir) {
    let results = [];
    const items = await readdir(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
            // Skip node_modules and .git directories
            if (item === 'node_modules' || item === '.git') continue;
            results = results.concat(await findHtmlFiles(fullPath));
        } else if (path.extname(item).toLowerCase() === '.html') {
            results.push(fullPath);
        }
    }
    
    return results;
}

async function main() {
    console.log('🔍 Searching for HTML files...');
    const htmlFiles = await findHtmlFiles('.');
    
    if (htmlFiles.length === 0) {
        console.log('No HTML files found.');
        return;
    }
    
    console.log(`Found ${htmlFiles.length} HTML files to process.\n`);
    
    let successCount = 0;
    for (const file of htmlFiles) {
        const result = await processFile(file);
        if (result) successCount++;
    }
    
    console.log(`\n✅ Successfully fixed ${successCount} of ${htmlFiles.length} files`);
}

main().catch(console.error);
