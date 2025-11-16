# Deployment Guide

This guide will help you deploy NoteFusion AI to Netlify or Vercel.

## Prerequisites

- Node.js 18+ installed
- Backend API running and accessible
- Git repository set up

## Environment Variables

Before deploying, make sure to set these environment variables:

- `REACT_APP_API_URL`: Your backend API URL (e.g., `https://api.yourapp.com`)
- `REACT_APP_WS_URL`: Your WebSocket URL (e.g., `wss://api.yourapp.com`)

## Deploying to Netlify

1. **Connect your repository to Netlify:**
   - Go to [Netlify](https://www.netlify.com/)
   - Click "New site from Git"
   - Select your repository

2. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Base directory: `frontend` (if your frontend is in a subdirectory)

3. **Set environment variables:**
   - Go to Site settings > Environment variables
   - Add `REACT_APP_API_URL` and `REACT_APP_WS_URL`

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your app

The `netlify.toml` file is already configured for this project.

## Deploying to Vercel

1. **Install Vercel CLI (optional):**
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI:**
   ```bash
   cd frontend
   vercel
   ```
   Follow the prompts to configure your deployment.

3. **Or deploy via Vercel Dashboard:**
   - Go to [Vercel](https://vercel.com/)
   - Click "New Project"
   - Import your repository
   - Set root directory to `frontend` if needed
   - Add environment variables:
     - `REACT_APP_API_URL`
     - `REACT_APP_WS_URL`
   - Click "Deploy"

The `vercel.json` file is already configured for this project.

## Backend Deployment

Make sure your backend is deployed and accessible. Update the CORS settings in `backend/main.py` to include your frontend domain.

For example, if your frontend is at `https://notefusion.netlify.app`, add it to the CORS origins:

```python
origins = [
    "https://notefusion.netlify.app",
    # ... other origins
]
```

## Post-Deployment Checklist

- [ ] Verify frontend is accessible
- [ ] Test file upload functionality
- [ ] Test note generation
- [ ] Test export functionality
- [ ] Verify WebSocket connection
- [ ] Check browser console for errors
- [ ] Test on mobile devices

## Troubleshooting

### CORS Errors
- Make sure your backend CORS settings include your frontend domain
- Check that environment variables are set correctly

### WebSocket Connection Issues
- Verify `REACT_APP_WS_URL` is set correctly (use `wss://` for secure connections)
- Check backend WebSocket endpoint is accessible
- Verify firewall/network settings allow WebSocket connections

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check for TypeScript errors

## Support

For issues or questions, please check the main project README or open an issue on GitHub.

