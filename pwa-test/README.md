# PWA Test

This is a simple Progressive Web App (PWA) test environment.

## How to Test

1. Start the local server:
   ```
   node server.js
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. To test PWA installation:
   - In Chrome/Edge: Click the install icon in the address bar
   - In Firefox: Click the "..." menu and select "Install"
   - In Safari: Go to "Share" > "Add to Home Screen"

4. To test offline functionality:
   - Open Chrome DevTools (F12)
   - Go to the "Application" tab
   - Check "Offline" in the Service Workers section
   - Refresh the page

## Files

- `index.html` - Main PWA test page
- `sw.js` - Service worker implementation
- `manifest.json` - Web app manifest
- `server.js` - Simple HTTP server for testing
- `404.html` - Custom 404 page
