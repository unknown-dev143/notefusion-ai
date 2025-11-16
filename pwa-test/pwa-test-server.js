require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const config = require('./config/config');
const { 
    apiLimiter, 
    loginLimiter, 
    securityHeaders, 
    errorHandler,
    authenticate 
} = require('./middleware/security');
const helmet = require('helmet');
const cors = require('cors');

// Load environment variables with defaults
const PORT = config.port || 3001;
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// In-memory admin user (in production, use a database)
let adminUsers = [{
    id: 'admin-001',
    username: ADMIN_USERNAME,
    password: bcrypt.hashSync(ADMIN_PASSWORD, SALT_ROUNDS),
    email: 'admin@notefusion.ai',
    role: 'superadmin',
    lastLogin: null,
    createdAt: new Date().toISOString()
}];

// In-memory settings (in production, use a database)
let appSettings = {
    appName: 'NoteFusion AI',
    enableAnalytics: true,
    maintenanceMode: false,
    maxFileSize: 10, // MB
    sessionTimeout: 30, // minutes
    features: {
        audioProcessing: true,
        noteSharing: true,
        offlineMode: true
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
};

// In-memory database for tracking data (in production, use a database)
let trackingData = {
    toolUsage: {},
    sessions: [],
    activities: [],
    userActivity: [],
    errors: []
};

// Helper function to generate JWT token
function generateToken(user) {
    const header = {
        alg: 'HS256', 
        typ: 'JWT'
    };
    
    const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    
    // In production, use a proper JWT library with proper signing
    const signature = require('crypto')
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64');
        
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.writeHead(401).end('Unauthorized: No token provided');
    }
    
    const token = authHeader.split(' ')[1];
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    try {
        // Verify signature (in production, use a proper JWT library)
        const expectedSignature = require('crypto')
            .createHmac('sha256', JWT_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64');
            
        if (signature !== expectedSignature) {
            throw new Error('Invalid signature');
        }
        
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());
        
        // Check if token is expired
        if (payload.exp < Math.floor(Date.now() / 1000)) {
            throw new Error('Token expired');
        }
        
        // Attach user to request
        req.user = payload;
        next();
    } catch (error) {
        return res.writeHead(401).end(`Unauthorized: ${error.message}`);
    }
}

// Admin middleware
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.writeHead(403).end('Forbidden: Admin access required');
    }
    next();
}

// Super admin middleware
function requireSuperAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'superadmin') {
        return res.writeHead(403).end('Forbidden: Super admin access required');
    }
    next();
}

// Load existing data if available
const loadTrackingData = () => {
    try {
        if (fs.existsSync('tracking-data.json')) {
            const data = fs.readFileSync('tracking-data.json', 'utf8');
            trackingData = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading tracking data:', error);
    }
};

// Save tracking data to file
const saveTrackingData = () => {
    try {
        fs.writeFileSync('tracking-data.json', JSON.stringify(trackingData, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving tracking data:', error);
    }
};

// Load data on startup
loadTrackingData();

// Auto-save data every 5 minutes
setInterval(saveTrackingData, 5 * 60 * 1000);
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.wasm': 'application/wasm',
    '.webmanifest': 'application/manifest+json',
    '.webapp': 'application/x-web-app-manifest+json',
    '.xml': 'application/xml',
};

// Helper function to parse JSON request body
function parseJsonRequest(req) {
    return new Promise((resolve, reject) => {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
            try {
                resolve(body.length ? JSON.parse(Buffer.concat(body).toString()) : {});
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });
    });
}

// Helper function to send JSON response
function sendJsonResponse(res, statusCode, data) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
}

// Security middleware
const securityMiddleware = (req, res, next) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // CORS headers
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    next();
};

