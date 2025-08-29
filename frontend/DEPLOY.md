# NoteFusion AI Frontend Deployment Guide

This guide explains how to deploy the NoteFusion AI frontend to Render.

## Prerequisites

- A Render account (https://render.com/)
- Node.js and npm installed locally for development
- Git installed locally

## Deployment Steps

### 1. Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Set Up on Render

1. Log in to your Render account
2. Click the "New +" button and select "Web Service"
3. Connect your Git repository
4. Configure the deployment:
   - **Name**: notefusion-frontend (or your preferred name)
   - **Region**: Select the region closest to your users
   - **Branch**: main (or your production branch)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Auto-Deploy**: Yes (for automatic deployments on push)

### 3. Environment Variables

Add the following environment variables in the Render dashboard:

- `VITE_API_URL`: Your backend API URL (e.g., https://api.yourdomain.com)
- `VITE_ENV`: `production`
- `NODE_VERSION`: The Node.js version specified in your package.json

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Once deployed, you'll receive a URL (e.g., https://notefusion-frontend.onrender.com)

### 5. Set Up Custom Domain (Optional)

1. Go to your service settings in Render
2. Click on "Custom Domains"
3. Add your custom domain and follow the instructions to verify ownership
4. Update your DNS settings as instructed by Render

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_URL | Yes | URL of your backend API |
| VITE_ENV | Yes | Set to 'production' |
| VITE_GA_TRACKING_ID | No | Google Analytics tracking ID |
| VITE_SENTRY_DSN | No | Sentry DSN for error tracking |

## Troubleshooting

- **Build Failures**: Check the build logs in the Render dashboard
- **Environment Variables**: Ensure all required variables are set
- **CORS Issues**: Make sure your backend allows requests from your frontend domain

## Updating Your Deployment

Push changes to your connected branch, and Render will automatically redeploy your application.
