# NoteFusion AI - Electron Desktop App

This guide explains how to run and build the NoteFusion AI desktop application using Electron.

## Prerequisites

- Node.js v18 or later
- npm v8 or later
- Git (optional)

## Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

In one terminal, start the Vite development server:

```bash
npm run dev
```

In another terminal, start the Electron app:

```bash
npm run electron:dev
```

This will automatically:
1. Start the Vite dev server
2. Wait for the server to be available
3. Start the Electron app connected to the dev server

## Building for Production

### 1. Build the App

```bash
npm run electron:build
```

### 2. Package the App

```bash
npm run electron:package
```

This will create platform-specific installers in the `dist` directory.

## Project Structure

- `electron/` - Electron main process files
  - `main.ts` - Main process entry point
  - `preload.ts` - Preload script for the renderer process
- `src/` - Frontend source code
- `dist/` - Built files (created during build)
- `dist-electron/` - Compiled Electron main process files

## Troubleshooting

### Common Issues

1. **Blank screen in production**
   - Make sure all assets are being copied to the `dist` directory
   - Check the console for any errors

2. **Native modules not working**
   - Rebuild native modules for Electron:
     ```bash
     npx electron-rebuild
     ```

3. **App not starting**
   - Check the terminal for error messages
   - Make sure the Vite dev server is running when in development mode

## License

MIT
