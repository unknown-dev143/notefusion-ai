# Integration Setup Guide

This guide will help you set up Firebase, Google Services, and Stripe integrations for NoteFusion AI.

## Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Follow the setup wizard

2. **Enable Services**
   - **Authentication**: Enable Google Sign-In
   - **Realtime Database**: Create database in test mode
   - **Storage**: Enable Firebase Storage

3. **Get Configuration**
   - Go to Project Settings > General
   - Scroll to "Your apps" and add a web app
   - Copy the configuration values

4. **Update Environment Variables**
   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   ```

## Google Services Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable APIs**
   - Enable Google Drive API
   - Enable Google Docs API
   - Enable Google Sign-In API

3. **Create OAuth Credentials**
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized JavaScript origins: `http://localhost:5173`
   - Add authorized redirect URIs

4. **Get API Key**
   - Create API Key in Credentials
   - Restrict it to your APIs

5. **Update Environment Variables**
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id
   REACT_APP_GOOGLE_API_KEY=your-api-key
   ```

## Stripe Setup

1. **Create Stripe Account**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Sign up or log in

2. **Get API Keys**
   - Go to Developers > API keys
   - Copy your Publishable key (starts with `pk_test_` or `pk_live_`)

3. **Set Up Webhooks** (for production)
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-backend.com/api/stripe-webhook`
   - Select events: `payment_intent.succeeded`, `customer.subscription.created`

4. **Update Environment Variables**
   ```env
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   ```

5. **Backend Setup** (Required for payments)
   - Create endpoint: `POST /api/create-payment-intent`
   - Use Stripe server-side SDK
   - Return `clientSecret` to frontend

## Installation

After setting up the services, install dependencies:

```bash
npm install
```

## Testing

1. **Firebase**: Test authentication and real-time sync
2. **Google**: Test Drive upload and authentication
3. **Stripe**: Use test cards from [Stripe Testing](https://stripe.com/docs/testing)

## Security Notes

- Never commit `.env` file with real keys
- Use environment variables for all sensitive data
- Restrict API keys in production
- Enable CORS properly for your domains
- Use HTTPS in production

## Support

For issues or questions:
- Firebase: [Firebase Documentation](https://firebase.google.com/docs)
- Google: [Google APIs Documentation](https://developers.google.com/apis)
- Stripe: [Stripe Documentation](https://stripe.com/docs)

