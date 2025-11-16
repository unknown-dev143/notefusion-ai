@echo off
echo {
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["vite.config.ts"]
} > temp-vite\tsconfig.node.json

echo ✅ Updated temp-vite\tsconfig.node.json with proper configuration
