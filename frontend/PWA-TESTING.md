# PWA Testing Guide

This guide provides instructions for testing the Progressive Web App (PWA) features of NoteFusion AI.

## Prerequisites

- Node.js v16+ and npm installed
- Modern web browser (Chrome, Edge, Firefox, or Safari)
- Development server running (`npm run dev`)

## Testing Service Worker

1. Open the application in your browser (usually at `http://localhost:3000`)
2. Open Chrome DevTools (F12 or right-click -> Inspect)
3. Go to the "Application" tab
4. In the left sidebar, select "Service Workers" under the "Application" section
5. Verify that the service worker is registered and running
6. Check the "Offline" checkbox to simulate offline mode
7. Refresh the page - you should still see the app working
8. Uncheck "Offline" to go back online

## Testing Installability

1. Open the application in Chrome or Edge
2. Look for the install icon in the address bar (desktop) or the "Add to Home Screen" prompt (mobile)
3. Alternatively, you can test the install prompt programmatically by:
   - Opening the browser console
   - Running the following code to trigger the install prompt:
     ```javascript
     window.dispatchEvent(new Event('beforeinstallprompt'));
     ```
4. Follow the prompts to install the app
5. Verify the app launches in standalone mode

## Testing Offline Functionality

1. Open the application in your browser
2. Open Chrome DevTools (F12)
3. Go to the "Network" tab
4. Check the "Offline" checkbox to go offline
5. Navigate around the app - it should still work
6. Test specific features that should work offline
7. Uncheck "Offline" to go back online

## Testing Push Notifications

1. Ensure you've granted notification permissions for the site
2. Open Chrome DevTools (F12)
3. Go to the "Application" tab
4. In the left sidebar, select "Service Workers"
5. Click the "Push" button to send a test notification
6. Verify you receive the notification

## Testing Updates

1. Make a change to the service worker file (`public/sw.js`)
2. Save the file
3. In Chrome DevTools, go to the "Application" tab
4. Click "Service Workers" in the left sidebar
5. Check "Update on reload"
6. Refresh the page - the service worker should update

## Testing on Different Devices

1. **Android**:
   - Open Chrome on an Android device
   - Navigate to your app
   - Tap the menu (three dots) and select "Add to Home screen"
   - Launch the app from the home screen

2. **iOS**:
   - Open Safari on an iOS device
   - Navigate to your app
   - Tap the share icon and select "Add to Home Screen"
   - Launch the app from the home screen

3. **Desktop**:
   - Open Chrome or Edge
   - Navigate to your app
   - Click the install icon in the address bar (desktop) or use the browser menu
   - Launch the installed app

## Debugging Tips

- Check the browser's console for any service worker errors
- Use the "Clear storage" option in Chrome DevTools (Application tab) to clear service workers and caches
- Check the "Cache Storage" section in Chrome DevTools to verify cached resources
- Use the "Background Sync" and "Push Messaging" sections in Chrome DevTools to test those features

## Common Issues

1. **Service Worker Not Registering**:
   - Ensure the service worker file is in the correct location
   - Check for any JavaScript errors in the console
   - Verify the service worker scope is correct

2. **Caching Issues**:
   - Clear the browser cache and service workers
   - Check the cache storage in DevTools
   - Verify the cache name in the service worker matches what's being requested

3. **Installation Issues**:
   - Ensure the manifest file is correctly linked
   - Verify all required icons are present
   - Check that the start_url is correct in the manifest

For more information, refer to the [Web Fundamentals PWA documentation](https://developers.google.com/web/fundamentals/codelabs/your-first-pwapp/).
