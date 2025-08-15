# Environment Setup

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:8000  # Your backend API URL

# Authentication (if applicable)
# VITE_GOOGLE_CLIENT_ID=your-google-client-id
# VITE_GITHUB_CLIENT_ID=your-github-client-id
```

## Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` to match your development environment.

3. Start the development server:
   ```bash
   npm run dev
   ```

## Production

Make sure to set these environment variables in your production environment (Vercel, Netlify, etc.) through their respective dashboards.