// Apply security middleware to all requests
const server = http.createServer(async (req, res) => {
    // Apply security headers
    securityHeaders(req, res, () => {});
    // Apply security middleware
    securityMiddleware(req, res, () => {});
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve admin dashboard
    if (pathname === '/admin' || pathname === '/admin/') {
        const filePath = path.join(__dirname, 'admin-dashboard.html');
        return fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('404 Not Found');
                } else {
                    res.writeHead(500);
                    res.end('500 Internal Server Error');
                }
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content, 'utf-8');
            }
        });
    }
    
    // Serve admin settings
    if (pathname === '/admin/settings') {
        const filePath = path.join(__dirname, 'admin-settings.html');
        return fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(500);
                res.end('Error loading admin settings');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content, 'utf-8');
            }
        });
    }
    
    // Apply rate limiting to API endpoints
    if (pathname.startsWith('/api/')) {
        const clientIp = req.socket.remoteAddress;
        if (pathname === '/api/admin/login') {
            if (!loginLimiter.consume(clientIp)) {
                return sendJsonResponse(res, 429, { error: 'Too many login attempts. Please try again later.' });
            }
        } else {
            if (!apiLimiter.consume(clientIp)) {
                return sendJsonResponse(res, 429, { error: 'Too many requests. Please try again later.' });
            }
        }
    }

    // Admin login API
    if (pathname === '/api/admin/login' && req.method === 'POST') {
        // Apply rate limiting
        const clientIp = req.socket.remoteAddress;
        if (!rateLimiter.consume(clientIp)) {
            return sendJsonResponse(res, 429, { error: 'Too many login attempts. Please try again later.' });
        }
        try {
            const body = await parseJsonRequest(req);
            const { username, password } = body;
            
            // Find user
            const user = adminUsers.find(u => u.username === username);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return sendJsonResponse(res, 401, { error: 'Invalid credentials' });
            }
            
            // Update last login
            user.lastLogin = new Date().toISOString();
            
            // Generate token
            const token = generateToken(user);
            
            // Return token and user info (without password)
            const { password: _, ...userWithoutPassword } = user;
            return sendJsonResponse(res, 200, { 
                token,
                user: userWithoutPassword 
            });
            
        } catch (error) {
            return sendJsonResponse(res, 400, { error: error.message });
        }
    }
    
    // Apply rate limiting to API endpoints
    if (pathname.startsWith('/api/')) {
        const clientIp = req.socket.remoteAddress;
        if (!apiLimiter.consume(clientIp)) {
            return sendJsonResponse(res, 429, { error: 'Too many requests. Please try again later.' });
        }
    }

    // Verify token
    if (pathname === '/api/admin/verify' && req.method === 'GET') {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return sendJsonResponse(res, 401, { valid: false, error: 'No token provided' });
            }
            
            const token = authHeader.split(' ')[1];
            const [_, encodedPayload] = token.split('.');
            const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());
            
            // In a real app, you would also verify the signature and expiration
            return sendJsonResponse(res, 200, { 
                valid: true, 
                user: { 
                    id: payload.sub, 
                    username: payload.username, 
                    role: payload.role 
                } 
            });
            
        } catch (error) {
            return sendJsonResponse(res, 401, { valid: false, error: error.message });
        }
    }
    
    // Get app settings (protected)
    if (pathname === '/api/admin/settings' && req.method === 'GET') {
        try {
            // Verify token first
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return sendJsonResponse(res, 401, { error: 'Unauthorized' });
            }
            
            // In a real app, verify the token and check permissions
            return sendJsonResponse(res, 200, appSettings);
            
        } catch (error) {
            return sendJsonResponse(res, 500, { error: 'Failed to load settings' });
        }
    }
    
    // Update app settings (protected)
    if (pathname === '/api/admin/settings' && req.method === 'POST') {
        try {
            // Verify token first
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return sendJsonResponse(res, 401, { error: 'Unauthorized' });
            }
            
            const updates = await parseJsonRequest(req);
            
            // Update settings
            appSettings = { 
                ...appSettings, 
                ...updates,
                updatedAt: new Date().toISOString(),
                updatedBy: 'admin' // In a real app, get from token
            };
            
            return sendJsonResponse(res, 200, { 
                success: true, 
                message: 'Settings updated successfully' 
            });
            
        } catch (error) {
            return sendJsonResponse(res, 400, { error: error.message });
        }
    }

    // Admin stats API (protected)
    if (pathname === '/api/admin/stats' && req.method === 'GET') {
        try {
            // Verify token first
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return sendJsonResponse(res, 401, { error: 'Unauthorized' });
            }
            
            // In a real app, verify the token and check permissions
            
            // Calculate active sessions (last 30 minutes)
            const activeThreshold = 30 * 60 * 1000; // 30 minutes
            const now = new Date();
            const activeSessions = trackingData.sessions.filter(session => {
                const lastActive = new Date(session.lastActive || session.startTime);
                return (now - lastActive) < activeThreshold;
            });
            
            // Get most used tool
            let topTool = '';
            let maxUsage = 0;
            for (const [tool, count] of Object.entries(trackingData.toolUsage || {})) {
                if (count > maxUsage) {
                    maxUsage = count;
                    topTool = tool;
                }
            }
            
            // Get recent activities
            const recentActivities = trackingData.activities
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10);
            
            // Get error statistics
            const errorStats = trackingData.errors.reduce((acc, error) => {
                acc[error.type] = (acc[error.type] || 0) + 1;
                return acc;
            }, {});
            
            // Prepare response
            const stats = {
                general: {
                    totalUsers: trackingData.sessions.length,
                    activeSessions: activeSessions.length,
                    topTool,
                    topToolUsage: maxUsage,
                    errorsLast24h: trackingData.errors.filter(
                        e => (now - new Date(e.timestamp)) < (24 * 60 * 60 * 1000)
                    ).length
                },
                usage: {
                    toolUsage: trackingData.toolUsage || {},
                    activityByHour: getActivityByHour(),
                    activityByDay: getActivityByDay()
                },
                recentActivities,
                errorStats,
                system: {
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage(),
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch
                }
            };
            
            return sendJsonResponse(res, 200, stats);
            
        } catch (error) {
            console.error('Error generating admin stats:', error);
            return sendJsonResponse(res, 500, { error: 'Failed to generate stats' });
        }

    }

    // Handle tracking API
    if (pathname === '/api/track' && req.method === 'POST') {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', async () => {
            try {
                const data = JSON.parse(Buffer.concat(body).toString());
                const timestamp = new Date().toISOString();
                
                // Track tool usage
                if (data.tool) {
                    trackingData.toolUsage[data.tool] = (trackingData.toolUsage[data.tool] || 0) + 1;
                    
                    // Log activity
                    trackingData.activities.push({
                        type: 'tool_usage',
                        tool: data.tool,
                        timestamp,
                        sessionId: data.sessionId,
                        userId: data.userId
                    });
                }
                
                // Track page views
                if (data.pageName) {
                    trackingData.activities.push({
                        type: 'page_view',
                        page: data.pageName,
                        timestamp,
                        sessionId: data.sessionId,
                        userId: data.userId
                    });
                }
                
                // Track errors
                if (data.error) {
                    trackingData.errors.push({
                        ...data.error,
                        timestamp,
                        sessionId: data.sessionId,
                        userId: data.userId
                    });
                }
                
                // Update or create session
                if (data.sessionId) {
                    let session = trackingData.sessions.find(s => s.id === data.sessionId);
                    
                    if (!session) {
                        // New session
                        session = {
                            id: data.sessionId,
                            userId: data.userId,
                            userAgent: data.userAgent,
                            ip: req.socket.remoteAddress,
                            startTime: timestamp,
                            lastActive: timestamp,
                            pageViews: 0,
                            events: []
                        };
                        trackingData.sessions.push(session);
                    } else {
                        // Update existing session
                        session.lastActive = timestamp;
                        if (data.pageName) {
                            session.currentPage = data.pageName;
                            session.pageViews = (session.pageViews || 0) + 1;
                        }
                    } else if (data.isNewSession) {
                        trackingData.sessions.push({
                            id: data.sessionId,
                            startTime: new Date().toISOString(),
                            lastActive: new Date().toISOString(),
                            userAgent: data.userAgent,
                            pageViews: 1,
                            currentPage: data.pageName || ''
                        });
                    }
                }
                
                // Log activity
                if (data.activity) {
                    trackingData.activities.push({
                        timestamp: new Date().toISOString(),
                        sessionId: data.sessionId,
                        ...data.activity
                    });
                    
                    // Keep only the last 1000 activities
                    if (trackingData.activities.length > 1000) {
                        trackingData.activities = trackingData.activities.slice(-1000);
                    }
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('Error processing tracking data:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    } else if (pathname === '/admin') {
        filePath = './admin-dashboard.html';
    }

    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Read file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Page not found
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('404 Not Found', 'utf-8');
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            // Success
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Service-Worker-Allowed': '/'
            });
            res.end(content, 'utf-8');
        }
    });
});

