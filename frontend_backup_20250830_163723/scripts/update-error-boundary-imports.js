const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'frontend/src/pages/ErrorBoundaryDemo.tsx',
  'frontend/src/features/notes/pages/NotesPage.tsx',
  'frontend/src/features/notes/components/NoteEditor.tsx',
  'frontend/src/layouts/AppLayout.tsx',
  'frontend/src/features/notes/components/NotesManager.tsx',
  'frontend/src/App.tsx',
  'frontend/src/components/ErrorBoundary.README.md'
];

// Update import paths
filesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), '..', filePath);
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Update import paths
    content = content.replace(
      /from ['"](?:\.\.\/)*components\/ErrorBoundary['"]/g,
      "from '@/components/ErrorBoundary'"
    );
    
    // Remove SimpleErrorBoundary imports as they'll be removed
    content = content.replace(/import\s+\{[^}]*\bSimpleErrorBoundary\b[^}]*\}\s+from\s+['"].*['"];?\n?/g, '');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } catch (err) {
    console.error(`Error updating ${filePath}:`, err);
  }
});

console.log('Import updates complete!');
