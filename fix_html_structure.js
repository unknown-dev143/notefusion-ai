const fs = require('fs');
const path = require('path');

// Common HTML template with proper structure
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <!-- Content will be preserved -->
</body>
</html>`;

// Files to process
const filesToProcess = [
    'connection_test.html',
    'fixed_test.html',
    'offline.html',
    'frontend/404.html',
    'frontend/check-node.html',
    'frontend/js-test.html',
    'frontend/electron-test.html',
    'frontend/electron/index.html',
    'frontend/test.html',
    'frontend/test-env.html',
    'frontend/test-cmd.html',
    'frontend/test-browser.html',
    'pwa-test/test.html',
    'pwa-test/test-sw.html',
    'pwa-test/test-pwa.html',
    'pwa-test/test-offline.html',
    'pwa-test/test-notifications.html',
    'pwa-test/test-install.html',
    'pwa-test/simple-test.html',
    'pwa-test/simple-sw-test.html',
    'pwa-test/pwa-test-runner.html',
    'pwa-test/offline-test.html',
    'pwa-test/debug-test.html',
    'pwa-test/complete-pwa-test.html',
    'pwa-test/admin-dashboard.html',
    'pwa-test/404.html',
    'setup-instructions.html',
    'simple_test.html',
    'backend/app/templates/emails/verify_email.html',
    'backend/app/templates/emails/reset_password.html',
    'backend/app/templates/emails/password_changed.html'
];

function fixHtmlFile(filePath) {
    try {
        // Read the original file
        const originalContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse the HTML to extract content between <body> tags
        const bodyMatch = originalContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : originalContent;
        
        // Parse the title if it exists
        const titleMatch = originalContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Document';
        
        // Create new HTML with proper structure
        let newContent = htmlTemplate
            .replace('Document', title)
            .replace('<!-- Content will be preserved -->', bodyContent);
        
        // Write the fixed content back to the file
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Process all files
let successCount = 0;
const totalFiles = filesToProcess.length;

filesToProcess.forEach(relativePath => {
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
        if (fixHtmlFile(fullPath)) {
            successCount++;
        }
    } else {
        console.log(`⚠️  File not found: ${relativePath}`);
    }
});

console.log(`\n✅ Successfully fixed ${successCount} of ${totalFiles} files`);
