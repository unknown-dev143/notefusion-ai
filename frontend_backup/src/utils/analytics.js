import ReactGA from 'react-ga4';

const TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID;

// Initialize Google Analytics
if (process.env.NODE_ENV === 'production' && TRACKING_ID) {
  ReactGA.initialize(TRACKING_ID);
  ReactGA.send({ hitType: 'pageview' });
}

export const trackPageView = (path) => {
  if (process.env.NODE_ENV === 'production' && TRACKING_ID) {
    ReactGA.send({ 
      hitType: 'pageview', 
      page: path 
    });
  }
};

export const trackEvent = (category, action, label, value) => {
  if (process.env.NODE_ENV === 'production' && TRACKING_ID) {
    ReactGA.event({
      category,
      action,
      label,
      value
    });
  }
};

export const trackError = (description, isFatal = false) => {
  if (process.env.NODE_ENV === 'production' && TRACKING_ID) {
    ReactGA.event({
      category: 'Error',
      action: 'Error Occurred',
      label: description,
      nonInteraction: true,
      transport: 'beacon'
    });
    
    if (isFatal) {
      ReactGA.exception({
        description,
        fatal: true
      });
    }
  }
};
