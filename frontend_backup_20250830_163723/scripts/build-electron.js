const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { notarize } = require('electron-notarize');

// Configuration
const APP_NAME = 'NoteFusionAI';
const APP_ID = 'com.notefusion.ai';
const APPLE_ID = process.env.APPLE_ID;
const APPLE_ID_PASSWORD = process.env.APPLE_APP_SPECIFIC_PASSWORD;
const TEAM_ID = process.env.APPLE_TEAM_ID;

// Build paths
const root = path.join(__dirname, '..');
const buildPath = path.join(root, 'dist');
const electronPath = path.join(root, 'dist-electron');

// Clean previous builds
function clean() {
  console.log('Cleaning previous builds...');
  fs.removeSync(electronPath);
  fs.ensureDirSync(electronPath);
}

// Build the React app
function buildReact() {
  console.log('Building React app...');
  execSync('npm run build', { stdio: 'inherit' });
}

// Build the Electron main process
function buildMain() {
  console.log('Building Electron main process...');
  
  // Compile TypeScript
  execSync('npx tsc -p electron.tsconfig.json', { stdio: 'inherit' });
  
  // Copy package.json
  const packageJson = require('../package.json');
  const electronPackage = {
    ...packageJson,
    main: 'main.js',
    scripts: {
      start: 'electron .',
      test: 'echo \"Error: no test specified\" && exit 1',
    },
    dependencies: {},
    devDependencies: {},
  };
  
  // Only keep production dependencies
  const prodDeps = ['electron-updater', 'electron-log'];
  prodDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      electronPackage.dependencies[dep] = packageJson.dependencies[dep];
    }
  });
  
  fs.writeFileSync(
    path.join(electronPath, 'package.json'),
    JSON.stringify(electronPackage, null, 2)
  );
  
  // Copy preload script
  fs.copyFileSync(
    path.join(root, 'electron/preload.js'),
    path.join(electronPath, 'preload.js')
  );
  
  // Copy assets
  fs.copySync(buildPath, path.join(electronPath, 'dist'));
  
  // Install production dependencies
  console.log('Installing production dependencies...');
  execSync('npm install --production', { cwd: electronPath, stdio: 'inherit' });
}

// Package the app
async function packageApp() {
  console.log('Packaging the app...');
  
  const options = {
    config: {
      appId: APP_ID,
      productName: APP_NAME,
      directories: {
        output: 'release',
        buildResources: 'build'
      },
      files: [
        '**/*',
        '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme,test,__tests__}',
        '!**/node_modules/.bin',
        '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
        '!.editorconfig',
        '!**/._*',
        '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
        '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
        '!**/{appveyor.yml,.travis.yml,circle.yml}',
        '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
      ],
      asar: true,
      asarUnpack: ['**/node_modules/ffmpeg-static/**/*'],
      mac: {
        target: ['dmg', 'zip'],
        category: 'public.app-category.productivity',
        icon: 'build/icon.icns',
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: 'build/entitlements.mac.plist',
        entitlementsInherit: 'build/entitlements.mac.plist',
      },
      dmg: {
        sign: false,
        contents: [
          { x: 130, y: 220 },
          { x: 410, y: 220, type: 'link', path: '/Applications' }
        ]
      },
      win: {
        target: ['nsis', 'portable'],
        icon: 'build/icon.ico'
      },
      linux: {
        target: ['AppImage', 'deb'],
        category: 'Utility',
        icon: 'build/icon.png'
      },
      nsis: {
        oneClick: false,
        perMachine: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: APP_NAME
      },
      publish: {
        provider: 'github',
        owner: 'your-github-username',
        repo: 'notefusion-ai',
        releaseType: 'draft'
      }
    }
  };
  
  // Build for current platform
  const electronBuilder = require('electron-builder');
  
  try {
    await electronBuilder.build({
      ...options,
      mac: process.platform === 'darwin' ? options.config.mac : undefined,
      win: process.platform === 'win32' ? options.config.win : undefined,
      linux: process.platform === 'linux' ? options.config.linux : undefined,
    });
    
    console.log('Build successful!');
    
    // Notarize for macOS
    if (process.platform === 'darwin' && APPLE_ID && APPLE_ID_PASSWORD) {
      console.log('Notarizing macOS app...');
      await notarize({
        appBundleId: APP_ID,
        appPath: `${path.join(process.cwd(), 'release/mac')}/${APP_NAME}.app`,
        appleId: APPLE_ID,
        appleIdPassword: APPLE_ID_PASSWORD,
        teamId: TEAM_ID
      });
      console.log('Notarization complete!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Main build process
async function main() {
  try {
    clean();
    buildReact();
    buildMain();
    await packageApp();
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main();
