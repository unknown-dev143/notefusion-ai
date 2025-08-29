#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "⚠️  .env.production not found. Creating from example..."
  if [ -f .env.production.example ]; then
    cp .env.production.example .env.production
    echo "ℹ️  Please update .env.production with your production values"
    exit 1
  else
    echo "❌ .env.production.example not found. Please create it first."
    exit 1
  fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please check the errors above."
  exit 1
fi

echo "✅ Build completed successfully!"
echo "📦 Build files are ready in the 'dist' directory"

echo "🚀 Deploying to Render..."

# Check if render-cli is installed
if ! command -v render &> /dev/null; then
  echo "ℹ️  Render CLI not found. Installing..."
  npm install -g @render-oss/cli
fi

# Deploy to Render
render deploy

echo "🎉 Deployment completed successfully!"
echo "🌐 Your app should be live at: https://notefusion-frontend.onrender.com"
