# Create the TypeScript configuration content
$tsConfigContent = @'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "allowJs": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": false,
    "useUnknownInCatchVariables": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": false,
    "exactOptionalPropertyTypes": false,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "alwaysStrict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
'@

$tsConfigAppContent = @'
{
  "extends": "./tsconfig.json",
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.js",
    "src/**/*.jsx"
  ],
  "exclude": ["node_modules", "dist"]
}
'@

# Function to create or update a file
function Update-File {
    param (
        [string]$Path,
        [string]$Content
    )
    
    $dir = [System.IO.Path]::GetDirectoryName($Path)
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    Set-Content -Path $Path -Value $Content -Force
    Write-Host "✅ Updated $Path" -ForegroundColor Green
}

# Update configurations in both temp directories
$directories = @("temp-app", "temp-vite")

foreach ($dir in $directories) {
    $basePath = Join-Path $dir "tsconfig.json"
    $appPath = Join-Path $dir "tsconfig.app.json"
    
    Update-File -Path $basePath -Content $tsConfigContent
    Update-File -Path $appPath -Content $tsConfigAppContent
}

Write-Host "\n🎉 TypeScript configurations have been updated successfully!" -ForegroundColor Cyan
Write-Host "The following files were updated:" -ForegroundColor Cyan
Write-Host "- temp-app/tsconfig.json"
Write-Host "- temp-app/tsconfig.app.json"
Write-Host "- temp-vite/tsconfig.json"
Write-Host "- temp-vite/tsconfig.app.json"
Write-Host "\nAll configurations now have strict mode enabled and consistent file naming." -ForegroundColor Green
