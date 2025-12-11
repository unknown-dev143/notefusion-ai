/**
 * Device detection utilities for mobile and tablet devices
 */

import { useState, useEffect } from 'react';

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  const isMobileDevice = mobileRegex.test(userAgent);
  
  // Additional checks for touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Screen size check (most mobile devices have smaller screens)
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobileDevice && hasTouch && isSmallScreen;
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for tablet devices
  const tabletRegex = /iPad|Android(?!.*Mobile)|Tablet|Kindle|Silk|PlayBook|BB10|rimTablet/i;
  const isTabletDevice = tabletRegex.test(userAgent);
  
  // Check for iPad in desktop mode (newer iPads report as desktop)
  const isIPad = /Macintosh/i.test(userAgent) && 'ontouchend' in document;
  
  // Screen size check for tablets
  const isTabletScreen = window.innerWidth >= 768 && window.innerWidth <= 1024;
  
  return (isTabletDevice || isIPad) && isTabletScreen;
};

export const isDesktop = (): boolean => {
  return !isMobile() && !isTablet();
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

export const getOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

export const getViewportInfo = () => {
  if (typeof window === 'undefined') return null;
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    orientation: getOrientation(),
    deviceType: getDeviceType(),
    isTouchDevice: isTouchDevice(),
  };
};

export const supportsPWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const supportsWebAssembly = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    return typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
  } catch (e) {
    return false;
  }
};

export const getBrowserInfo = () => {
  if (typeof window === 'undefined') return null;
  
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  // Chrome
  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    if (match) browserVersion = match[1];
  }
  // Firefox
  else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    if (match) browserVersion = match[1];
  }
  // Safari
  else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    if (match) browserVersion = match[1];
  }
  // Edge
  else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    const match = userAgent.match(/Edge\/(\d+)/);
    if (match) browserVersion = match[1];
  }
  
  return {
    name: browserName,
    version: browserVersion,
    userAgent: userAgent,
  };
};

// Hook for React components
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState(() => getViewportInfo());
  
  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getViewportInfo());
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  return deviceInfo;
};
