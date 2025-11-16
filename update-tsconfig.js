const fs = require('fs');
const path = require('path');

// Base TypeScript configuration to apply
const baseTsConfig = {
  compilerOptions: {
    target: 'ES2020',
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    moduleResolution: 'bundler',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
    isolatedModules: true,
    forceConsistentCasingInFileNames: true,
    skipLibCheck: true,
    jsx: 'react-jsx',
    jsxImportSource: 'react',
    allowJs: true,
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictBindCallApply: true,
    strictPropertyInitialization: false,
    useUnknownInCatchVariables: true,
    noImplicitOverride: true,
    noImplicitReturns: true,
    noImplicitThis: true,
    noUnusedLocals: true,
    noUnusedParameters: false,
    exactOptionalPropertyTypes: false,
    noFallthroughCasesInSwitch: true,
    noUncheckedIndexedAccess: true,
    noPropertyAccessFromIndexSignature: true,
    alwaysStrict: true,
    baseUrl: '.',
    paths: {
      '@/*': ['./src/*']
    }
  },
  include: ['src'],
  exclude: ['node_modules', 'dist']
};

// Update tsconfig.json in temp directories
const tempDirs = ['temp-app', 'temp-vite'];

tempDirs.forEach(dir => {
  const tsConfigPath = path.join(__dirname, dir, 'tsconfig.json');
  const tsConfigAppPath = path.join(__dirname, dir, 'tsconfig.app.json');
  
  // Update tsconfig.json
  if (fs.existsSync(tsConfigPath)) {
    fs.writeFileSync(tsConfigPath, JSON.stringify(baseTsConfig, null, 2));
    console.log(`Updated ${tsConfigPath}`);
  }
  
  // Update tsconfig.app.json if it exists
  if (fs.existsSync(tsConfigAppPath)) {
    const appConfig = {
      ...baseTsConfig,
      extends: './tsconfig.json',
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'],
      exclude: ['node_modules', 'dist']
    };
    fs.writeFileSync(tsConfigAppPath, JSON.stringify(appConfig, null, 2));
    console.log(`Updated ${tsConfigAppPath}`);
  }
});

console.log('TypeScript configuration updated successfully!');
