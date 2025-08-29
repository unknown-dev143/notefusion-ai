# NoteFusion PWA Deployment Guide

This guide explains how to deploy the NoteFusion PWA to various hosting platforms.

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Git (for GitHub Pages deployment)

## Available Deployment Options

### 1. Vercel (Recommended)

Vercel provides excellent PWA support and is the recommended hosting platform.

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Deploy:

   ```bash
   cd dist
   vercel --prod
   ```

### 2. Netlify

1. Install Netlify CLI:

   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:

   ```bash
   cd dist
   netlify deploy --prod
   ```

### 3. GitHub Pages

1. Create a new GitHub repository
2. Push your code to the repository
3. Go to Settings > Pages
4. Select 'main' branch and '/ (root)' folder
5. Click 'Save'

### 4. Manual Deployment

1. Build the production files:

   ```bash
   .\deploy.ps1
   ```

2. Upload the contents of the `dist` folder to your web server
3. Ensure your server is configured to serve `index.html` for all routes (SPA routing)
4. Configure HTTPS (required for PWA installation)
5. Test the service worker registration

## Post-Deployment

After deployment, verify the following:

1. The service worker is registered (check browser DevTools > Application > Service Workers)
2. The web app manifest is detected (check DevTools > Application > Manifest)
3. The app works offline
4. The app is installable (look for the install prompt or the install button in the browser's UI)

## Troubleshooting

- **Service Worker Not Registering**: Ensure your server is serving the service worker file with the correct MIME type (`application/javascript`)
- **Manifest Not Detected**: Check the console for any errors and verify the manifest path is correct
- **App Not Working Offline**: Check the Cache Storage in DevTools to ensure assets are being cached properly
