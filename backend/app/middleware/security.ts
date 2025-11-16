import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Generate nonce for CSP
  const nonce = crypto.randomBytes(16).toString('base64');
  
  // Set security headers
  res.set({
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' ${process.env.API_BASE_URL || ''};
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Request-Id': uuidv4(),
  });

  // Store nonce in response locals for use in templates
  res.locals.cspNonce = nonce;
  next();
};

// Rate limiting middleware
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for GET, HEAD, OPTIONS, and TRACE methods
  if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!csrfToken || !req.session.csrfToken || csrfToken !== req.session.csrfToken) {
    return res.status(403).json({ 
      error: 'Invalid or missing CSRF token' 
    });
  }
  
  next();
};

// Input validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array(),
      message: 'Validation failed' 
    });
  }
  next();
};

// Request ID middleware
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.id = req.get('X-Request-Id') || uuidv4();
  next();
};

// Security middleware stack
export const securityMiddleware = [
  // Helmet for basic security headers
  helmet({
    contentSecurityPolicy: false, // We're setting CSP manually
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }),
  
  // Custom security headers
  securityHeaders,
  
  // Request ID
  requestId,
  
  // Body parser
  (req: Request, res: Response, next: NextFunction) => {
    if (req.is('application/json')) {
      express.json({
        limit: '10kb',
        strict: true,
      })(req, res, next);
    } else {
      next();
    }
  },
  
  // URL-encoded parser
  express.urlencoded({
    extended: true,
    limit: '10kb',
    parameterLimit: 10,
  }),
  
  // CSRF protection for non-API routes
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api/')) {
      return csrfProtection(req, res, next);
    }
    next();
  },
];

// Rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers for API responses
export const apiSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

// Request validation helper
export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      errors: errors.array(),
      message: 'Validation failed',
    });
  };
};

// Secure cookie settings
export const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: '/',
};

// Generate secure session secret
const generateSessionSecret = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Export session configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || generateSessionSecret(),
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  cookie: {
    ...secureCookieOptions,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
};

// Log security events
interface SecurityEvent {
  type: string;
  ip: string;
  method: string;
  path: string;
  userAgent?: string;
  timestamp: Date;
  details?: any;
}

export const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp'>) => {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };
  
  // In production, this would log to a security monitoring system
  console.warn('[SECURITY EVENT]', securityEvent);
  
  // TODO: Implement actual security event logging
  // This could be sent to a SIEM, security monitoring service, or audit log
};

// Middleware to log security-relevant requests
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health checks and static assets
  if (req.path === '/health' || req.path.startsWith('/static/')) {
    return next();
  }

  // Log potential security-related events
  if (req.headers['x-forwarded-for']?.toString() !== req.socket.remoteAddress) {
    logSecurityEvent({
      type: 'POTENTIAL_IP_SPOOFING',
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('user-agent'),
      details: {
        xForwardedFor: req.headers['x-forwarded-for'],
        remoteAddress: req.socket.remoteAddress,
      },
    });
  }

  // Log potential CSRF token issues
  if (req.method !== 'GET' && !req.path.startsWith('/api/')) {
    const csrfToken = req.headers['x-csrf-token'] || req.body?._csrf;
    if (!csrfToken) {
      logSecurityEvent({
        type: 'MISSING_CSRF_TOKEN',
        ip: req.ip,
        method: req.method,
        path: req.path,
        userAgent: req.get('user-agent'),
      });
    }
  }

  next();
};
