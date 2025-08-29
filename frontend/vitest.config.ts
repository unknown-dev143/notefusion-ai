/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    exclude: [...configDefaults.exclude, '**/node_modules/**'],
    testTimeout: 30000,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        'json',
        'html',
        'lcov',
        'clover',
        'text-summary'
      ],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/*.stories.{ts,tsx}',
        '**/index.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/__mocks__/**',
        '**/__tests__/**',
      ],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        '**/types.ts',
        '**/vite-env.d.ts',
        '**/__mocks__/**',
        '**/__fixtures__/**',
        '**/test-utils/**',
        '**/test/**'
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: true,
      skipFull: true,
      clean: true,
      cleanOnRerun: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },
      watermarks: {
        lines: [80, 95],
        functions: [80, 95],
        branches: [80, 95],
        statements: [80, 95]
      }
    },
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
  },
});
