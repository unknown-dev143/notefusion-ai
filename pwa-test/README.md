# NoteFusion AI - PWA Test

This is a test environment for the Progressive Web App (PWA) functionality of NoteFusion AI.

## Features

- Service Worker for offline functionality
- Install to home screen
- Offline page with auto-retry
- Cache management
- Update notifications
- Network status monitoring
- Responsive design
- Dark mode support

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```

### Running the Server

Start the development server:

```
node server.js
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Testing PWA Features

### Service Worker

- The service worker will be registered automatically when you load the page
- Check the console for service worker registration status
- Use the "Check Again" button to verify the service worker status
- Use the "Unregister Service Worker" button to remove the service worker

### Cache Management

- **Clear Cache**: Removes all cached files
- **Update Cache**: Forces an update of the service worker and caches

### Installation

- On supported browsers, an install button will appear in the address bar
- You can also trigger the install prompt manually with the "Show Install Prompt" button

### Offline Testing

1. Open Chrome DevTools (F12)
2. Go to the "Application" tab
3. Check "Offline" in the Service Worker section
4. Refresh the page to see the offline experience
5. The offline page will be shown if the page is not cached

### Update Flow

1. Make changes to any file
2. The service worker will detect the update
3. An update banner will appear at the top of the page
4. Click "Update Now" to apply the update

## File Structure

- `index.html` - Main application HTML
- `styles.css` - Global styles
- `pwa.js` - PWA helper functions
- `sw.js` - Service worker implementation
- `offline.html` - Offline fallback page
- `manifest.json` - PWA manifest
- `server.js` - Development server

## Browser Support

The PWA features are supported in modern browsers including:

- Chrome 70+
- Firefox 68+
- Edge 79+
- Safari 12.1+
- Opera 57+
- iOS Safari 12.2+
- Samsung Internet 9.2+

## Troubleshooting

### Service Worker Not Updating

1. Unregister the service worker using the "Unregister Service Worker" button
2. Clear the cache using the "Clear Cache" button
3. Refresh the page

### Installation Not Available

- Make sure you're using a supported browser
- The app must be served over HTTPS (or localhost)
- The app must have a valid manifest.json
- The app must have a registered service worker with a fetch event handler

## License

This project is part of the NoteFusion AI application.
