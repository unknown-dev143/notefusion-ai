# Create temp-vite directory if it doesn't exist
$tempVitePath = Join-Path -Path $PSScriptRoot -ChildPath "temp-vite"
if (-not (Test-Path -Path $tempVitePath)) {
    New-Item -ItemType Directory -Path $tempVitePath | Out-Null
}

# Create tsconfig.node.json with proper content
$configContent = @'
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "target": "ES2020",
    "lib": ["ES2020"],
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "outDir": "./dist",
    "rootDir": ".",
    "allowJs": false,
    "strict": true,
    "skipLibCheck": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "vite.config.ts"
  ]
}
'@

# Write the configuration to file
$configPath = Join-Path -Path $tempVitePath -ChildPath "tsconfig.node.json"
Set-Content -Path $configPath -Value $configContent -Force

Write-Host "✅ Created $configPath" -ForegroundColor Green
