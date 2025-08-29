console.log('🎯 Recommended TypeScript Configuration\n');

const recommendedConfig = {
  'tsconfig.json': {
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
  },
  'tsconfig.app.json': {
    extends: './tsconfig.json',
    include: [
      'src/**/*.ts',
      'src/**/*.tsx',
      'src/**/*.js',
      'src/**/*.jsx'
    ],
    exclude: ['node_modules', 'dist']
  }
};

console.log('1. For temp-app/tsconfig.json and temp-vite/tsconfig.json, use:');
console.log(JSON.stringify(recommendedConfig['tsconfig.json'], null, 2));

console.log('\n2. For temp-app/tsconfig.app.json and temp-vite/tsconfig.app.json, use:');
console.log(JSON.stringify(recommendedConfig['tsconfig.app.json'], null, 2));

console.log('\n📝 Copy these configurations to their respective files in the temp-app and temp-vite directories.');