// Add rate limiter for login attempts
const rateLimiter = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // Max login attempts per windowMs
    attempts: new Map(),
    
    consume(ip) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        // Remove old attempts
        if (this.attempts.has(ip)) {
            this.attempts.set(ip, this.attempts.get(ip).filter(time => time > windowStart));
        } else {
            this.attempts.set(ip, []);
        }
        
        const attempts = this.attempts.get(ip);
        
        if (attempts.length >= this.maxAttempts) {
            return false;
        }
        
        attempts.push(now);
        return true;
    }
};

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // In production, log to a file or monitoring service
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, log to a file or monitoring service
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // In production, log to a file or monitoring service
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, log to a file or monitoring service
});

// Error handling for server startup
const onError = (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

    // Handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

// Event listener for HTTP server "listening" event
const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Server listening on ${bind}`);
    console.log(`Available at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop the server');
    
    // Security check for default credentials
    if (process.env.NODE_ENV === 'production' && 
        (ADMIN_USERNAME === 'admin' || ADMIN_PASSWORD === 'admin123')) {
        console.warn('\x1b[33m%s\x1b[0m', 'WARNING: Using default admin credentials in production is not secure!');
        console.warn('\x1b[33m%s\x1b[0m', 'Please change ADMIN_USERNAME and ADMIN_PASSWORD in your .env file');
    }
};

// Start the server with enhanced error handling
console.log('Starting server...');
try {
    console.log(`Attempting to start server on port ${PORT}...`);
    server.listen(PORT, '0.0.0.0')
        .on('error', (error) => {
            console.error('Server error:', error);
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please stop any other servers using this port.`);
            } else {
                console.error('Failed to start server:', error.message);
            }
            process.exit(1);
        })
        .on('listening', () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log('Press Ctrl+C to stop the server');
            
            // Security check for default credentials
            if (process.env.NODE_ENV === 'production' && 
                (ADMIN_USERNAME === 'admin' || ADMIN_PASSWORD === 'admin123')) {
                console.warn('\x1b[33m%s\x1b[0m', 'WARNING: Using default admin credentials in production is not secure!');
                console.warn('\x1b[33m%s\x1b[0m', 'Please change ADMIN_USERNAME and ADMIN_PASSWORD in your .env file');
            }
        });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}
