
#!/bin/bash

# Exit on error
set -e

# Change to the backend directory
cd "$(dirname "$0")/backend"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Google Cloud SDK is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/install"
    exit 1
fi

# Check if user is authenticated with gcloud
if ! gcloud auth list --filter=status:ACTIVE --format='value(account)' &> /dev/null; then
    echo "Please authenticate with Google Cloud first:"
    echo "gcloud auth login"
    exit 1
fi

# Set the project ID (replace with your Firebase project ID)
read -p "Enter your Firebase project ID: " PROJECT_ID

echo "🔧 Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    --project=$PROJECT_ID

echo "🚀 Building and deploying to Cloud Run..."
gcloud builds submit \
    --project=$PROJECT_ID \
    --config=cloudbuild.yaml \
    --substitutions=_FIREBASE_PROJECT_ID=$PROJECT_ID

echo "🔗 Setting up Firebase Hosting..."
cd ..
npm install -g firebase-tools
firebase login
firebase use $PROJECT_ID

# Build the frontend
echo "🏗️  Building frontend..."
cd frontend
npm install
npm run build

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
cd ..
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "Your backend is now live at: https://your-project-id.run.app"
echo "Your frontend is now live at: https://your-project-id.web.app"
