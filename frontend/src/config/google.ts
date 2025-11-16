// Google API configuration
export const GOOGLE_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'your-google-api-key',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
};

// Google Drive API helper functions
export const loadGoogleDriveAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey: GOOGLE_CONFIG.apiKey,
          clientId: GOOGLE_CONFIG.clientId,
          discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
          scope: GOOGLE_CONFIG.scope
        }).then(() => {
          resolve();
        }).catch(reject);
      });
    } else {
      reject(new Error('Google API not loaded'));
    }
  });
};

// Declare global gapi type
declare global {
  interface Window {
    gapi: any;
  }
}

