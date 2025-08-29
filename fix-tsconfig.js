const fs = require('fs');
const path = require('path');

// Base TypeScript configuration
const baseConfig = {
  compilerOptions: {
    target: "ES2020",
    lib: ["ES2020", "DOM", "DOM.Iterable"],
    module: "ESNext",
    moduleResolution: "bundler",
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    resolveJsonModule: true,
    isolatedModules: true,
    forceConsistentCasingInFileNames: true,
    skipLibCheck: true,
    jsx: "react-jsx",
    jsxImportSource: "react",
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
    baseUrl: ".",
    paths: {
      "@/*": ["./src/*"]
    }
  },
  include: ["src"],
  exclude: ["node_modules", "dist"]
};

// Function to update a tsconfig file
function updateTsConfig(filePath, config) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Update configurations
console.log('Updating TypeScript configurations...\n');
updateTsConfig('./temp-app/tsconfig.json', baseConfig);
updateTsConfig('./temp-vite/tsconfig.json', baseConfig);

// Create app-specific configs
const appConfig = {
  ...baseConfig,
  extends: './tsconfig.json',
  include: [
    'src/**/*.ts',
    'src/**/*.tsx',
    'src/**/*.js',
    'src/**/*.jsx'
  ]
};

updateTsConfig('./temp-app/tsconfig.app.json', appConfig);
updateTsConfig('./temp-vite/tsconfig.app.json', appConfig);

console.log('\n🎉 TypeScript configurations updated successfully!');
console.log('If you see any "Error" messages above, you may need to create the temporary directories first.');
